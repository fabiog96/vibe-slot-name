import { useState } from 'react';

import { Participant } from '../types';
import { HexChip } from './HexChip';

interface ControlPanelProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

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
    <div className="cb-panel cb-frame cyan notch-all h-full flex flex-col overflow-hidden">
      {/* Section head */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-line">
        <div className="flex items-center gap-2.5">
          <span className="cb-section-bar" />
          <h2 className="font-display text-[13px] font-bold tracking-[0.18em] uppercase cb-glow-cyan">
            Runners
          </h2>
        </div>
        <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-text-3 border border-line px-2 py-0.5">
          {String(participants.length).padStart(2, '0')} ON
        </span>
      </div>

      {/* Input */}
      <div className="p-3 space-y-2 border-b border-line">
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
            placeholder="// inject runners //"
            className="w-full bg-void border border-line hover:border-line-2 focus:border-cyan rounded-none p-2.5 text-text-0 text-sm font-mono focus:outline-none resize-none h-16 transition-colors placeholder:text-text-3"
          />
          <span className="absolute bottom-2 right-2 font-mono text-[9px] text-text-3 pointer-events-none">
            ↵ ADD
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="cb-btn cyan w-full"
        >
          + Inject
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0 py-1">
        {participants.map((p, i) => (
          <div
            key={p.id}
            className="group flex items-center gap-3 px-3 py-2 mx-1 my-0.5 border border-transparent hover:border-line hover:bg-bg-1/60 transition-colors"
          >
            <span className="font-mono text-[9px] text-text-3 w-5 text-right tabular-nums shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <HexChip name={p.name} size={28} />
            <span className="text-sm text-text-1 font-medium truncate flex-1">
              {p.name.trim()}
            </span>
            <button
              onClick={() => handleRemove(p.id)}
              className="w-6 h-6 flex items-center justify-center text-transparent group-hover:text-text-3 hover:!text-loss transition-all"
              aria-label="Remove"
            >
              ✕
            </button>
          </div>
        ))}

        {participants.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10 gap-2">
            <span className="font-mono text-[11px] tracking-widest text-text-3 uppercase">
              // awaiting signals //
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      {participants.length > 0 && (
        <div className="px-4 py-2.5 border-t border-line text-center">
          <button
            onClick={handleClearClick}
            className={`
              font-mono text-[10px] tracking-[0.18em] uppercase transition-all px-3 py-1
              ${isConfirmingClear
                ? 'text-loss border border-loss cb-glow-loss'
                : 'text-text-3 hover:text-loss'
              }
            `}
          >
            {isConfirmingClear ? 'CONFIRM PURGE?' : 'PURGE ALL'}
          </button>
        </div>
      )}
    </div>
  );
};
