import { useState } from 'react';
import Confetti from 'react-confetti';

import { Participant, GameState, Role } from './types';
import { SlotReel, ControlPanel, SettingsModal } from './components';
import { useSlotMachine } from './hooks/useSlotMachine';
import { useTheme } from './hooks/useTheme';

const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Capra ' },
  { id: '2', name: 'Mapelli ' },
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

export const App: React.FC = () => {
  const [participants, setParticipants] =
    useState<Participant[]>(DEFAULT_PARTICIPANTS);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  return (
    <div className="min-h-screen flex flex-col">
      {gameState === GameState.RESULT && (
        <Confetti
          recycle={false}
          numberOfPieces={150}
          gravity={0.1}
          colors={['#c2703e', '#5a8a7a', '#d4a853', '#7a6240', '#3d7a6a']}
          opacity={0.6}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        roles={roles}
        setRoles={setRoles}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ── Header ── */}
      <header className="px-6 md:px-10 pt-6 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-accent text-xl">&#127920;</span>
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-ink tracking-tight italic">
              Vibe Slot Name
            </h1>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-3 mt-0.5">
              Role Assignment Machine
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          disabled={isGameActive}
          className="p-2 text-ink-3 hover:text-accent transition-colors disabled:opacity-20 disabled:cursor-not-allowed rounded-lg hover:bg-paper-2"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      <div className="rule mx-6 md:mx-10" />

      {/* ── Main ── */}
      <main className="flex-1 px-4 md:px-10 py-6 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-10 max-w-7xl mx-auto w-full">

        {/* Left: Participants */}
        <div className="w-full lg:w-80 xl:w-[340px] h-[520px] lg:h-auto order-2 lg:order-1 shrink-0">
          <ControlPanel
            participants={participants}
            setParticipants={setParticipants}
          />
        </div>

        {/* Center: Machine */}
        <div className="flex-1 flex flex-col items-center justify-center order-1 lg:order-2">

          {/* ── THE SLOT MACHINE ── */}
          <div className={`w-full max-w-2xl relative ${gameState === GameState.RESULT ? 'slot-winner' : ''}`}>

            {/* === CROWN / MARQUEE === */}
            <div className="slot-crown relative bg-accent-ink text-white rounded-t-2xl px-6 pt-6 pb-5 text-center border-x-2 border-t-2 border-accent/40 overflow-hidden">
              {/* Corner rivets */}
              <div className="rivet absolute top-3 left-3" />
              <div className="rivet absolute top-3 right-3" />

              {/* Marquee light dots — top row */}
              <div className="absolute top-2.5 left-8 right-8 flex justify-between">
                {Array.from({ length: 11 }).map((_, i) => (
                  <div
                    key={`top-${i}`}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      isGameActive
                        ? 'bg-accent shadow-[0_0_8px_var(--accent)]'
                        : 'bg-accent/20'
                    }`}
                    style={isGameActive ? { animationDelay: `${i * 80}ms`, animation: 'pulse-dot 0.6s ease-in-out infinite' } : undefined}
                  />
                ))}
              </div>

              {/* Bottom marquee row */}
              <div className="absolute bottom-2 left-8 right-8 flex justify-between">
                {Array.from({ length: 11 }).map((_, i) => (
                  <div
                    key={`bot-${i}`}
                    className={`w-1 h-1 rounded-full transition-all duration-300 ${
                      isGameActive
                        ? 'bg-accent shadow-[0_0_6px_var(--accent)]'
                        : 'bg-accent/15'
                    }`}
                    style={isGameActive ? { animationDelay: `${(10 - i) * 80}ms`, animation: 'pulse-dot 0.6s ease-in-out infinite' } : undefined}
                  />
                ))}
              </div>

              {/* Decorative stars */}
              <span className="absolute top-7 left-6 text-accent/25 text-xs">&#9733;</span>
              <span className="absolute top-5 right-7 text-accent/20 text-[10px]">&#9733;</span>

              <div className="mt-1 mb-1">
                <h2 className="font-display text-4xl md:text-5xl font-black italic tracking-tight leading-none">
                  Vibe Slot
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-accent/40 text-[8px]">&#9830;</span>
                  <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-white/50">
                    Name
                  </p>
                  <span className="text-accent/40 text-[8px]">&#9830;</span>
                </div>
              </div>
            </div>

            {/* === MACHINE BODY === */}
            <div className="slot-body relative flex">

              {/* Left side light strip */}
              <div className="hidden md:flex flex-col items-center justify-center gap-3 w-5 bg-accent-ink/5 border-l-2 border-accent/30 py-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={`left-${i}`}
                    className={`side-light ${isGameActive ? 'active' : ''}`}
                    style={isGameActive ? { animationDelay: `${i * 120}ms`, animation: 'pulse-dot 0.8s ease-in-out infinite' } : undefined}
                  />
                ))}
              </div>

              {/* Machine main panel */}
              <div className="flex-1 bg-paper-2 relative">
                {/* Corner rivets */}
                <div className="rivet absolute top-2 left-2 z-10" />
                <div className="rivet absolute top-2 right-2 z-10" />
                <div className="rivet absolute bottom-2 left-2 z-10" />
                <div className="rivet absolute bottom-2 right-2 z-10" />

                {/* Credit & Status display bar */}
                <div className="px-5 py-3 flex items-center justify-between border-b border-rule bg-paper-3/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      isGameActive ? 'bg-accent shadow-[0_0_8px_var(--accent)]' : gameState === GameState.RESULT ? 'bg-teal shadow-[0_0_6px_var(--teal)]' : 'bg-rule'
                    }`} />
                    <span className="font-mono text-[10px] tracking-wider uppercase text-ink-4">
                      {gameState === GameState.IDLE && 'Ready'}
                      {gameState === GameState.SPINNING && 'Spinning...'}
                      {gameState === GameState.STOPPING && 'Stopping...'}
                      {gameState === GameState.RESULT && 'Winner!'}
                    </span>
                  </div>
                  {/* Credits display */}
                  <div className="flex items-center gap-3">
                    <div className="credit-display">
                      <span className="font-mono text-[10px] text-green-400 tracking-wider">
                        CREDIT {String(participants.length).padStart(3, '0')}
                      </span>
                    </div>
                    <div className="credit-display">
                      <span className="font-mono text-[10px] text-amber-400 tracking-wider">
                        BET {String(roles.length).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reel viewport — framed glass panel */}
                <div className="p-4 md:p-6">
                  <div className="reel-viewport p-4 md:p-6">
                    {roles.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-ink-3 text-sm mb-3">No roles configured</p>
                        <button
                          onClick={() => setIsSettingsOpen(true)}
                          className="text-accent text-sm font-medium hover:underline underline-offset-4"
                        >
                          Open Settings
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-0">
                        {/* Left payline arrow */}
                        <div className="payline-arrow left shrink-0 mr-2 hidden md:block" />

                        <div className="flex flex-wrap justify-center items-start gap-3 md:gap-5">
                          {roles.map((role, index) => {
                            const reelDelay =
                              activeReelIds.length === 1
                                ? 1500
                                : 1500 + index * 1000;

                            return (
                              <div key={role.id} className="flex items-start">
                                <SlotReel
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
                                {index < roles.length - 1 && (
                                  <div className="hidden md:block w-px h-20 bg-rule-strong mx-2 mt-8 self-center" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Right payline arrow */}
                        <div className="payline-arrow right shrink-0 ml-2 hidden md:block" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Spin button area */}
                <div className="px-5 md:px-8 pb-5 md:pb-6">
                  <div className="pt-4 border-t border-rule flex items-center justify-center gap-4">
                    {/* Decorative buttons (left) */}
                    <div className="hidden md:flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rule border border-rule-strong" />
                      <div className="w-3 h-3 rounded-full bg-rule border border-rule-strong" />
                    </div>

                    <button
                      onClick={handleFullSpin}
                      disabled={
                        isGameActive ||
                        participants.length < roles.length ||
                        roles.length === 0
                      }
                      className={`
                        px-12 py-3.5 rounded-full font-mono text-xs tracking-[0.2em] uppercase
                        transition-all duration-200 transform
                        ${
                          participants.length < roles.length || roles.length === 0
                            ? 'bg-paper-3 text-ink-4 cursor-not-allowed border border-rule'
                            : isGameActive
                              ? 'bg-accent-wash text-accent/40 border border-accent/20 scale-[0.98] cursor-wait'
                              : 'bg-accent-ink text-white border-2 border-accent/30 hover:border-accent/60 hover:shadow-[0_0_20px_var(--accent-wash)] active:scale-[0.95] shadow-md'
                        }
                      `}
                    >
                      {isGameActive ? 'Spinning...' : 'Spin All'}
                    </button>

                    {/* Decorative buttons (right) */}
                    <div className="hidden md:flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rule border border-rule-strong" />
                      <div className="w-3 h-3 rounded-full bg-rule border border-rule-strong" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side light strip */}
              <div className="hidden md:flex flex-col items-center justify-center gap-3 w-5 bg-accent-ink/5 border-r-2 border-accent/30 py-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={`right-${i}`}
                    className={`side-light ${isGameActive ? 'active' : ''}`}
                    style={isGameActive ? { animationDelay: `${(5 - i) * 120}ms`, animation: 'pulse-dot 0.8s ease-in-out infinite' } : undefined}
                  />
                ))}
              </div>

              {/* === LEVER (right side, desktop only) === */}
              <div className="hidden lg:flex flex-col items-center justify-center w-16 -mr-3 relative">
                {/* Lever mounting plate */}
                <div className="lever-mount w-10 h-8 flex items-center justify-center mb-1">
                  <div className="rivet" />
                </div>

                {/* Lever arm */}
                <div className="lever-track h-28 relative rounded-full">
                  {/* Lever ball handle */}
                  <div
                    className={`
                      lever-ball absolute left-1/2 -translate-x-1/2 w-9 h-9 rounded-full
                      transition-all duration-500 cursor-pointer
                      ${isGameActive ? 'top-[calc(100%-36px)]' : 'top-0 hover:shadow-[0_0_16px_var(--accent-wash)]'}
                    `}
                    onClick={handleFullSpin}
                    title="Pull to spin"
                  />
                </div>

                {/* Bottom mount */}
                <div className="lever-mount w-10 h-4 mt-1" />
              </div>
            </div>

            {/* === BASE / COIN TRAY === */}
            <div className="slot-base bg-paper-3 border-x-2 border-b-2 border-accent/30 rounded-b-2xl overflow-hidden relative">
              {/* Corner rivets */}
              <div className="rivet absolute bottom-3 left-3" />
              <div className="rivet absolute bottom-3 right-3" />

              {/* Payout display */}
              <div className="px-5 py-3 flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-rule" />
                <div className="flex items-center gap-2">
                  <span className="text-accent/30 text-[8px]">&#9733;</span>
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-ink-4">
                    {gameState === GameState.RESULT ? '&#127920; Jackpot! &#127920;' : 'Good Luck!'}
                  </span>
                  <span className="text-accent/30 text-[8px]">&#9733;</span>
                </div>
                <div className="h-px flex-1 bg-rule" />
              </div>

              {/* Coin tray with lip */}
              <div className="mx-auto w-48 mb-3">
                <div className="h-1 bg-rule-strong rounded-t-sm" />
                <div className="h-5 bg-paper-3 border-x border-b border-rule rounded-b-lg shadow-inner flex items-center justify-center">
                  <div className="w-6 h-0.5 bg-rule rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Announcement ── */}
          <div className="mt-6 w-full max-w-xl min-h-[60px] flex items-center justify-center text-center">
            {gameState === GameState.RESULT && (
              <div className="animate-fade-in-up w-full px-6 py-5 bg-accent-wash rounded-xl border-2 border-accent/20 relative overflow-hidden">
                {/* Corner decorations */}
                <span className="absolute top-2 left-3 text-accent/20 text-[10px]">&#9733;</span>
                <span className="absolute top-2 right-3 text-accent/20 text-[10px]">&#9733;</span>
                <span className="absolute bottom-2 left-3 text-accent/20 text-[10px]">&#9733;</span>
                <span className="absolute bottom-2 right-3 text-accent/20 text-[10px]">&#9733;</span>

                {announcement ? (
                  <p className="font-display text-base md:text-lg text-ink-2 italic leading-relaxed">
                    &ldquo;{announcement}&rdquo;
                  </p>
                ) : (
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot"
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

      {/* ── Footer ── */}
      <footer className="py-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-8 h-px bg-rule" />
          <span className="text-accent/20 text-[8px]">&#9733; &#9830; &#9733;</span>
          <div className="w-8 h-px bg-rule" />
        </div>
        <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-ink-4">
          Vibe Slot Name &mdash; What happens in Vegas...
        </p>
      </footer>
    </div>
  );
};
