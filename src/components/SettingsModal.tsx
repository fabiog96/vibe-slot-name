import { useState } from 'react';

import { Role } from '../types';
import { DismissButton } from './DismissButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  roles,
  setRoles,
}) => {
  const [newRoleName, setNewRoleName] = useState('');

  if (!isOpen) return null;

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    setRoles((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newRoleName.trim() },
    ]);
    setNewRoleName('');
  };

  const handleRemoveRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRename = (id: string, name: string) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="roles-title"
        className="animate-rise flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border-3 border-ink bg-paper text-ink shadow-sticker-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-ink/10 px-5 py-3.5">
          <h2 id="roles-title" className="font-display text-2xl">
            Ruoli
          </h2>
          <DismissButton label="Chiudi" onClick={onClose} />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-3 text-sm font-semibold text-ink/70">
            L'ordine dei ruoli segue l'ordine d'arrivo: il primo ruolo va alla
            prima paperella al traguardo.
          </p>

          <ol className="mb-4 space-y-2">
            {roles.map((role, i) => (
              <li
                key={role.id}
                className="flex items-center gap-3 rounded-xl border-2 border-ink/15 bg-white px-3 py-2"
              >
                <span className="w-6 text-right font-display text-lg">
                  {i + 1}ª
                </span>
                <input
                  type="text"
                  value={role.name}
                  aria-label={`Nome del ruolo ${i + 1}`}
                  onChange={(e) => handleRename(role.id, e.target.value)}
                  className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
                />
                <DismissButton
                  label={`Rimuovi ${role.name}`}
                  onClick={() => handleRemoveRole(role.id)}
                />
              </li>
            ))}

            {roles.length === 0 && (
              <li className="py-6 text-center text-sm font-bold text-ink/50">
                Nessun ruolo: aggiungine almeno uno
              </li>
            )}
          </ol>

          <div className="flex gap-2">
            <label htmlFor="new-role" className="sr-only">
              Nuovo ruolo
            </label>
            <input
              id="new-role"
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
              placeholder="Nuovo ruolo"
              className="flex-1 rounded-xl border-2 border-ink/20 bg-white px-3 py-2 text-sm font-semibold placeholder:text-ink/45 focus:border-water focus:outline-none"
            />
            <button
              onClick={handleAddRole}
              disabled={!newRoleName.trim()}
              className="min-h-11 rounded-full border-3 border-ink bg-water px-5 font-display text-white disabled:opacity-50"
            >
              Aggiungi
            </button>
          </div>
        </div>

        <div className="border-t-2 border-ink/10 px-5 py-3 text-right">
          <button
            onClick={onClose}
            className="min-h-11 rounded-full border-3 border-ink bg-duck px-6 font-display text-lg shadow-sticker transition-transform active:translate-y-0.5"
          >
            Fatto
          </button>
        </div>
      </div>
    </div>
  );
};
