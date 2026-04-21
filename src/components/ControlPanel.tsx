import { useState } from 'react';

import { Participant } from '../types';

interface ControlPanelProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

const CHIP_COLORS = [
  'bg-red-500/80',
  'bg-blue-500/80',
  'bg-emerald-500/80',
  'bg-amber-500/80',
  'bg-purple-500/80',
  'bg-pink-500/80',
  'bg-cyan-500/80',
];

const getChipColor = (index: number) => CHIP_COLORS[index % CHIP_COLORS.length];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  participants,
  setParticipants,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const handleAdd = () => {
    if (!inputValue.trim()) return;

    const names = inputValue
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    const newParticipants = names.map((name) => ({
      id: crypto.randomUUID(),
      name,
    }));

    setParticipants((prev) => [...prev, ...newParticipants]);
    setInputValue('');
  };

  const handleRemove = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearClick = () => {
    if (isConfirmingClear) {
      setParticipants([]);
      setIsConfirmingClear(false);
    } else {
      setIsConfirmingClear(true);
      setTimeout(() => setIsConfirmingClear(false), 3000);
    }
  };

  return (
    <div className="bg-paper border-2 border-accent/20 rounded-2xl h-full flex flex-col overflow-hidden shadow-sm">
      {/* Header — VIP List */}
      <div className="bg-accent-ink px-5 py-4 text-center relative overflow-hidden">
        {/* Decorative stars */}
        <span className="absolute top-1 left-3 text-accent/30 text-[10px]">&#9733;</span>
        <span className="absolute top-2 right-4 text-accent/20 text-[8px]">&#9733;</span>
        <span className="absolute bottom-1 left-8 text-accent/15 text-[6px]">&#9733;</span>

        <h2 className="font-display text-lg font-bold text-paper italic tracking-tight">
          VIP List
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="w-6 h-px bg-accent/30" />
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-paper/40">
            {participants.length} player{participants.length !== 1 ? 's' : ''}
          </span>
          <div className="w-6 h-px bg-accent/30" />
        </div>
      </div>

      {/* Input */}
      <div className="p-3 space-y-2 border-b border-rule">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Add names..."
            className="w-full bg-paper-2 border border-rule hover:border-rule-strong focus:border-accent rounded-lg p-2.5 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-wash resize-none h-16 transition-colors placeholder:text-ink-4"
          />
          <div className="absolute bottom-1.5 right-2 font-mono text-[9px] text-ink-4 pointer-events-none">
            &crarr; add
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="w-full py-2.5 bg-accent-ink text-paper text-xs font-mono tracking-[0.15em] uppercase rounded-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed"
        >
          Add Player
        </button>
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto min-h-0 py-1">
        {participants.map((p, i) => (
          <div
            key={p.id}
            className="group flex items-center gap-3 px-3 py-2.5 mx-1.5 my-0.5 rounded-lg hover:bg-paper-2 transition-colors"
          >
            {/* Casino chip number */}
            <div className={`
              w-7 h-7 rounded-full ${getChipColor(i)} text-white
              flex items-center justify-center shrink-0
              text-[10px] font-bold font-mono
              border-2 border-dashed border-white/30
              shadow-sm
            `}>
              {i + 1}
            </div>

            {/* Name */}
            <span className="text-sm text-ink font-medium truncate flex-1">
              {p.name}
            </span>

            {/* Remove */}
            <button
              onClick={() => handleRemove(p.id)}
              className="w-6 h-6 flex items-center justify-center rounded-full text-transparent group-hover:text-ink-4 hover:!text-err hover:!bg-err/10 transition-all"
              aria-label="Remove"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}

        {participants.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10 gap-2">
            <span className="text-2xl opacity-30">&#127920;</span>
            <p className="text-ink-4 text-xs italic">No players yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {participants.length > 0 && (
        <div className="px-4 py-2.5 border-t border-rule text-center">
          <button
            onClick={handleClearClick}
            className={`
              font-mono text-[10px] tracking-wider uppercase transition-all px-3 py-1 rounded
              ${isConfirmingClear
                ? 'bg-err text-white font-medium animate-pulse'
                : 'text-ink-4 hover:text-err'
              }
            `}
          >
            {isConfirmingClear ? 'Confirm?' : 'Clear all'}
          </button>
        </div>
      )}
    </div>
  );
};
