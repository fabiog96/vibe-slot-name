import { useState } from 'react';

import { Participant } from '../types';
import { duckColor } from '../utils/duckColor';
import { DismissButton } from './DismissButton';

const CLEAR_CONFIRM_MS = 3000;

interface ParticipantPanelProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  isLocked: boolean;
}

export const ParticipantPanel: React.FC<ParticipantPanelProps> = ({
  participants,
  setParticipants,
  isLocked,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const handleAdd = () => {
    const names = inputValue
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    if (names.length === 0) return;

    setParticipants((prev) => [
      ...prev,
      ...names.map((name) => ({ id: crypto.randomUUID(), name })),
    ]);
    setInputValue('');
  };

  const handleRemove = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearClick = () => {
    if (isConfirmingClear) {
      setParticipants([]);
      setIsConfirmingClear(false);
      return;
    }
    setIsConfirmingClear(true);
    setTimeout(() => setIsConfirmingClear(false), CLEAR_CONFIRM_MS);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border-3 border-ink bg-paper text-ink">
      <div className="flex items-center justify-between border-b-2 border-ink/10 px-4 py-3">
        <h2 className="font-display text-xl">Concorrenti</h2>
        <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-black text-white">
          {participants.length}
        </span>
      </div>

      <div className="space-y-2 border-b-2 border-ink/10 p-3">
        <label htmlFor="new-participants" className="sr-only">
          Nuovi concorrenti
        </label>
        <textarea
          id="new-participants"
          value={inputValue}
          disabled={isLocked}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Nomi separati da virgola o a capo"
          className="h-16 w-full resize-none rounded-xl border-2 border-ink/20 bg-white p-2.5 text-sm font-semibold placeholder:text-ink/45 focus:border-water focus:outline-none disabled:opacity-60"
        />
        <button
          onClick={handleAdd}
          disabled={isLocked || !inputValue.trim()}
          className="w-full min-h-11 rounded-full border-3 border-ink bg-water font-display text-lg text-white shadow-sticker transition-transform active:translate-y-0.5 disabled:opacity-50"
        >
          Aggiungi
        </button>
      </div>

      <ul className="flex-1 min-h-0 overflow-y-auto py-1">
        {participants.map((p, i) => (
          <li
            key={p.id}
            className="group mx-1 flex items-center gap-3 rounded-xl px-3 py-1.5 hover:bg-foam/40"
          >
            <span
              className="size-3 shrink-0 rounded-full border-2 border-ink"
              style={{ backgroundColor: duckColor(i) }}
            />
            <span className="flex-1 truncate text-sm font-bold">{p.name}</span>
            <DismissButton
              label={`Rimuovi ${p.name}`}
              onClick={() => handleRemove(p.id)}
              disabled={isLocked}
            />
          </li>
        ))}

        {participants.length === 0 && (
          <li className="py-10 text-center text-sm font-bold text-ink/50">
            Nessuna paperella in acqua
          </li>
        )}
      </ul>

      {participants.length > 0 && (
        <div className="border-t-2 border-ink/10 px-4 py-2.5 text-center">
          <button
            onClick={handleClearClick}
            disabled={isLocked}
            className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 ${
              isConfirmingClear
                ? 'bg-coral text-white'
                : 'text-ink/50 hover:text-coral'
            }`}
          >
            {isConfirmingClear ? 'Confermi?' : 'Svuota tutto'}
          </button>
        </div>
      )}
    </div>
  );
};
