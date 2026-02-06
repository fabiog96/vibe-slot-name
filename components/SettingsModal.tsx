import React, { useState } from 'react';
import { Role } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, roles, setRoles }) => {
  const [newRoleName, setNewRoleName] = useState("");

  if (!isOpen) return null;

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    setRoles(prev => [...prev, { id: crypto.randomUUID(), name: newRoleName.trim() }]);
    setNewRoleName("");
  };

  const handleRemoveRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950/50 rounded-t-2xl">
          <h2 className="text-xl font-display text-amber-500 font-bold uppercase tracking-wider">
            ⚙️ Game Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-4">
            Configure Extractions
          </h3>

          {/* List of Roles */}
          <div className="space-y-3 mb-6">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-white/5">
                <span className="text-2xl">🏷️</span>
                <input 
                  type="text" 
                  value={role.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRoles(prev => prev.map(r => r.id === role.id ? { ...r, name: val } : r));
                  }}
                  className="bg-transparent border-b border-transparent hover:border-amber-500/50 focus:border-amber-500 focus:outline-none flex-1 text-white font-display"
                />
                <button 
                  onClick={() => handleRemoveRole(role.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-2"
                  title="Remove Role"
                >
                  ✕
                </button>
              </div>
            ))}
            
            {roles.length === 0 && (
              <p className="text-center text-slate-600 italic py-4">No roles configured. Add one below!</p>
            )}
          </div>

          {/* Add New Role */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="E.g. Jester"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none placeholder:text-slate-600"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
            />
            <button
              onClick={handleAddRole}
              disabled={!newRoleName.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/30 rounded-b-2xl text-center">
          <button 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-2 rounded-full font-bold transition-all border border-white/10"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
