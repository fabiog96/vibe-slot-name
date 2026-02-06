import React, { useEffect, useState } from 'react';
import { Participant } from '../types';

interface SlotReelProps {
  label: string;
  participants: Participant[];
  target: Participant | null;
  isSpinning: boolean; // Signals whether the 'main' power is on
  delay?: number; // Delay before stopping after power is cut
  onStop?: () => void;
  showRespin?: boolean;
  onRespin?: () => void;
}

const SlotReel: React.FC<SlotReelProps> = ({ 
  label, 
  participants, 
  target, 
  isSpinning, 
  delay = 0,
  onStop,
  showRespin = false,
  onRespin
}) => {
  const [displayIndex, setDisplayIndex] = useState(Math.floor(Math.random() * participants.length));
  const [internalSpinning, setInternalSpinning] = useState(false);

  
  // Effect 1: Handle the control signal (start/stop sequence)
  useEffect(() => {
    let timeoutId: number;

    if (isSpinning) {
      // Start spinning immediately when signaled
      setInternalSpinning(true);
    } else if (internalSpinning && target) {
      // If signal is cut but we are currently spinning, wait for the delay
      timeoutId = window.setTimeout(() => {
        setInternalSpinning(false);
        
        // Land on target
        const targetIndex = participants.findIndex(p => p.id === target.id);
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


  // Effect 2: Handle the visual animation loop based on internal state
  useEffect(() => {
    let intervalId: number;

    if (internalSpinning && participants.length > 0) {
      intervalId = window.setInterval(() => {
        setDisplayIndex((prev) => (prev + 1) % participants.length);
      }, 50); // Speed of cycling
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [internalSpinning, participants.length]);

  // Safe access to current participant to prevent crashes if list changes/shrinks
  const currentParticipant = participants[displayIndex];
  // Fallback if index is out of bounds (e.g. list shrank) or list is empty
  const currentName = currentParticipant 
    ? currentParticipant.name 
    : (participants.length > 0 ? participants[0].name : "???");

  return (
    <div className="flex flex-col items-center w-full max-w-xs mx-2 relative group/reel">
      <h3 className="text-xl font-display text-amber-400 mb-2 tracking-wider uppercase text-shadow">
        {label}
      </h3>
      <div className={`
        relative w-full h-32 bg-slate-800 border-4 border-amber-600 rounded-lg overflow-hidden shadow-2xl
        flex items-center justify-center
        transition-all duration-300
        ${internalSpinning ? 'shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'shadow-[0_0_10px_rgba(0,0,0,0.5)]'}
      `}>
        {/* Decorative gloss effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10"></div>

        {/* The Text */}
        <div className="z-0 px-4 text-center">
            {participants.length === 0 ? (
                <span className="text-slate-500 italic">Add Names</span>
            ) : !target ? (
                <span className="text-2xl md:text-3xl font-bold font-display text-slate-500 italic whitespace-nowrap">
                    Ready
                </span>
            ) : (
                <span className={`
                    text-2xl md:text-3xl font-bold font-display text-white whitespace-nowrap slot-text-shadow
                    transition-all duration-75
                    ${internalSpinning ? 'blur-[1px] opacity-80 scale-95' : 'blur-0 opacity-100 scale-110 text-amber-100'}
                `}>
                    {currentName}
                </span>
            )}
        </div>
      </div>
      
      {/* Indicator Arrow or Respin Button */}
      <div className="mt-2 h-8 flex justify-center items-center">
         {!internalSpinning && showRespin && onRespin ? (
             <button 
                onClick={onRespin}
                className="bg-slate-700 hover:bg-amber-600 text-amber-500 hover:text-white rounded-full p-2 transition-all transform hover:rotate-180 duration-500 shadow-lg border border-slate-600"
                title="Respin this only"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </button>
         ) : (
            <div className="text-amber-500 text-2xl animate-pulse">▲</div>
         )}
      </div>
    </div>
  );
};

export default SlotReel;
