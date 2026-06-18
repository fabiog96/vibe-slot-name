interface OddsBarProps {
  probability: number;
  odds: number;
}

export const OddsBar: React.FC<OddsBarProps> = ({ probability, odds }) => (
  <div className="flex items-center gap-2">
    <div className="odds-bar flex-1">
      <div className="odds-bar-fill" style={{ width: `${Math.min(probability * 100, 100)}%` }} />
    </div>
    <span className={`font-mono text-[10px] font-semibold tabular-nums ${
      odds >= 5 ? 'text-bet-win' : odds >= 2 ? 'text-neon-cyan' : 'text-neon-amber'
    }`}>
      {odds.toFixed(1)}x
    </span>
  </div>
);
