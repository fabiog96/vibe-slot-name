import type { SpinResult, Role, BetResult } from '../types';
import { MOCK_PARTICIPANTS } from '../services/mockData';
import { HexChip } from './betting/HexChip';

interface ResultOverlayProps {
  spinResult: SpinResult;
  roles: Role[];
  betResults: BetResult[];
  userChips: number;
  onNewRound: () => void;
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({
  spinResult,
  roles,
  betResults,
  userChips,
  onNewRound,
}) => {
  const chipDelta = betResults.reduce((sum, r) => sum + (r.won ? r.payout : -r.amount), 0);
  const totalWagered = betResults.reduce((sum, r) => sum + r.amount, 0);
  const hits = betResults.filter((r) => r.won).length;
  const misses = betResults.filter((r) => !r.won).length;
  const noBets = betResults.length === 0;

  const winners = roles.map((role) => {
    const winner = spinResult[role.id];
    const participant = winner ? MOCK_PARTICIPANTS.find((p) => p.id === winner.id) : null;
    const pIndex = participant ? MOCK_PARTICIPANTS.indexOf(participant) : 0;
    return { role, participant, pIndex };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-void/85 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-xl mx-4 animate-fade-in-up"
        style={{
          border: '1px solid oklch(0.75 0.22 150 / 0.6)',
          boxShadow: '0 0 24px oklch(0.75 0.22 150 / 0.15), inset 0 0 24px oklch(0.75 0.22 150 / 0.05)',
          background: 'linear-gradient(180deg, oklch(0.12 0.04 290) 0%, oklch(0.08 0.03 290) 100%)',
        }}
      >
        {/* Round complete header */}
        <div className="text-center pt-6 pb-2">
          <p className="font-mono text-[10px] tracking-[0.2em] text-ink-3">
            ━━━━━━━━━ ROUND 1 COMPLETE ━━━━━━━━━
          </p>
        </div>

        {/* Jackpot / delta */}
        <div className="text-center pb-4">
          <span className={`font-body text-3xl font-bold tracking-[0.04em] tabular-nums ${
            chipDelta > 0
              ? 'text-ok glow-win'
              : chipDelta < 0
                ? 'text-err glow-loss'
                : 'text-ok glow-win'
          }`}>
            {chipDelta >= 0 ? '+' : ''}{chipDelta}₡ {chipDelta >= 0 ? 'JACKPOT' : 'LIQUIDATED'}
          </span>
        </div>

        {/* Winners */}
        <div className="flex justify-center gap-8 pb-5">
          {winners.map(({ role, participant, pIndex }) => (
            <div key={role.id} className="flex flex-col items-center gap-1.5">
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-4">{role.name}</span>
              {participant ? (
                <>
                  <HexChip name={participant.name} index={pIndex} size={48} />
                  <span className="font-body text-sm font-bold uppercase tracking-[0.08em] text-neon-magenta glow-magenta">
                    {participant.name}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-12 h-[52px] bg-surface border border-rule flex items-center justify-center"
                    style={{ clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}>
                    <span className="font-mono text-xs text-ink-4">?</span>
                  </div>
                  <span className="font-mono text-xs text-ink-4">---</span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Stats grid */}
        <div className="mx-5 border-t border-frame grid grid-cols-4">
          <div className="py-3 text-center border-r border-frame/50">
            <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink-4 mb-1">WAGERED</p>
            <p className="font-mono text-sm font-bold text-ink tabular-nums">{totalWagered}₡</p>
          </div>
          <div className="py-3 text-center border-r border-frame/50">
            <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink-4 mb-1">HITS</p>
            <p className="font-mono text-sm font-bold text-ok tabular-nums">{hits}</p>
          </div>
          <div className="py-3 text-center border-r border-frame/50">
            <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink-4 mb-1">MISSES</p>
            <p className="font-mono text-sm font-bold text-err tabular-nums">{misses}</p>
          </div>
          <div className="py-3 text-center">
            <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink-4 mb-1">XP GAIN</p>
            <p className="font-mono text-sm font-bold text-neon-acid tabular-nums">+10</p>
          </div>
        </div>

        {/* Spectator message */}
        {noBets && (
          <div className="text-center py-3">
            <span className="font-mono text-[10px] text-ink-4 tracking-[0.1em]">
              // no bets placed · spectator round //
            </span>
          </div>
        )}

        {/* Bottom bar */}
        <div
          className="mx-0 mt-2 px-5 py-3 flex items-center justify-between"
          style={{
            borderTop: '1px solid oklch(0.75 0.22 150 / 0.4)',
            background: 'linear-gradient(90deg, oklch(0.10 0.04 290), oklch(0.14 0.06 295))',
          }}
        >
          <div>
            <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink-4">NEW BALANCE</p>
            <p className="font-body text-lg font-bold text-neon-cyan glow-cyan tabular-nums">{userChips}₡</p>
          </div>
          <button
            onClick={onNewRound}
            className="px-6 py-2.5 font-body text-sm font-bold tracking-[0.1em] uppercase text-white transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, oklch(0.62 0.26 12), oklch(0.60 0.24 295))',
              boxShadow: '0 0 12px oklch(0.62 0.26 12 / 0.3)',
            }}
          >
            ▶ NEXT WEEK
          </button>
        </div>
      </div>
    </div>
  );
};
