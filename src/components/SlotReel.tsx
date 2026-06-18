import { useEffect, useState } from 'react';

import { Participant } from '../types';

interface SlotReelProps {
  label: string;
  participants: Participant[];
  target: Participant | null;
  isSpinning: boolean;
  delay?: number;
  onStop?: () => void;
  showRespin?: boolean;
  onRespin?: () => void;
}

export const SlotReel: React.FC<SlotReelProps> = ({
  label,
  participants,
  target,
  isSpinning,
  delay = 0,
  onStop,
  showRespin = false,
  onRespin,
}) => {
  const [displayIndex, setDisplayIndex] = useState(
    Math.floor(Math.random() * Math.max(participants.length, 1)),
  );
  const [internalSpinning, setInternalSpinning] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    if (isSpinning) {
      setInternalSpinning(true);
    } else if (internalSpinning && target) {
      timeoutId = window.setTimeout(() => {
        setInternalSpinning(false);
        const targetIndex = participants.findIndex((p) => p.id === target.id);
        if (targetIndex !== -1) {
          setDisplayIndex(targetIndex);
        }
        if (onStop) onStop();
      }, delay);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSpinning, target, delay, internalSpinning, participants, onStop]);

  useEffect(() => {
    let intervalId: number;

    if (internalSpinning && participants.length > 0) {
      intervalId = window.setInterval(() => {
        setDisplayIndex((prev) => (prev + 1) % participants.length);
      }, 50);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [internalSpinning, participants.length]);

  const currentParticipant = participants[displayIndex];
  const currentName = currentParticipant
    ? currentParticipant.name.trim()
    : participants.length > 0
      ? participants[0].name.trim()
      : '???';

  const hasResult = target && !internalSpinning;

  return (
    <div className="flex flex-col items-center w-44 relative">
      {/* Role label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="cb-section-bar cyan h-2.5" />
        <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-text-2">
          {label}
        </span>
      </div>

      {/* Reel window */}
      <div
        className={`
          cb-reel w-full h-24 flex items-center justify-center notch
          ${hasResult ? 'result' : ''}
        `}
      >
        {/* Top/bottom void fades */}
        <div className="absolute top-0 left-0 w-full h-7 bg-gradient-to-b from-void to-transparent pointer-events-none z-[4]" />
        <div className="absolute bottom-0 left-0 w-full h-7 bg-gradient-to-t from-void to-transparent pointer-events-none z-[4]" />

        {participants.length === 0 ? (
          <span className="font-mono text-text-3 text-[11px] uppercase tracking-widest z-[5]">
            // no signal //
          </span>
        ) : internalSpinning ? (
          <div className="cb-reel-strip flex flex-col items-center z-0">
            {[...participants, ...participants].map((p, i) => (
              <span
                key={`${p.id}-${i}`}
                className="font-display text-xl font-bold text-cyan-soft/70 h-12 flex items-center whitespace-nowrap"
              >
                {p.name.trim()}
              </span>
            ))}
          </div>
        ) : !target ? (
          <span className="font-display text-3xl font-black text-text-3 z-[5]">?</span>
        ) : (
          <span className="font-display text-[26px] font-black cb-glow-magenta whitespace-nowrap z-[5] cb-slide-up">
            {currentName}
          </span>
        )}
      </div>

      {/* Respin */}
      <div className="mt-2 h-6 flex justify-center items-center">
        {!internalSpinning && showRespin && onRespin ? (
          <button
            onClick={onRespin}
            className="font-mono text-[9px] tracking-[0.2em] uppercase text-text-3 hover:text-cyan-soft transition-colors px-2 py-1 border border-line hover:border-cyan flex items-center gap-1.5"
            title="Re-roll this reel"
          >
            <span className="text-xs leading-none">⟳</span> RE-ROLL
          </button>
        ) : (
          <span className="text-magenta/40 text-xs">▲</span>
        )}
      </div>
    </div>
  );
};
