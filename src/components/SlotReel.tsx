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
    Math.floor(Math.random() * participants.length),
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
    ? currentParticipant.name
    : participants.length > 0
      ? participants[0].name
      : '???';

  const hasResult = target && !internalSpinning;

  return (
    <div className="flex flex-col items-center w-40 relative">
      {/* Role label with decorative diamonds */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-accent/25 text-[7px]">&#9830;</span>
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-3 font-medium">
          {label}
        </span>
        <span className="text-accent/25 text-[7px]">&#9830;</span>
      </div>

      {/* Reel window */}
      <div
        className={`
          reel-card relative w-full h-20 rounded-xl overflow-hidden
          flex items-center justify-center
          transition-all duration-400
          ${internalSpinning ? 'active' : ''}
          ${hasResult ? 'result' : ''}
        `}
      >
        {/* Top/bottom fades */}
        <div className="absolute top-0 left-0 w-full h-5 bg-gradient-to-b from-paper-2 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-full h-5 bg-gradient-to-t from-paper-2 to-transparent pointer-events-none z-10" />

        {/* Center line indicator */}
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-px bg-accent/10 z-10 pointer-events-none" />

        {/* Name */}
        <div className="z-0 px-4 text-center">
          {participants.length === 0 ? (
            <span className="text-ink-4 text-xs italic">Add players</span>
          ) : !target ? (
            <span className="font-display text-xl text-ink-4 italic">
              ?
            </span>
          ) : (
            <span
              className={`
                font-display text-base md:text-lg font-bold whitespace-nowrap
                transition-all duration-100
                ${internalSpinning
                  ? 'text-ink-3 blur-[1.5px] opacity-50'
                  : 'text-ink blur-0 opacity-100'
                }
              `}
            >
              {currentName}
            </span>
          )}
        </div>
      </div>

      {/* Respin */}
      <div className="mt-1.5 h-6 flex justify-center items-center">
        {!internalSpinning && showRespin && onRespin ? (
          <button
            onClick={onRespin}
            className="text-ink-4 hover:text-accent p-1.5 rounded-full hover:bg-accent-wash transition-all duration-300 transform hover:rotate-180 border border-transparent hover:border-accent/20"
            title="Respin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        ) : (
          <div className="text-accent/20 text-xs">&#9650;</div>
        )}
      </div>
    </div>
  );
};
