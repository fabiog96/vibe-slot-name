import { useState } from 'react';

import { Role } from '../types';
import { DismissButton } from './DismissButton';

interface RoleEditorProps {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export const RoleEditor: React.FC<RoleEditorProps> = ({ roles, setRoles }) => {
  const [newRoleName, setNewRoleName] = useState('');

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
    <section aria-labelledby="roles-title">
      <h3 id="roles-title" className="mb-3 font-display text-xl">
        Ruoli
      </h3>
      <p className="mb-3 text-sm font-semibold text-ink/70">
        I ruoli si assegnano dal fondo: il primo ruolo va all'ultima paperella
        che tocca, il secondo alla penultima.
      </p>

      <ol className="mb-4 space-y-2">
        {roles.map((role, i) => (
          <li
            key={role.id}
            className="flex items-center gap-3 rounded-xl border-2 border-ink/15 bg-white px-3 py-2"
          >
            <span className="w-6 text-right font-display text-lg">{i + 1}ª</span>
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
          className="min-w-0 flex-1 rounded-xl border-2 border-ink/20 bg-white px-3 py-2 text-sm font-semibold placeholder:text-ink/45 focus:border-water focus:outline-none"
        />
        <button
          onClick={handleAddRole}
          disabled={!newRoleName.trim()}
          className="min-h-11 rounded-full border-3 border-ink bg-water px-5 font-display text-white disabled:opacity-50"
        >
          Aggiungi
        </button>
      </div>
    </section>
  );
};
