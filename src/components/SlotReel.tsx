import { useEffect, useState } from 'react';

import { Participant } from '../types';

interface SlotReelProps {
  label: string;
  slotNumber: number;
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
  slotNumber,
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
      : '---';

  const hasResult = target && !internalSpinning;
  const showPlaceholder = !target && !internalSpinning;

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="font-body text-xs font-bold tracking-[0.12em] uppercase text-neon-cyan glow-cyan">
          &#9670; {label}
        </span>
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-4">
          SLOT {String(slotNumber).padStart(2, '0')}
        </span>
      </div>

      {/* Reel box */}
      <div
        className={`
          relative w-full h-[120px] overflow-hidden scanlines
          flex items-center justify-center
          transition-all duration-300
          ${internalSpinning
            ? 'border border-neon-cyan shadow-[0_0_12px_oklch(0.80_0.14_195/0.2),inset_0_0_20px_oklch(0.80_0.14_195/0.08)]'
            : hasResult
              ? 'border border-neon-magenta shadow-[0_0_12px_oklch(0.62_0.26_12/0.2),inset_0_0_20px_oklch(0.62_0.26_12/0.08)]'
              : 'border border-neon-cyan/60 shadow-[0_0_8px_oklch(0.80_0.14_195/0.12),inset_0_0_16px_oklch(0.80_0.14_195/0.06)]'
          }
        `}
        style={{ background: 'var(--void)' }}
      >
        {/* Reel fades */}
        <div className="reel-fade-top absolute top-0 left-0 w-full h-6 pointer-events-none z-20" />
        <div className="reel-fade-bottom absolute bottom-0 left-0 w-full h-6 pointer-events-none z-20" />

        {/* Payline — magenta glow line through center */}
        <div
          className="absolute left-0 right-0 top-1/2 h-[2px] z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, oklch(0.62 0.26 12 / 0.6) 10%, oklch(0.62 0.26 12 / 0.6) 90%, transparent)',
            boxShadow: '0 0 8px oklch(0.62 0.26 12 / 0.4), 0 0 20px oklch(0.62 0.26 12 / 0.15)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 px-4 text-center">
          {showPlaceholder ? (
            <span
              className="font-body text-3xl font-bold text-neon-magenta/50 tracking-[0.08em] italic"
              style={{ textShadow: '0 0 10px oklch(0.62 0.26 12 / 0.3)' }}
            >
              ?????
            </span>
          ) : (
            <span
              className={`
                font-body text-2xl font-bold whitespace-nowrap uppercase tracking-[0.06em]
                transition-all duration-100
                ${internalSpinning
                  ? 'text-neon-cyan/60 blur-[2px]'
                  : 'text-neon-magenta glow-magenta'
                }
              `}
            >
              {currentName}
            </span>
          )}
        </div>
      </div>

      {/* Respin */}
      <div className="mt-1.5 h-5 flex justify-center items-center">
        {!internalSpinning && showRespin && onRespin ? (
          <button
            onClick={onRespin}
            className="text-ink-4 hover:text-neon-cyan p-1 hover:bg-neon-cyan/10 transition-all duration-300 transform hover:rotate-180"
            title="Respin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
};
