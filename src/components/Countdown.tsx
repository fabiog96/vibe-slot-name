interface CountdownProps {
  value: number;
}

export const Countdown: React.FC<CountdownProps> = ({ value }) => (
  <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-ink/35">
    <span
      key={value}
      className="animate-pop font-display text-[140px] leading-none text-duck [text-shadow:6px_6px_0_var(--color-ink)]"
    >
      {value}
    </span>
  </div>
);
