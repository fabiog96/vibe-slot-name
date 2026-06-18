import { BetMarketLogo } from './BetMarketLogo';

interface HeaderProps {
  participantCount: number;
  roleCount: number;
  isGameActive: boolean;
  jackpotMode: boolean;
  onLogoClick: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  participantCount,
  roleCount,
  isGameActive,
  jackpotMode,
  onLogoClick,
  onOpenSettings,
}) => (
  <header className="relative z-10 border-b border-magenta/60 shadow-[0_4px_18px_-6px_var(--cb-magenta)] bg-bg-0/80 backdrop-blur-sm">
    <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
      {/* Logo + wordmark */}
      <div className="flex items-center gap-3">
        <BetMarketLogo size={40} spinning={jackpotMode} onClick={onLogoClick} />
        <div className="leading-none">
          <h1 className="font-display text-lg md:text-xl font-black tracking-[0.06em] cb-glitch">
            <span className="cb-glow-magenta">VIBE</span>
            <span className="text-text-3">//</span>
            <span className="cb-glow-cyan">SLOT</span>
          </h1>
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-text-3 mt-0.5">
            Night City RNG · v2.077
          </p>
        </div>
      </div>

      {/* Stat chips + settings */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden sm:flex items-center gap-2 font-mono px-3 py-1.5 border border-line bg-bg-1/60 notch">
          <span className="text-[9px] tracking-[0.18em] uppercase text-text-3">Runners</span>
          <span className="text-cyan-soft text-sm tabular-nums">{String(participantCount).padStart(2, '0')}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono px-3 py-1.5 border border-line bg-bg-1/60 notch">
          <span className="text-[9px] tracking-[0.18em] uppercase text-text-3">Roles</span>
          <span className="text-acid-soft text-sm tabular-nums">{String(roleCount).padStart(2, '0')}</span>
        </div>
        <button
          onClick={onOpenSettings}
          disabled={isGameActive}
          className="cb-btn px-3 py-2.5 disabled:opacity-30"
          title="Config"
        >
          ⌬ CFG
        </button>
      </div>
    </div>
  </header>
);
