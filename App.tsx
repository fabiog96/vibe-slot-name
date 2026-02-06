import React, { useState, useCallback } from 'react';
import Confetti from 'react-confetti';
import { Participant, SpinResult, GameState, Role } from './types';
import SlotReel from './components/SlotReel';
import ControlPanel from './components/ControlPanel';
import SettingsModal from './components/SettingsModal';
import { generateAnnouncement } from './services/generateAnnouncement';

const App: React.FC = () => {
  // --- Data States ---
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Il Conte di Arcore' },
    { id: '2', name: 'Rayan Gosling' },
    { id: '3', name: 'Michael Jackson' },
    { id: '4', name: 'Polymarket Specialist' },
    { id: '5', name: 'Oh Yang' },
    { id: '6', name: 'Meme Master' },
    { id: '7', name: 'Leoliviericlerc' },
    { id: '8', name: 'Dynantico' },
    { id: '9', name: 'Neozelandese' },
    { id: '10', name: 'Una Gioia' },
    { id: '11', name: 'Ash Manduca' }

  ]);

  const [roles, setRoles] = useState<Role[]>([
    { id: 'r1', name: 'Moderator' },
    { id: 'r2', name: 'Notary' }
  ]);

  // --- Game States ---
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [spinResult, setSpinResult] = useState<SpinResult>({});
  const [announcement, setAnnouncement] = useState<string>("");
  const [reelsStoppedCount, setReelsStoppedCount] = useState(0);
  const [activeReelIds, setActiveReelIds] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Logic ---

  const startSpinSequence = (roleIdsToSpin: string[]) => {
     setGameState(GameState.SPINNING);
     setAnnouncement("");
     setReelsStoppedCount(0);
     setActiveReelIds(roleIdsToSpin);
     
     // Spin time: 2.5s for full spin, faster (1.5s) for single respin
     const spinDuration = roleIdsToSpin.length === 1 ? 1500 : 2500;

     setTimeout(() => {
        setGameState(GameState.STOPPING);
    }, spinDuration);
  };

  const handleFullSpin = () => {
    if (roles.length === 0) {
      alert("Please configure at least one role in settings!");
      return;
    }
    if (participants.length < roles.length) {
      alert(`Need at least ${roles.length} participants to fill all roles!`);
      return;
    }

    // Shuffle and assign
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    const newResults: SpinResult = {};
    
    roles.forEach((role, index) => {
      newResults[role.id] = shuffled[index];
    });

    setSpinResult(newResults);
    startSpinSequence(roles.map(r => r.id));
  };

  const handleRespin = (roleId: string) => {
      // Find who is currently winning other roles to exclude them
      const winnersOfOtherRoles = roles
        .filter(r => r.id !== roleId)
        .map(r => spinResult[r.id]?.id)
        .filter(id => id !== undefined);

      // Candidates are everyone NOT already winning another role
      const candidates = participants.filter(p => !winnersOfOtherRoles.includes(p.id));
      
      if (candidates.length === 0) {
          alert("No available participants left to switch to!");
          return;
      }

      const newWinner = candidates[Math.floor(Math.random() * candidates.length)];

      setSpinResult(prev => ({
          ...prev,
          [roleId]: newWinner
      }));

      startSpinSequence([roleId]);
  };

  const handleReelStop = useCallback(() => {
    setReelsStoppedCount(prev => {
      const newVal = prev + 1;
      
      // Check if ALL active reels have stopped
      if (newVal === activeReelIds.length) {
        setGameState(GameState.RESULT);
        
        // Construct results array for the announcement
        const resultList = roles.map(r => ({
          role: r.name,
          winner: spinResult[r.id]?.name || "Unknown"
        }));

        generateAnnouncement(resultList)
          .then(text => setAnnouncement(text));
      }
      return newVal;
    });
  }, [activeReelIds.length, roles, spinResult]);

  const isGameActive = gameState === GameState.SPINNING || gameState === GameState.STOPPING;

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden flex flex-col">
      {gameState === GameState.RESULT && <Confetti />}
      <SettingsModal
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        roles={roles}
        setRoles={setRoles}
      />

      {/* Header */}
      <header className="p-4 bg-slate-950 border-b border-amber-900/30 flex justify-between items-center shadow-lg z-20">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-xl shadow-inner border border-amber-600">
                🎰
            </div>
            <h1 className="text-2xl font-display bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent font-bold">
            Vibe Slot
            </h1>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          disabled={isGameActive}
          className="p-2 text-slate-400 hover:text-amber-500 transition-colors disabled:opacity-30"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left: Controls */}
        <div className="w-full lg:w-1/3 xl:w-1/4 h-[500px] lg:h-auto order-2 lg:order-1">
          <ControlPanel participants={participants} setParticipants={setParticipants} />
        </div>

        {/* Center: Slot Machine Stage */}
        <div className="flex-1 flex flex-col items-center justify-center order-1 lg:order-2">

          {/* Application Title */}
{/* Application Title Container */}
<div className="relative mb-16 text-center max-w-2xl mx-auto p-8 border-4 border-amber-500/30 rounded-2xl bg-black/40 backdrop-blur-sm shadow-[0_0_50px_rgba(251,191,36,0.1)]">
  
  {/* Top Marquee Lights */}
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-4 px-6 py-1 bg-neutral-900 rounded-full border-2 border-amber-500 z-20">
    <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-pulse"></span>
    <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse delay-75"></span>
    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse delay-150"></span>
    <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e] animate-pulse delay-300"></span>
  </div>

  {/* Main Title Area */}
      <div className="relative z-10 px-6"> {/* <--- Aggiunto padding qui per non tagliare la T */}
        <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-tight">
          <span className="block text-2xl mb-2 tracking-[0.3em] text-amber-400 font-light not-italic drop-shadow-sm">
            ULTIMATE
          </span>
          {/* Il padding laterale extra (px-4) previene il clipping della 'T' corsiva */}
          <span className="inline-block px-4 bg-gradient-to-b from-amber-200 via-amber-500 to-amber-800 bg-clip-text text-transparent drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            VIBE SLOT
          </span>
        </h2>
        
        {/* Decorative Stars */}
        <span className="absolute -top-4 -left-2 text-3xl animate-bounce">🎰</span>
        <span className="absolute -bottom-4 -right-2 text-3xl animate-bounce delay-100">🎰</span>
      </div>

      {/* Slot Machine Lever */}
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden lg:block group cursor-pointer">
        <div className="w-6 h-12 bg-neutral-800 rounded-r-lg border-y border-r border-amber-600"></div>
        <div className="w-3 h-24 bg-gradient-to-r from-gray-400 to-gray-200 mx-auto -mt-6 rounded-full origin-bottom group-active:rotate-[30deg] transition-transform duration-150">
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-700 rounded-full -translate-x-1/3 -mt-8 shadow-[0_0_20px_rgba(239,68,68,0.6)] border-2 border-white/20"></div>
        </div>
      </div>

      {/* Bottom Marquee Lights */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-4 px-6 py-1 bg-neutral-900 rounded-full border-2 border-amber-500 z-20">
        <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e] animate-pulse delay-300"></span>
        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse delay-150"></span>
        <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse delay-75"></span>
        <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-pulse"></span>
      </div>
    </div>
      
          {/* Machine Bezel */}
          <div className="relative bg-gradient-to-br from-red-950 to-slate-950 p-8 rounded-3xl border-8 border-amber-700/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] max-w-4xl w-full ring-1 ring-white/10">
            {/* Lights decoration */}
            <div className="absolute top-2 left-2 right-2 flex justify-between px-4">
                <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(253,224,71,0.5)] ${isGameActive ? 'animate-ping bg-yellow-300' : 'bg-red-900'}`}></div>
                <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(253,224,71,0.5)] ${isGameActive ? 'animate-ping bg-yellow-300' : 'bg-red-900'}`}></div>
            </div>

            <div className="bg-black/60 rounded-xl p-6 md:p-10 border border-white/5 backdrop-blur-md shadow-inner">
                {roles.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    <p className="mb-4">No roles configured.</p>
                    <button onClick={() => setIsSettingsOpen(true)} className="text-amber-500 underline">Open Settings</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center items-center gap-8 md:gap-8">
                    {roles.map((role, index) => {
                      const delay = activeReelIds.length === 1 ? 1500 : 1500 + (index * 1000);
                      
                      return (
                        <div key={role.id} className="flex items-center">
                          <SlotReel 
                              label={role.name}
                              participants={participants}
                              target={spinResult[role.id] || null}
                              isSpinning={gameState === GameState.SPINNING && activeReelIds.includes(role.id)}
                              delay={delay}
                              onStop={handleReelStop}
                              showRespin={gameState === GameState.RESULT}
                              onRespin={() => handleRespin(role.id)}
                          />
                          {/* Divider only if not the last item */}
                          {index < roles.length - 1 && (
                             <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-amber-800/50 to-transparent mx-2"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>

            {/* Lever/Button Area */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleFullSpin}
                    disabled={isGameActive || participants.length < roles.length || roles.length === 0}
                    className={`
                        group relative px-12 py-4 rounded-full font-display text-2xl uppercase tracking-widest
                        transition-all duration-200 transform
                        ${(participants.length < roles.length || roles.length === 0) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 
                          isGameActive 
                            ? 'bg-amber-900/50 text-amber-500/50 scale-95 shadow-inner cursor-wait border border-amber-900/50' 
                            : 'bg-gradient-to-b from-amber-400 to-amber-600 text-red-950 hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] shadow-xl active:scale-95 border-b-4 border-amber-800'
                        }
                    `}
                >
                    {isGameActive ? 'Spinning...' : 'SPIN ALL'}
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </button>
            </div>
          </div>

          {/* Result / Announcement Area */}
          <div className="mt-8 w-full max-w-2xl min-h-[120px] flex items-center justify-center text-center">
             {gameState === GameState.RESULT && (
                <div className="animate-fade-in-up bg-slate-800/90 border border-amber-500/30 p-6 rounded-xl shadow-lg w-full backdrop-blur-sm relative">
                   {announcement ? (
                       <p className="text-lg md:text-xl text-amber-100 italic font-serif leading-relaxed relative z-10">
                           "{announcement}"
                       </p>
                   ) : (
                       <div className="flex justify-center gap-2 relative z-10">
                           <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                           <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-75"></span>
                           <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-150"></span>
                       </div>
                   )}
                </div>
             )}
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-4 text-center text-slate-500 text-xs font-mono">
         Vibe Slot Machine
      </footer>
    </div>
  );
};

export default App;
