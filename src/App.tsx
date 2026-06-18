import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

import { GameState } from './types';
import { MOCK_PARTICIPANTS, MOCK_ROLES, MOCK_LEADERBOARD, MOCK_USER } from './services/mockData';
import { Header, SlotMachine, Footer, LiveTicker, ResultOverlay } from './components';
import { BettingModal, Leaderboard } from './components/betting';
import { useSlotMachine } from './hooks/useSlotMachine';
import { useBetting } from './hooks/useBetting';
import { useCountdown } from './hooks/useCountdown';
import { useEasterEggs } from './hooks/useEasterEggs';

const BETTING_SECONDS = 120;

export const App: React.FC = () => {
  const [roles] = useState(MOCK_ROLES);
  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const {
    gameState, spinResult, announcement, activeReelIds, isGameActive,
    bettingEndsAt, handleFullSpin, handleExecuteSpin, handleDirectSpin,
    handleRespin, handleReelStop, handleReset,
  } = useSlotMachine(MOCK_PARTICIPANTS, roles);

  const {
    userChips, activeBets, betResults, odds, isBankrupt,
    totalStaked, totalPotentialPayout,
    refreshOdds, placeBet, removeBet, evaluateResults, resetBets,
  } = useBetting();

  const countdown = useCountdown(bettingEndsAt, BETTING_SECONDS);
  const { konamiActive, jackpotMode, handleLogoClick } = useEasterEggs(handleDirectSpin);

  // When entering BETTING state, refresh odds
  useEffect(() => {
    if (gameState === GameState.BETTING) {
      refreshOdds();
    }
  }, [gameState, refreshOdds]);

  // Countdown expired → close modal, start spin
  useEffect(() => {
    if (gameState === GameState.BETTING && countdown.isExpired) {
      setIsBettingModalOpen(false);
      handleExecuteSpin();
    }
  }, [gameState, countdown.isExpired, handleExecuteSpin]);

  // Evaluate bets on result
  useEffect(() => {
    if (gameState === GameState.RESULT && betResults.length === 0 && activeBets.length > 0) {
      evaluateResults(spinResult, roles);
    }
  }, [gameState, betResults.length, activeBets.length, evaluateResults, spinResult, roles]);

  // "INITIATE ROUND" → enter betting + open modal
  const handleInitiateRound = () => {
    handleFullSpin();
    setIsBettingModalOpen(true);
  };

  // "READY" → close modal, start spin
  const handleReady = () => {
    setIsBettingModalOpen(false);
    handleExecuteSpin();
  };

  const handleNewRound = () => {
    resetBets();
    handleReset();
  };

  const leaderboardWithUser = MOCK_LEADERBOARD.map((entry) =>
    entry.userId === MOCK_USER.id ? { ...entry, chips: userChips } : entry,
  );

  const showResult = gameState === GameState.RESULT;

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${jackpotMode ? 'jackpot-mode' : ''} ${konamiActive ? 'konami-active' : ''}`}>
      {(showResult || konamiActive) && (
        <Confetti
          recycle={false}
          numberOfPieces={konamiActive ? 400 : 150}
          gravity={konamiActive ? 0.05 : 0.1}
          colors={konamiActive
            ? ['#ff2a6d', '#05d9e8', '#a855f7', '#ccff00', '#ffb800', '#39ff14']
            : ['#ff2a6d', '#05d9e8', '#a855f7', '#ccff00', '#ffb800']
          }
          opacity={konamiActive ? 0.9 : 0.6}
        />
      )}

      {/* Result overlay */}
      {showResult && (
        <ResultOverlay
          spinResult={spinResult}
          roles={roles}
          betResults={betResults}
          userChips={userChips}
          onNewRound={handleNewRound}
        />
      )}

      {/* Betting modal */}
      <BettingModal
        isOpen={isBettingModalOpen}
        onClose={() => setIsBettingModalOpen(false)}
        participants={MOCK_PARTICIPANTS}
        roles={roles}
        odds={odds}
        activeBets={activeBets}
        userChips={userChips}
        isBankrupt={isBankrupt}
        totalStaked={totalStaked}
        totalPotentialPayout={totalPotentialPayout}
        secondsLeft={countdown.secondsLeft}
        totalSeconds={countdown.totalSeconds}
        formatted={countdown.formatted}
        onPlaceBet={placeBet}
        onRemoveBet={removeBet}
        onReady={handleReady}
      />

      <Leaderboard
        entries={leaderboardWithUser}
        currentUserId={MOCK_USER.id}
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <Header
        isGameActive={isGameActive}
        jackpotMode={jackpotMode}
        userChips={userChips}
        isBankrupt={isBankrupt}
        onLogoClick={handleLogoClick}
        onLeaderboardOpen={() => setIsLeaderboardOpen(true)}
      />

      <LiveTicker participants={MOCK_PARTICIPANTS} odds={odds} />

      <main className="flex-1 min-h-0 flex items-center justify-center px-4 md:px-8 py-4 md:py-6">
        <SlotMachine
          roles={roles}
          participants={MOCK_PARTICIPANTS}
          gameState={gameState}
          spinResult={spinResult}
          activeReelIds={activeReelIds}
          isGameActive={isGameActive}
          userChips={userChips}
          activeBetCount={activeBets.length}
          countdownSeconds={countdown.secondsLeft}
          countdownTotal={countdown.totalSeconds}
          countdownFormatted={countdown.formatted}
          onSpin={handleInitiateRound}
          onOpenBetting={() => setIsBettingModalOpen(true)}
          onSpinNow={handleReady}
          onRespin={handleRespin}
          onReelStop={handleReelStop}
        />
      </main>

      <Footer lastResult={spinResult} roles={roles} />
    </div>
  );
};
