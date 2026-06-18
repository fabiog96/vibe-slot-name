import { BetMarketLogo } from './BetMarketLogo';

interface HeaderProps {
  isGameActive: boolean;
  jackpotMode: boolean;
  userChips: number;
  isBankrupt: boolean;
  onLogoClick: () => void;
  onLeaderboardOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isGameActive,
  jackpotMode,
  userChips,
  isBankrupt,
  onLogoClick,
  onLeaderboardOpen,
}) => (
  <header className="px-5 md:px-8 pt-4 pb-3 flex justify-between items-center border-b border-neon-magenta/30" style={{ boxShadow: '0 4px 16px oklch(0.62 0.26 12 / 0.1)' }}>
    <div className="flex items-center gap-2.5">
      <BetMarketLogo size={36} spinning={jackpotMode} onClick={onLogoClick} />
      <div>
        <h1 className="font-body text-base font-bold tracking-[0.08em] uppercase leading-tight">
          <span className="text-neon-magenta glow-magenta">BET</span>
          <span className="text-neon-cyan glow-cyan">MARKET</span>
        </h1>
        <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink-4">
          // social betting protocol //
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <div className={`chip-badge notch ${isBankrupt ? 'bankrupt' : ''}`}>
        <span className="text-[9px]">&#9670;</span>
        <span className="font-mono tabular-nums">{isBankrupt ? 'LIQUIDATED' : `₡${String(userChips).padStart(4, '0')}`}</span>
      </div>

      {isGameActive && (
        <span className="w-2 h-2 rounded-full bg-neon-magenta animate-neon-pulse" />
      )}

      <button
        onClick={onLeaderboardOpen}
        className="notch px-3 py-1.5 text-ink-4 hover:text-neon-cyan transition-colors bg-void-2 border border-rule hover:border-neon-cyan/40 font-mono text-[9px] tracking-[0.15em] uppercase"
        title="Rankings"
      >
        &#9651; RANK
      </button>
    </div>
  </header>
);
