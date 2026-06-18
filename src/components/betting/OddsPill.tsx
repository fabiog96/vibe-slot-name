interface OddsPillProps {
  odds: number;
  label: string;
  picked: boolean;
  trending?: 'up' | 'down' | null;
  onClick: () => void;
}

export const OddsPill: React.FC<OddsPillProps> = ({ odds, label, picked, trending = null, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative flex flex-col items-center justify-center min-w-[64px] px-2 py-1.5
      border transition-all duration-150 cursor-pointer
      ${picked
        ? 'border-neon-magenta bg-neon-magenta/10 shadow-[0_0_10px_oklch(0.62_0.26_12/0.2)]'
        : 'border-rule bg-surface hover:border-neon-cyan/40 hover:bg-neon-cyan/5'
      }
    `}
  >
    <span className={`font-mono text-base font-bold tabular-nums leading-tight ${
      picked ? 'text-neon-magenta glow-magenta' : 'text-ink'
    }`}>
      {odds.toFixed(1)}x
    </span>
    <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-ink-4 leading-tight">
      {label}
    </span>
    {trending && (
      <span className={`absolute top-0.5 right-1 text-[8px] ${
        trending === 'up' ? 'text-ok' : 'text-err'
      }`}>
        {trending === 'up' ? '▲' : '▼'}
      </span>
    )}
  </button>
);
