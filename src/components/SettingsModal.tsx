import { useState } from 'react';

import { Role } from '../types';
import { Theme } from '../hooks/useTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  theme: Theme;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  roles,
  setRoles,
  theme,
  onToggleTheme,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="bg-paper border border-rule rounded-xl w-full max-w-md shadow-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-rule flex justify-between items-center">
          <h2 className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink-2 font-medium">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-ink-4 hover:text-ink transition-colors rounded-md hover:bg-paper-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">

          {/* ── Theme ── */}
          <div>
            <h3 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-3 mb-3">
              Appearance
            </h3>
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between bg-paper-2 border border-rule rounded-lg px-4 py-3 hover:border-rule-strong transition-colors group"
            >
              <div className="flex items-center gap-3">
                {/* Sun / Moon icon */}
                <div className="text-ink-3 group-hover:text-accent transition-colors">
                  {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-ink-2">Theme</span>
              </div>
              {/* Toggle pill */}
              <div className={`
                relative w-10 h-5 rounded-full transition-colors duration-300
                ${theme === 'dark' ? 'bg-accent' : 'bg-rule-strong'}
              `}>
                <div className={`
                  absolute top-0.5 w-4 h-4 rounded-full bg-paper shadow-sm transition-transform duration-300
                  ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}
                `} />
              </div>
            </button>
          </div>

          {/* ── Roles ── */}
          <div>
            <h3 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-3 mb-3">
              Roles
            </h3>
            <div className="space-y-2 mb-4">
              {roles.map((role, i) => (
                <div
                  key={role.id}
                  className="flex items-center gap-3 bg-paper-2 px-3 py-2.5 rounded-lg border border-rule/50"
                >
                  <span className="font-mono text-[10px] text-ink-4 w-4 text-right tabular-nums shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="text"
                    value={role.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRoles((prev) =>
                        prev.map((r) =>
                          r.id === role.id ? { ...r, name: val } : r,
                        ),
                      );
                    }}
                    className="bg-transparent focus:outline-none flex-1 text-ink text-sm"
                  />
                  <button
                    onClick={() => handleRemoveRole(role.id)}
                    className="text-ink-4 hover:text-err transition-colors p-1 rounded hover:bg-err/10"
                    title="Remove"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}

              {roles.length === 0 && (
                <p className="text-center text-ink-4 text-xs py-6 italic">
                  No roles yet
                </p>
              )}
            </div>

            {/* Add */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="New role..."
                className="flex-1 bg-paper-2 border border-rule hover:border-rule-strong focus:border-accent rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent-wash placeholder:text-ink-4"
                onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
              />
              <button
                onClick={handleAddRole}
                disabled={!newRoleName.trim()}
                className="bg-ink text-paper text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-lg transition-colors hover:bg-ink-2 disabled:opacity-20"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-rule text-right">
          <button
            onClick={onClose}
            className="bg-paper-2 hover:bg-paper-3 text-ink-2 text-xs font-mono tracking-wider uppercase px-6 py-2 rounded-lg transition-colors border border-rule"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
