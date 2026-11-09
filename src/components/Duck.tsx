interface DuckProps {
  bandana: string;
  size: number;
}

export const Duck: React.FC<DuckProps> = ({ bandana, size }) => (
  <svg
    width={size}
    height={size * 0.8}
    viewBox="0 0 40 32"
    aria-hidden="true"
  >
    <path
      d="M4 18 Q4 28 18 28 L30 28 Q38 26 36 18 Q30 20 24 16 L8 16 Q4 16 4 18Z"
      fill="var(--color-duck)"
      stroke="var(--color-ink)"
      strokeWidth="1.8"
    />
    <circle
      cx="26"
      cy="11"
      r="7"
      fill="var(--color-duck)"
      stroke="var(--color-ink)"
      strokeWidth="1.8"
    />
    <path
      d="M32 10 L39 12 L32 14 Z"
      fill="var(--color-beak)"
      stroke="var(--color-ink)"
      strokeWidth="1.2"
    />
    <circle cx="28" cy="9" r="1.5" fill="var(--color-ink)" />
    <path
      d="M20 15 L32 15 L33 18 L19 18 Z"
      fill={bandana}
      stroke="var(--color-ink)"
      strokeWidth="1"
    />
  </svg>
);
