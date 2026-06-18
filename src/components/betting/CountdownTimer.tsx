interface CountdownTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  formatted: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ secondsLeft, totalSeconds, formatted }) => {
  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const isUrgent = secondsLeft <= 30 && secondsLeft > 0;

  return (
    <div className="flex items-center gap-3">
      <div className="countdown-bar flex-1 min-w-[80px]">
        <div
          className={`countdown-bar-fill ${isUrgent ? 'urgent' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={`font-mono text-xs tabular-nums font-semibold ${
        isUrgent ? 'text-neon-magenta glow-magenta animate-countdown-pulse' : 'text-ink-2'
      }`}>
        {formatted}
      </span>
    </div>
  );
};
