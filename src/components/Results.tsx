import { Arrival, Placement, Role } from '../types';
import { formatSeconds } from '../utils/formatSeconds';

const ROLE_CARD = ['bg-duck', 'bg-silver', 'bg-bronze'];
const ROLE_CARD_DEFAULT = 'bg-white';

interface ResultsProps {
  roles: Role[];
  arrivals: Arrival[];
  placements: Placement[];
  unavailableIds: string[];
  onToggleAvailability: (id: string) => void;
}

export const Results: React.FC<ResultsProps> = ({
  roles,
  arrivals,
  placements,
  unavailableIds,
  onToggleAvailability,
}) => {
  const roleByParticipant = new Map(
    placements.map((p) => [p.participant.id, p.role.name]),
  );

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-ink/60 p-3 sm:p-6">
      <div className="animate-rise flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl border-3 border-ink bg-paper text-ink shadow-sticker-lg">
        <div className="grid grid-cols-2 gap-2 border-b-2 border-ink/10 p-3 sm:gap-3 sm:p-4">
          {roles.map((role, i) => {
            const placement = placements.find((p) => p.role.id === role.id);
            return (
              <div
                key={role.id}
                className={`min-w-0 rounded-xl border-3 border-ink px-3 py-2 sm:px-4 sm:py-3 ${
                  ROLE_CARD[i] ?? ROLE_CARD_DEFAULT
                }`}
              >
                <p className="truncate text-[10px] font-black uppercase tracking-[0.15em] opacity-75 sm:text-xs">
                  {role.name}
                </p>
                {placement ? (
                  <>
                    <p className="truncate font-display text-xl leading-tight sm:text-3xl">
                      {placement.participant.name}
                    </p>
                    <p className="text-xs font-bold opacity-75">
                      {placement.arrival.place}° · {formatSeconds(placement.arrival.seconds)}
                    </p>
                  </>
                ) : (
                  <p className="py-2 text-sm font-bold">Nessuno disponibile</p>
                )}
              </div>
            );
          })}
        </div>

        <ol className="flex-1 min-h-0 overflow-y-auto p-2" aria-label="Ordine d'arrivo">
          {arrivals.map((arrival) => {
            const isOut = unavailableIds.includes(arrival.id);
            const role = roleByParticipant.get(arrival.id);
            return (
              <li
                key={arrival.id}
                className="flex items-center gap-3 rounded-xl px-3 py-1 hover:bg-foam/40"
              >
                <span className="w-7 shrink-0 text-right font-display text-lg">
                  {arrival.place}
                </span>
                <span
                  className={`flex-1 truncate font-bold ${isOut ? 'text-ink/40 line-through' : ''}`}
                >
                  {arrival.name}
                </span>
                {role && (
                  <span className="hidden rounded-full bg-ink px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white sm:inline">
                    {role}
                  </span>
                )}
                <span className="w-14 shrink-0 text-right text-xs font-bold tabular-nums text-ink/60">
                  {formatSeconds(arrival.seconds)}
                </span>
                <button
                  onClick={() => onToggleAvailability(arrival.id)}
                  className={`min-h-9 w-24 shrink-0 rounded-full border-2 text-xs font-black transition-colors ${
                    isOut
                      ? 'border-water text-water hover:bg-water hover:text-white'
                      : 'border-ink/20 text-ink/60 hover:border-coral hover:text-coral'
                  }`}
                >
                  {isOut ? 'Riammetti' : 'Non c’è'}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
