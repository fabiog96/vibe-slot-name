export const Net: React.FC = () => (
  <svg width="60" height="96" viewBox="0 0 60 96" aria-hidden="true">
    <line
      x1="30"
      y1="0"
      x2="30"
      y2="66"
      stroke="var(--color-dock)"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M6 74 Q30 100 54 74"
      fill="rgb(255 255 255 / 0.25)"
      stroke="var(--color-ink)"
      strokeWidth="1"
    />
    <path
      d="M12 76 L22 90 M22 77 L30 92 M38 77 L30 92 M48 76 L38 90 M10 82 L50 82"
      stroke="var(--color-ink)"
      strokeWidth="0.8"
      opacity="0.6"
    />
    <ellipse
      cx="30"
      cy="74"
      rx="24"
      ry="8"
      fill="none"
      stroke="var(--color-coral)"
      strokeWidth="3.5"
    />
  </svg>
);
