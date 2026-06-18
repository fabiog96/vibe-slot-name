interface BetMarketLogoProps {
  size?: number;
  spinning?: boolean;
  onClick?: () => void;
}

export const BetMarketLogo: React.FC<BetMarketLogoProps> = ({ size = 38, spinning = false, onClick }) => {
  const h = size * 1.15;

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 38 44"
      className={`cursor-pointer select-none transition-transform duration-200 hover:scale-110 ${spinning ? 'animate-spin-slow' : ''}`}
      onClick={onClick}
    >
      <defs>
        <linearGradient id="bm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2a6d" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="bm-inner" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#05d9e8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#05d9e8" stopOpacity="0" />
        </linearGradient>
        <filter id="bm-glow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
        <filter id="bm-inner-glow">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <clipPath id="hex-clip">
          <polygon points="19,2 35,12 35,32 19,42 3,32 3,12" />
        </clipPath>
      </defs>

      {/* Outer glow */}
      <polygon
        points="19,1 36,11.5 36,32.5 19,43 2,32.5 2,11.5"
        fill="none"
        stroke="#ff2a6d"
        strokeWidth="1.5"
        opacity="0.3"
        filter="url(#bm-glow)"
      />

      {/* Main hex body */}
      <polygon
        points="19,2 35,12 35,32 19,42 3,32 3,12"
        fill="#0a0612"
        stroke="url(#bm-grad)"
        strokeWidth="1.2"
      />

      {/* Inner gradient wash */}
      <polygon
        points="19,2 35,12 35,32 19,42 3,32 3,12"
        fill="url(#bm-inner)"
      />

      {/* Circuit lines — horizontal */}
      <g clipPath="url(#hex-clip)" opacity="0.12" stroke="#05d9e8" strokeWidth="0.4">
        <line x1="3" y1="18" x2="35" y2="18" />
        <line x1="3" y1="26" x2="35" y2="26" />
        <line x1="14" y1="8" x2="14" y2="36" />
        <line x1="24" y1="8" x2="24" y2="36" />
      </g>

      {/* Corner brackets — top-left */}
      <polyline points="8,10 8,14" fill="none" stroke="#05d9e8" strokeWidth="0.8" opacity="0.5" />
      <polyline points="8,10 12,10" fill="none" stroke="#05d9e8" strokeWidth="0.8" opacity="0.5" />

      {/* Corner brackets — bottom-right */}
      <polyline points="30,34 30,30" fill="none" stroke="#05d9e8" strokeWidth="0.8" opacity="0.5" />
      <polyline points="30,34 26,34" fill="none" stroke="#05d9e8" strokeWidth="0.8" opacity="0.5" />

      {/* Center diamond reticle */}
      <polygon
        points="19,16 24,22 19,28 14,22"
        fill="none"
        stroke="#ff2a6d"
        strokeWidth="0.6"
        opacity="0.4"
      />
      <polygon
        points="19,18.5 22,22 19,25.5 16,22"
        fill="#ff2a6d"
        opacity="0.15"
      />

      {/* Crosshair dots */}
      <circle cx="19" cy="12" r="1" fill="#05d9e8" opacity="0.5" />
      <circle cx="19" cy="32" r="1" fill="#05d9e8" opacity="0.5" />
      <circle cx="9" cy="22" r="1" fill="#ff2a6d" opacity="0.4" />
      <circle cx="29" cy="22" r="1" fill="#ff2a6d" opacity="0.4" />

      {/* Center glyph — stylized ₡ */}
      <text
        x="19"
        y="26"
        textAnchor="middle"
        fontFamily="'Chakra Petch', sans-serif"
        fontWeight="700"
        fontSize="15"
        fill="white"
        letterSpacing="0.5"
      >
        ₡
      </text>

      {/* Scanline accent */}
      <g clipPath="url(#hex-clip)" opacity="0.04">
        <rect x="0" y="0" width="38" height="44" fill="url(#bm-scan)" />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1="0" y1={i * 4} x2="38" y2={i * 4} stroke="white" strokeWidth="0.5" />
        ))}
      </g>
    </svg>
  );
};
