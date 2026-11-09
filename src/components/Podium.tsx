import { Placement } from '../types';

const STEP_BY_RANK = [
  'h-40 w-36 sm:h-56 sm:w-60 bg-duck',
  'h-32 w-32 sm:h-44 sm:w-52 bg-silver',
  'h-28 w-28 sm:h-36 sm:w-48 bg-bronze',
];
const STEP_DEFAULT = 'h-24 w-28 sm:h-32 sm:w-44 bg-paper';

interface PodiumProps {
  placements: Placement[];
}

export const Podium: React.FC<PodiumProps> = ({ placements }) => {
  const ranked = placements.map((placement, rank) => ({ placement, rank }));
  const podiumOrder =
    ranked.length > 1 ? [ranked[1], ranked[0], ...ranked.slice(2)] : ranked;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-ink/55 p-4">
      <div className="animate-rise flex flex-wrap items-end justify-center gap-3.5">
        {podiumOrder.map(({ placement, rank }) => (
          <div
            key={placement.role.id}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-3 border-ink text-ink shadow-sticker-lg ${
              STEP_BY_RANK[rank] ?? STEP_DEFAULT
            }`}
          >
            <span className="font-display text-3xl sm:text-4xl">{rank + 1}°</span>
            <span className="max-w-full truncate px-2 text-xl font-black sm:text-3xl">
              {placement.participant.name}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-75 sm:text-xs">
              {placement.role.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
