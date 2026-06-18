import { useMemo } from 'react';

interface SparklineProps {
  participantId: string;
  width?: number;
  height?: number;
}

const generatePoints = (id: string, count: number): number[] => {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed += id.charCodeAt(i);

  const points: number[] = [];
  let value = 0.5;
  for (let i = 0; i < count; i++) {
    seed = (seed * 16807 + 0) % 2147483647;
    const delta = ((seed % 100) / 100 - 0.5) * 0.3;
    value = Math.max(0.1, Math.min(0.9, value + delta));
    points.push(value);
  }
  return points;
};

export const Sparkline: React.FC<SparklineProps> = ({ participantId, width = 80, height = 24 }) => {
  const points = useMemo(() => generatePoints(participantId, 12), [participantId]);

  const isUp = points[points.length - 1] > points[0];
  const color = isUp ? 'oklch(0.75 0.22 150)' : 'oklch(0.62 0.26 12)';

  const pathData = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = (1 - p) * height;
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="shrink-0">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 2px ${color})` }}
      />
    </svg>
  );
};
