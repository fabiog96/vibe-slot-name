const HEX_VARIANTS = [
  { from: 'var(--cb-magenta-deep)', to: 'var(--cb-magenta)' },
  { from: 'var(--cb-cyan-deep)', to: 'var(--cb-cyan)' },
  { from: 'var(--cb-violet-deep)', to: 'var(--cb-violet)' },
  { from: '#8aa800', to: 'var(--cb-acid)' },
  { from: '#a87a00', to: 'var(--cb-amber)' },
] as const;

const pickVariant = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return HEX_VARIANTS[Math.abs(hash) % HEX_VARIANTS.length];
};

const initials = (name: string) =>
  name.trim().slice(0, 3).toUpperCase() || '???';

interface HexChipProps {
  name: string;
  size?: number;
  className?: string;
}

export const HexChip: React.FC<HexChipProps> = ({ name, size = 36, className = '' }) => {
  const variant = pickVariant(name);

  return (
    <span
      className={`cb-hex shrink-0 ${className}`}
      style={{
        width: size,
        height: size * 1.1,
        fontSize: size * 0.28,
        background: `linear-gradient(135deg, ${variant.from}, ${variant.to})`,
      }}
    >
      {initials(name)}
    </span>
  );
};
