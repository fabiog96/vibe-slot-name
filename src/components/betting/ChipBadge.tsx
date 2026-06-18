interface ChipBadgeProps {
  chips: number;
  size?: 'sm' | 'md';
  bankrupt?: boolean;
}

export const ChipBadge: React.FC<ChipBadgeProps> = ({ chips, size = 'md', bankrupt = false }) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-[11px] px-2.5 py-1 gap-1.5';

  return (
    <span className={`chip-badge notch ${bankrupt ? 'bankrupt' : ''} ${sizeClasses}`}>
      <span className="text-[9px]">&#9670;</span>
      <span className="font-mono tabular-nums">{bankrupt ? 'LIQUIDATED' : `₡${chips}`}</span>
    </span>
  );
};
