import { useState } from 'react';

import { Participant } from '../types';
import { duckColor } from '../utils/duckColor';
import { DismissButton } from './DismissButton';

const CLEAR_CONFIRM_MS = 3000;

interface ParticipantEditorProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

export const ParticipantEditor: React.FC<ParticipantEditorProps> = ({
  participants,
  setParticipants,
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
    <section aria-labelledby="participants-title" className="flex min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 id="participants-title" className="font-display text-xl">
          Concorrenti
        </h3>
        <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-black text-white">
          {participants.length}
        </span>
      </div>

      <div className="mb-3 space-y-2">
        <label htmlFor="new-participants" className="sr-only">
          Nuovi concorrenti
        </label>
        <textarea
          id="new-participants"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Nomi separati da virgola o a capo"
          className="h-16 w-full resize-none rounded-xl border-2 border-ink/20 bg-white p-2.5 text-sm font-semibold placeholder:text-ink/45 focus:border-water focus:outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="w-full min-h-11 rounded-full border-3 border-ink bg-water font-display text-lg text-white shadow-sticker transition-transform active:translate-y-0.5 disabled:opacity-50"
        >
          Aggiungi
        </button>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto rounded-xl border-2 border-ink/15 bg-white py-1">
        {participants.map((p, i) => (
          <li
            key={p.id}
            className="mx-1 flex items-center gap-3 rounded-xl px-3 py-1.5 hover:bg-foam/40"
          >
            <span
              className="size-3 shrink-0 rounded-full border-2 border-ink"
              style={{ backgroundColor: duckColor(i) }}
            />
            <span className="flex-1 truncate text-sm font-bold">{p.name}</span>
            <DismissButton
              label={`Rimuovi ${p.name}`}
              onClick={() => handleRemove(p.id)}
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
        <div className="pt-2 text-center">
          <button
            onClick={handleClearClick}
            className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors ${
              isConfirmingClear
                ? 'bg-coral text-white'
                : 'text-ink/50 hover:text-coral'
            }`}
          >
            {isConfirmingClear ? 'Confermi?' : 'Svuota tutto'}
          </button>
        </div>
      )}
    </section>
  );
};
