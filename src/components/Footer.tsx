const STATUS = [
  { label: 'UPLINK', value: '12ms', color: 'text-cyan' },
  { label: 'RNG', value: 'VERIFIED', color: 'text-win' },
  { label: 'SESSION', value: 'LIVE', color: 'text-magenta' },
] as const;

export const Footer: React.FC = () => (
  <footer className="relative z-10 border-t border-line bg-void">
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-text-3">
        // VIBESLOT.NET · NIGHT CITY //
      </span>
      <div className="flex items-center gap-4">
        {STATUS.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] uppercase text-text-3">
            <span className={`cb-live-dot ${s.color}`} />
            {s.label} · {s.value}
          </span>
        ))}
      </div>
    </div>
  </footer>
);
