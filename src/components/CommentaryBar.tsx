interface CommentaryBarProps {
  text: string;
}

export const CommentaryBar: React.FC<CommentaryBarProps> = ({ text }) => (
  <div
    className="flex min-h-10 items-center gap-2.5 overflow-hidden rounded-xl bg-ink px-3.5 py-2"
    aria-live="polite"
  >
    <span className="shrink-0 rounded-md bg-coral px-2 py-0.5 text-[11px] font-black tracking-[0.15em] text-white">
      LIVE
    </span>
    <span
      key={text}
      className="animate-slide-in truncate text-sm font-extrabold text-white sm:text-[15px]"
    >
      {text}
    </span>
  </div>
);
