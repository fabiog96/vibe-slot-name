import React, { useState } from 'react';
import { Participant } from '../types';

interface ControlPanelProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ participants, setParticipants }) => {
  const [inputValue, setInputValue] = useState("");
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    
    // Allow comma separated or newline separated
    const names = inputValue.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
    
    const newParticipants = names.map(name => ({
      id: crypto.randomUUID(),
      name: name
    }));

    setParticipants(prev => [...prev, ...newParticipants]);
    setInputValue("");
  };

  const handleRemove = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleClearClick = () => {
    if (isConfirmingClear) {
        setParticipants([]);
        setIsConfirmingClear(false);
    } else {
        setIsConfirmingClear(true);
        // Reset confirmation state after 3 seconds if not clicked again
        setTimeout(() => setIsConfirmingClear(false), 3000);
    }
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper to get consistent color for avatar based on name length/char
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-teal-500 to-emerald-500',
      'from-amber-500 to-orange-500',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl p-0 rounded-2xl border border-amber-500/20 shadow-2xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/5">
        <h2 className="text-xl font-display font-bold text-amber-500 flex items-center gap-3 uppercase tracking-wider">
          <span className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">📋</span> 
          VIP List <span className="text-slate-500 text-sm ml-auto font-sans">({participants.length})</span>
        </h2>
      </div>
      
      {/* Input Area */}
      <div className="p-4 space-y-3 bg-slate-800/30">
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
            placeholder="Enter names here..."
            className="w-full bg-slate-950/50 border border-slate-700 hover:border-amber-500/50 focus:border-amber-500 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none h-20 text-sm shadow-inner transition-colors placeholder:text-slate-600"
            />
            <div className="absolute bottom-2 right-2 text-xs text-slate-600 pointer-events-none">
                Enter to add
            </div>
        </div>
        <button 
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-amber-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs tracking-widest"
        >
          Add Participant
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0 bg-slate-900/50">
        {participants.map(p => (
          <div key={p.id} className="group flex items-center gap-3 bg-slate-800/40 hover:bg-slate-800 p-3 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all duration-200">
            
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(p.name)} flex items-center justify-center shadow-lg text-xs font-bold text-white border border-white/10 shrink-0`}>
                {getInitials(p.name)}
            </div>

            {/* Name */}
            <span className="font-medium text-slate-200 truncate flex-1 font-display tracking-wide">{p.name}</span>
            
            {/* Remove Button */}
            <button 
              onClick={() => handleRemove(p.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              aria-label="Remove"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
            </button>
          </div>
        ))}
        
        {participants.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-60">
            <div className="text-4xl grayscale">🎰</div>
            <p className="text-sm">The list is empty.</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {participants.length > 0 && (
          <div className="p-3 border-t border-white/5 bg-slate-900/80 text-center">
            <button 
                onClick={handleClearClick}
                className={`
                    text-xs transition-colors uppercase tracking-widest font-bold px-4 py-2 rounded
                    ${isConfirmingClear 
                        ? "bg-red-600 text-white hover:bg-red-700 animate-pulse" 
                        : "text-slate-500 hover:text-red-400 hover:bg-red-500/5"
                    }
                `}
            >
                {isConfirmingClear ? "Confirm Clear?" : "Clear All"}
            </button>
          </div>
      )}
    </div>
  );
};

export default ControlPanel;