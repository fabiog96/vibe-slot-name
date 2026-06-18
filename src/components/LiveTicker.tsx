import { Participant } from '../types';

interface LiveTickerProps {
  participants: Participant[];
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ participants }) => {
  const items =
    participants.length > 0
      ? participants.map((p) => p.name.trim())
      : ['// awaiting signals //'];

  // Doubled track so the -50% scroll loops seamlessly
  const track = [...items, ...items];

  return (
    <div className="relative z-10 h-7 overflow-hidden border-b border-line bg-void flex items-center">
      <span className="shrink-0 font-mono text-[9px] tracking-[0.24em] uppercase px-3 h-full flex items-center bg-cyan-deep text-void font-bold">
        ◆ LIVE
      </span>
      <div className="overflow-hidden flex-1">
        <div className="cb-ticker-track px-4">
          {track.map((name, i) => (
            <span key={i} className="font-mono text-[10px] tracking-[0.12em] uppercase text-text-2">
              <span className="text-magenta-soft mr-1.5">▸</span>
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
