import { useState } from 'react';
import Confetti from 'react-confetti';

import { Participant, GameState, Role } from './types';
import {
  SlotReel,
  ControlPanel,
  SettingsModal,
  HexChip,
  Header,
  LiveTicker,
  Footer,
} from './components';
import { useSlotMachine } from './hooks/useSlotMachine';
import { useEasterEggs } from './hooks/useEasterEggs';

const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Capra' },
  { id: '2', name: 'Mapelli' },
  { id: '3', name: 'Baccini' },
  { id: '4', name: 'Farinato' },
  { id: '5', name: 'Yang' },
  { id: '6', name: 'Agati' },
  { id: '7', name: 'Olivieri' },
  { id: '8', name: 'Petta' },
  { id: '9', name: 'Cariato' },
  { id: '10', name: 'Gioia' },
  { id: '11', name: 'Manduca' },
];

const DEFAULT_ROLES: Role[] = [
  { id: 'r1', name: 'Moderator' },
  { id: 'r2', name: 'Notary' },
];

const CONFETTI_NEON = ['#ff2a6d', '#05d9e8', '#ccff00', '#a855f7', '#39ff14'];

const STATUS: Record<GameState, { label: string; color: string }> = {
  [GameState.IDLE]: { label: 'STANDBY', color: 'text-cyan' },
  [GameState.SPINNING]: { label: 'EXECUTING', color: 'text-acid' },
  [GameState.STOPPING]: { label: 'LOCKING', color: 'text-amber' },
  [GameState.RESULT]: { label: 'JACKPOT LOCKED', color: 'text-win' },
};

export const App: React.FC = () => {
  const [participants, setParticipants] =
    useState<Participant[]>(DEFAULT_PARTICIPANTS);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    gameState,
    spinResult,
    announcement,
    activeReelIds,
    isGameActive,
    handleFullSpin,
    handleRespin,
    handleReelStop,
  } = useSlotMachine(participants, roles);

  const { konamiActive, jackpotMode, handleLogoClick } =
    useEasterEggs(handleFullSpin);

  const status = STATUS[gameState];
  const canSpin = participants.length >= roles.length && roles.length > 0;

  const spinLabel =
    gameState === GameState.RESULT
      ? '▶ NEXT ROUND'
      : isGameActive
        ? '⚡ RNG EXECUTING ⚡'
        : '▶ INITIATE ROUND';

  return (
    <div
      className={`cb-bg cb-grid h-screen flex flex-col overflow-hidden ${jackpotMode ? 'jackpot-mode' : ''} ${konamiActive ? 'konami-active' : ''}`}
    >
      {(gameState === GameState.RESULT || konamiActive) && (
        <Confetti
          recycle={false}
          numberOfPieces={konamiActive ? 400 : 180}
          gravity={konamiActive ? 0.05 : 0.12}
          colors={CONFETTI_NEON}
          opacity={0.85}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        roles={roles}
        setRoles={setRoles}
      />

      <Header
        participantCount={participants.length}
        roleCount={roles.length}
        isGameActive={isGameActive}
        jackpotMode={jackpotMode}
        onLogoClick={handleLogoClick}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <LiveTicker participants={participants} />

      {/* ── Main shell ── */}
      <main className="relative z-10 flex-1 min-h-0 px-4 md:px-8 py-4 md:py-6 flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-7xl mx-auto w-full overflow-hidden">

        {/* Left rail */}
        <div className="w-full lg:w-72 xl:w-80 min-h-0 order-2 lg:order-1 shrink-0 lg:h-full">
          <ControlPanel
            participants={participants}
            setParticipants={setParticipants}
          />
        </div>

        {/* Center: cyber slot */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center order-1 lg:order-2 overflow-hidden">
          <div className="w-full max-w-2xl cb-panel cb-frame notch-all">

            {/* Status bar */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-line bg-void/60">
              <div className={`flex items-center gap-2.5 ${status.color}`}>
                <span className="cb-live-dot" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase">
                  {status.label}
                </span>
              </div>
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-text-3">
                EVT·WK01·R01
              </span>
            </div>

            {/* Reel viewport */}
            <div className="cb-grid p-4 md:p-6">
              {roles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-text-3 mb-3">
                    // no roles configured //
                  </p>
                  <button onClick={() => setIsSettingsOpen(true)} className="cb-btn cyan">
                    Open Config
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center items-start gap-5 md:gap-8">
                  {roles.map((role, index) => {
                    const reelDelay =
                      activeReelIds.length === 1 ? 1500 : 1500 + index * 1000;

                    return (
                      <SlotReel
                        key={role.id}
                        label={role.name}
                        participants={participants}
                        target={spinResult[role.id] || null}
                        isSpinning={
                          gameState === GameState.SPINNING &&
                          activeReelIds.includes(role.id)
                        }
                        delay={reelDelay}
                        onStop={handleReelStop}
                        showRespin={gameState === GameState.RESULT}
                        onRespin={() => handleRespin(role.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Spin control */}
            <div className="px-4 md:px-6 py-4 border-t border-line flex justify-center">
              <button
                onClick={handleFullSpin}
                disabled={isGameActive || !canSpin}
                className={`cb-btn ${gameState === GameState.RESULT ? 'cyan' : 'primary'} px-12 text-[12px]`}
              >
                {spinLabel}
              </button>
            </div>
          </div>

          {/* Result banner */}
          <div className="mt-4 w-full max-w-2xl min-h-[52px] flex items-center justify-center text-center px-4">
            {gameState === GameState.RESULT && (
              <div className="cb-slide-up w-full cb-panel cb-frame win notch px-5 py-4">
                <p className="font-display text-[11px] font-bold tracking-[0.2em] uppercase cb-glow-win mb-2">
                  ━━━ ROUND COMPLETE ━━━
                </p>
                {announcement ? (
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                    {roles.map((r) => {
                      const w = spinResult[r.id];
                      if (!w) return null;
                      return (
                        <span key={r.id} className="flex items-center gap-2">
                          <HexChip name={w.name} size={26} />
                          <span className="text-left leading-tight">
                            <span className="block font-mono text-[8px] tracking-[0.2em] uppercase text-text-3">
                              {r.name}
                            </span>
                            <span className="block font-display text-sm font-bold text-text-0">
                              {w.name.trim()}
                            </span>
                          </span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex justify-center gap-2 py-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="cb-live-dot text-win"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
