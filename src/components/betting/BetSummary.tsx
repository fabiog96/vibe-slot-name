import { useState, useCallback } from 'react';

interface BetSummaryProps {
  betCount: number;
  totalStaked: number;
  totalPotentialPayout: number;
  onConfirm: () => void;
  disabled: boolean;
}

export const BetSummary: React.FC<BetSummaryProps> = ({
  betCount,
  totalStaked,
  totalPotentialPayout,
  onConfirm,
  disabled,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = useCallback(() => {
    onConfirm();
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 800);
  }, [onConfirm]);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-rule bg-void-2">
      <div className="flex items-center gap-3 text-[10px] font-mono">
        <span className="text-ink-3 uppercase tracking-[0.15em]">
          {betCount} BET{betCount !== 1 ? 'S' : ''}
        </span>
        <span className="text-ink-2 tabular-nums">₡{totalStaked}</span>
        {totalPotentialPayout > 0 && (
          <span className="text-neon-acid glow-acid font-semibold tabular-nums">
            +₡{totalPotentialPayout.toFixed(0)}
          </span>
        )}
      </div>
      <button
        onClick={handleConfirm}
        disabled={disabled || betCount === 0}
        className={`font-mono text-[10px] tracking-[0.15em] uppercase px-5 py-2 notch transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
          confirmed
            ? 'bg-ok text-void scale-[0.97]'
            : 'machine-spin-btn text-white'
        }`}
      >
        {confirmed ? 'LOCKED' : '⚡ LOCK & SPIN'}
      </button>
    </div>
  );
};
