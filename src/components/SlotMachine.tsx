import { Participant, Role, SpinResult, GameState } from '../types';
import { SlotReel } from './SlotReel';
import { CountdownTimer } from './betting/CountdownTimer';

interface SlotMachineProps {
  roles: Role[];
  participants: Participant[];
  gameState: GameState;
  spinResult: SpinResult;
  activeReelIds: string[];
  isGameActive: boolean;
  userChips: number;
  activeBetCount: number;
  countdownSeconds: number;
  countdownTotal: number;
  countdownFormatted: string;
  onSpin: () => void;
  onOpenBetting: () => void;
  onSpinNow: () => void;
  onRespin: (roleId: string) => void;
  onReelStop: () => void;
}

const STATUS_CONFIG = {
  [GameState.IDLE]: { color: 'bg-neon-cyan', label: 'STANDBY', pulse: false },
  [GameState.BETTING]: { color: 'bg-neon-magenta', label: 'BETS LIVE', pulse: true },
  [GameState.SPINNING]: { color: 'bg-neon-acid', label: 'EXECUTING', pulse: true },
  [GameState.STOPPING]: { color: 'bg-neon-acid', label: 'EXECUTING', pulse: true },
  [GameState.RESULT]: { color: 'bg-ok', label: 'RESOLVED', pulse: false },
} as const;

export const SlotMachine: React.FC<SlotMachineProps> = ({
  roles,
  participants,
  gameState,
  spinResult,
  activeReelIds,
  isGameActive,
  userChips,
  activeBetCount,
  countdownSeconds,
  countdownTotal,
  countdownFormatted,
  onSpin,
  onOpenBetting,
  onSpinNow,
  onRespin,
  onReelStop,
}) => {
  const isSpinning = gameState === GameState.SPINNING || gameState === GameState.STOPPING;
  const isBetting = gameState === GameState.BETTING;
  const status = STATUS_CONFIG[gameState];

  return (
    <div className={`w-full max-w-2xl ${gameState === GameState.RESULT ? 'machine-winner' : ''}`}>
      {/* Status bar */}
      <div
        className="flex items-center justify-between px-5 py-3 border border-b-0 border-frame bg-surface/60"
        style={{
          borderTopColor: 'oklch(0.50 0.22 340)',
          borderTopWidth: '2px',
          boxShadow: '0 -1px 12px oklch(0.50 0.22 340 / 0.12)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${status.color} transition-colors duration-300 ${
            status.pulse ? 'animate-neon-pulse' : ''
          }`} style={{ boxShadow: status.pulse ? '0 0 6px currentColor' : 'none' }} />
          <span className="font-body text-sm font-bold tracking-[0.12em] uppercase text-ink">
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.1em] text-ink-3 tabular-nums">
          <span>EVT·WK17·R1</span>
          <span>POOL <span className="text-neon-cyan">₡{String(userChips).padStart(4, '0')}</span></span>
          <span>BETS <span className="text-neon-amber">{activeBetCount}</span></span>
        </div>
      </div>

      {/* Countdown during betting */}
      {isBetting && (
        <div className="px-5 py-2 border-x border-frame bg-surface/30">
          <CountdownTimer secondsLeft={countdownSeconds} totalSeconds={countdownTotal} formatted={countdownFormatted} />
        </div>
      )}

      {/* Reels area */}
      <div className="px-5 py-6 border-x border-frame bg-void-2/50">
        {roles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-ink-4 text-sm font-mono tracking-wider">// NO ROLES CONFIGURED //</p>
          </div>
        ) : (
          <div className="flex gap-4">
            {roles.map((role, index) => {
              const reelDelay = activeReelIds.length === 1 ? 1500 : 1500 + index * 1000;
              return (
                <SlotReel
                  key={role.id}
                  label={role.name}
                  slotNumber={index + 1}
                  participants={participants}
                  target={spinResult[role.id] || null}
                  isSpinning={gameState === GameState.SPINNING && activeReelIds.includes(role.id)}
                  delay={reelDelay}
                  onStop={onReelStop}
                  showRespin={gameState === GameState.RESULT}
                  onRespin={() => onRespin(role.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="px-5 py-4 border border-t-0 border-frame bg-surface/30">
        {isBetting ? (
          <div className="flex gap-3">
            <button
              onClick={onOpenBetting}
              className="flex-1 py-3.5 font-body text-sm font-bold tracking-[0.12em] uppercase text-white transition-all duration-200 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, oklch(0.62 0.26 12), oklch(0.60 0.24 295))',
                boxShadow: '0 0 16px oklch(0.62 0.26 12 / 0.25)',
              }}
            >
              &#9670; OPEN MARKETS
            </button>
            <button
              onClick={onSpinNow}
              className="py-3.5 px-5 border border-frame font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all active:scale-[0.98]"
            >
              SKIP
            </button>
          </div>
        ) : (
          <button
            onClick={onSpin}
            disabled={isSpinning || participants.length < roles.length || roles.length === 0}
            className={`
              w-full py-3.5 font-body text-sm font-bold tracking-[0.12em] uppercase
              transition-all duration-200 transform
              ${participants.length < roles.length || roles.length === 0
                ? 'bg-surface text-ink-4 cursor-not-allowed'
                : isSpinning
                  ? 'bg-surface text-ink-4 scale-[0.98] cursor-wait'
                  : 'text-white active:scale-[0.98]'
              }
            `}
            style={
              !isSpinning && participants.length >= roles.length && roles.length > 0
                ? {
                    background: 'linear-gradient(135deg, oklch(0.62 0.26 12), oklch(0.60 0.24 295))',
                    boxShadow: '0 0 16px oklch(0.62 0.26 12 / 0.25)',
                  }
                : undefined
            }
          >
            {isSpinning ? '⚡ RNG EXECUTING ⚡' : '▶ INITIATE ROUND'}
          </button>
        )}
      </div>
    </div>
  );
};
