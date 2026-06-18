const COLORS = [
  { from: 'oklch(0.48 0.20 12)', to: 'oklch(0.62 0.26 12)' },
  { from: 'oklch(0.55 0.12 195)', to: 'oklch(0.80 0.14 195)' },
  { from: 'oklch(0.42 0.20 295)', to: 'oklch(0.60 0.24 295)' },
  { from: 'oklch(0.72 0.18 80)', to: 'oklch(0.82 0.18 80)' },
  { from: 'oklch(0.62 0.20 150)', to: 'oklch(0.75 0.22 150)' },
  { from: 'oklch(0.70 0.18 115)', to: 'oklch(0.92 0.24 115)' },
  { from: 'oklch(0.48 0.16 340)', to: 'oklch(0.62 0.20 340)' },
] as const;

interface HexChipProps {
  name: string;
  index: number;
  size?: number;
}

export const HexChip: React.FC<HexChipProps> = ({ name, index, size = 36 }) => {
  const initials = name.slice(0, 3).toUpperCase();
  const color = COLORS[index % COLORS.length];
  const fontSize = size * 0.28;

  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size * 1.1,
        clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
        background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
      }}
    >
      <span
        className="font-body font-bold text-white uppercase"
        style={{ fontSize, letterSpacing: '0.02em' }}
      >
        {initials}
      </span>
    </div>
  );
};
