import type { LeaderboardEntry } from '../../types';
import { ChipBadge } from './ChipBadge';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

const RANK_COLORS = ['text-neon-acid glow-acid', 'text-neon-cyan glow-cyan', 'text-neon-magenta glow-magenta'];

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currentUserId, isOpen, onClose }) => {
  if (!isOpen) return null;

  const sorted = [...entries].sort((a, b) => b.chips - a.chips);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="modal-overlay fixed inset-0" />
      <div
        className="modal-content animate-modal-enter relative z-10 w-full max-w-md max-h-[85vh] flex flex-col notch-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
          <h2 className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink-2 font-semibold">
            // RANKINGS //
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-ink-4 hover:text-neon-magenta transition-colors font-mono text-sm"
          >
            &#10005;
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {sorted.map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const isBankrupt = entry.chips === 0;

            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                  isCurrentUser ? 'neon-frame' : 'border border-transparent hover:border-rule'
                }`}
              >
                <span className={`w-6 text-center font-mono text-sm font-bold tabular-nums ${
                  index < 3 ? RANK_COLORS[index] : 'text-ink-4'
                }`}>
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate uppercase tracking-wider ${isCurrentUser ? 'text-neon-cyan' : 'text-ink'}`}>
                    {entry.displayName}
                    {isCurrentUser && <span className="text-[10px] text-ink-3 ml-1.5 normal-case tracking-normal">(you)</span>}
                  </p>
                  <p className="font-mono text-[10px] text-ink-4 tabular-nums">
                    W:{entry.totalWins} / L:{entry.totalBets - entry.totalWins}
                    {entry.streak > 0 && <span className="text-neon-amber ml-1.5">&#9889;{entry.streak}</span>}
                  </p>
                </div>

                <ChipBadge chips={entry.chips} size="sm" bankrupt={isBankrupt} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
