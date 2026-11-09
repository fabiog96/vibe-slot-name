import { DuckView, Participant, RacePhase } from '../types';
import { duckColor } from '../utils/duckColor';
import { RacingDuck } from './RacingDuck';

const DUCK_SIZE = 44;
const FINISH_GAP = 24;
const TRAVEL = `(100cqw - ${DUCK_SIZE + FINISH_GAP}px)`;

interface RaceTrackProps {
  participants: Participant[];
  ducks: DuckView[];
  finishers: string[];
  phase: RacePhase;
}

export const RaceTrack: React.FC<RaceTrackProps> = ({
  participants,
  ducks,
  finishers,
  phase,
}) => {
  const duckById = new Map(ducks.map((d) => [d.id, d]));
  const isRacing = phase === 'racing';

  return (
    <div className="h-full rounded-2xl border-3 border-ink overflow-y-auto bg-water">
      <div className="min-h-full flex flex-col">
        {participants.map((p, i) => {
          const duck = duckById.get(p.id);
          const rank = finishers.indexOf(p.id);

          return (
            <div key={p.id} className="flex-1 min-h-11 flex">
              <div className="w-20 sm:w-28 shrink-0 dock-planks bg-dock flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 border-b border-black/20">
                <span
                  className="size-2.5 shrink-0 rounded-full border-[1.5px] border-ink"
                  style={{ backgroundColor: duckColor(i) }}
                />
                <span className="truncate text-xs sm:text-sm font-black text-dock-ink">
                  {p.name}
                </span>
              </div>

              <div
                className={`@container relative flex-1 water-ripples border-b border-dashed border-white/25 ${
                  i % 2 ? 'bg-water-alt' : 'bg-water'
                } ${isRacing ? 'animate-flow' : ''}`}
              >
                <div
                  className="absolute left-0 top-[58%] h-1 origin-left rounded-full bg-linear-to-r from-white/0 to-white/55"
                  style={{
                    width: `calc${TRAVEL}`,
                    transform: `scaleX(${duck?.progress ?? 0})`,
                  }}
                />

                <RacingDuck
                  duck={duck}
                  bandana={duckColor(i)}
                  size={DUCK_SIZE}
                  travel={TRAVEL}
                  isRacing={isRacing}
                />

                {rank >= 0 && (
                  <span
                    style={{ right: DUCK_SIZE + FINISH_GAP + 6 }}
                    className={`absolute top-1/2 -translate-y-1/2 animate-pop rounded-lg border-2 border-ink px-2 font-display text-sm text-ink ${
                      rank === 0 ? 'bg-duck' : 'bg-silver'
                    }`}
                  >
                    {rank + 1}°
                  </span>
                )}

                <div className="absolute inset-y-0 right-3 w-3 finish-line" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
