import { Arrival, DuckView, Participant, RacePhase } from '../types';
import { duckColor } from '../utils/duckColor';
import { formatSeconds } from '../utils/formatSeconds';
import { RacingDuck } from './RacingDuck';

const DUCK_SIZE = 44;
const FINISH_GAP = 24;
const TRAVEL = `(100cqw - ${DUCK_SIZE + FINISH_GAP}px)`;
const PLACE_CHIP = ['bg-duck', 'bg-silver', 'bg-bronze'];
const PLACE_CHIP_DEFAULT = 'bg-paper';

interface RaceTrackProps {
  participants: Participant[];
  ducks: DuckView[];
  arrivals: Arrival[];
  phase: RacePhase;
}

export const RaceTrack: React.FC<RaceTrackProps> = ({
  participants,
  ducks,
  arrivals,
  phase,
}) => {
  const duckById = new Map(ducks.map((d) => [d.id, d]));
  const arrivalById = new Map(arrivals.map((a) => [a.id, a]));
  const isRacing = phase === 'racing';

  return (
    <div className="h-full rounded-2xl border-3 border-ink overflow-y-auto bg-water">
      <div className="min-h-full flex flex-col">
        {participants.map((p, i) => {
          const duck = duckById.get(p.id);
          const arrival = arrivalById.get(p.id);

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

                {arrival && (
                  <span
                    style={{ right: DUCK_SIZE + FINISH_GAP + 6 }}
                    className={`absolute top-1/2 flex -translate-y-1/2 animate-pop items-baseline gap-1.5 rounded-lg border-2 border-ink px-2 text-ink ${
                      PLACE_CHIP[arrival.place - 1] ?? PLACE_CHIP_DEFAULT
                    }`}
                  >
                    <span className="font-display text-lg leading-6">{arrival.place}</span>
                    <span className="text-xs font-black tabular-nums">
                      {formatSeconds(arrival.seconds)}
                    </span>
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
