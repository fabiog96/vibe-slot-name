import { useState } from 'react';

import { Role } from '../types';

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/70 backdrop-blur-sm cb-slide-up"
      onClick={onClose}
    >
      <div
        className="cb-panel cb-frame notch-all w-full max-w-md flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-line flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="cb-section-bar magenta" />
            <h2 className="font-display text-[13px] font-bold tracking-[0.18em] uppercase cb-glow-magenta">
              Config
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-3 hover:text-loss transition-colors text-sm px-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          <h3 className="font-mono text-[10px] tracking-[0.18em] uppercase text-text-3 mb-3">
            // Roles
          </h3>
          <div className="space-y-2 mb-4">
            {roles.map((role, i) => (
              <div
                key={role.id}
                className="flex items-center gap-3 bg-void px-3 py-2.5 border border-line"
              >
                <span className="font-mono text-[10px] text-text-3 w-5 text-right tabular-nums shrink-0">
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
                  className="bg-transparent focus:outline-none flex-1 text-text-0 text-sm font-mono"
                />
                <button
                  onClick={() => handleRemoveRole(role.id)}
                  className="text-text-3 hover:text-loss transition-colors text-sm px-1"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}

            {roles.length === 0 && (
              <p className="text-center text-text-3 text-[11px] py-6 font-mono uppercase tracking-widest">
                // no roles defined //
              </p>
            )}
          </div>

          {/* Add */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="// new role //"
              className="flex-1 bg-void border border-line hover:border-line-2 focus:border-cyan px-3 py-2 text-sm font-mono text-text-0 focus:outline-none placeholder:text-text-3"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
            />
            <button
              onClick={handleAddRole}
              disabled={!newRoleName.trim()}
              className="cb-btn cyan"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-line text-right">
          <button onClick={onClose} className="cb-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
