import type { Participant, PlayerOdds } from '../types';

interface LiveTickerProps {
  participants: Participant[];
  odds: PlayerOdds[];
}

const getDelta = (participantId: string): { value: number; direction: 'up' | 'down' | 'flat' } => {
  let seed = 0;
  for (let i = 0; i < participantId.length; i++) seed += participantId.charCodeAt(i);
  seed = (seed * 16807) % 2147483647;
  const val = Math.round(((seed % 50) / 100) * 10) / 10;
  const dir = seed % 3 === 0 ? 'up' : seed % 3 === 1 ? 'down' : 'flat';
  return { value: val, direction: dir };
};

export const LiveTicker: React.FC<LiveTickerProps> = ({ participants, odds }) => {
  const items = participants.map((p) => {
    const bestOdds = odds
      .filter((o) => o.participantId === p.id)
      .sort((a, b) => a.odds - b.odds)[0];
    const delta = getDelta(p.id);
    return { name: p.name, odds: bestOdds?.odds ?? 0, delta };
  });

  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-rule bg-void/80">
      <div className="flex gap-8 whitespace-nowrap animate-ticker py-1.5 px-4">
        {doubled.map((item, i) => (
          <span key={i} className="font-mono text-[11px] tracking-[0.04em] inline-flex items-center gap-1.5">
            <span className="text-ink-2">{item.name}</span>
            <span className="text-ink font-semibold tabular-nums">{item.odds.toFixed(1)}x</span>
            {item.delta.direction !== 'flat' ? (
              <span className={`text-[10px] tabular-nums ${
                item.delta.direction === 'up' ? 'text-ok' : 'text-err'
              }`}>
                {item.delta.direction === 'up' ? '▲' : '▼'}{item.delta.value.toFixed(1)}
              </span>
            ) : (
              <span className="text-[10px] text-ink-4 tabular-nums">◆0.0</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
