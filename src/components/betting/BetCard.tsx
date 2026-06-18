import { OddsBar } from './OddsBar';

interface BetCardProps {
  participantName: string;
  odds: number;
  probability: number;
  isSelected: boolean;
  amount: number;
  potentialPayout: number;
  disabled: boolean;
  onToggle: () => void;
  onAmountChange: (amount: number) => void;
}

export const BetCard: React.FC<BetCardProps> = ({
  participantName,
  odds,
  probability,
  isSelected,
  amount,
  potentialPayout,
  disabled,
  onToggle,
  onAmountChange,
}) => (
  <div
    className={`bet-card notch p-3 cursor-pointer ${isSelected ? 'selected' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    onClick={onToggle}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-semibold text-ink uppercase tracking-wider">{participantName}</span>
      <span className={`font-mono text-xs font-bold tabular-nums ${
        odds >= 5 ? 'text-bet-win glow-win' : odds >= 2 ? 'text-neon-cyan glow-cyan' : 'text-neon-amber'
      }`}>
        {odds.toFixed(1)}x
      </span>
    </div>

    <OddsBar probability={probability} odds={odds} />

    {isSelected && (
      <div className="mt-2.5 pt-2.5 border-t border-rule" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.15em]">STAKE</label>
            <input
              type="number"
              min={1}
              max={999}
              value={amount}
              onChange={(e) => onAmountChange(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 bg-void border border-rule px-2 py-1 text-sm font-mono text-neon-cyan text-center tabular-nums focus:outline-none focus:border-neon-cyan"
            />
          </div>
          <span className="font-mono text-xs text-neon-acid glow-acid font-semibold tabular-nums">
            +₡{potentialPayout.toFixed(0)}
          </span>
        </div>
      </div>
    )}
  </div>
);
