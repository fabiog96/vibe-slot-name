import { CommentaryLine } from '../types';
import { formatSeconds } from '../utils/formatSeconds';

interface CommentaryFeedProps {
  lines: CommentaryLine[];
}

export const CommentaryFeed: React.FC<CommentaryFeedProps> = ({ lines }) => (
  <div className="h-full flex flex-col overflow-hidden rounded-2xl border-3 border-ink bg-ink text-white">
    <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3">
      <span className="rounded-md bg-coral px-2 py-0.5 text-[11px] font-black tracking-[0.15em]">
        LIVE
      </span>
      <h2 className="font-display text-xl">Telecronaca</h2>
    </div>
    <ol aria-live="polite" className="flex-1 min-h-0 space-y-1 overflow-y-auto p-2">
      {lines.map((line, i) => (
        <li
          key={line.id}
          className={`flex gap-2.5 rounded-lg px-2.5 py-1.5 ${
            i === 0 ? 'animate-slide-in bg-white/10' : 'opacity-70'
          }`}
        >
          <span className="shrink-0 pt-0.5 text-[11px] font-black tabular-nums text-foam">
            {formatSeconds(line.seconds)}
          </span>
          <span className="text-sm font-bold leading-snug">{line.text}</span>
        </li>
      ))}
    </ol>
  </div>
);
