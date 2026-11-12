import { RacePhase, Role } from '../types';
import { Duck } from './Duck';

const START_LABEL: Record<RacePhase, string> = {
  idle: 'Via alla gara',
  countdown: 'Pronti…',
  racing: 'In gara',
  finished: 'Rivincita',
};

const FROM_LAST = ['Ultima', 'Penultima', 'Terzultima', 'Quartultima'];

interface HeaderProps {
  roles: Role[];
  phase: RacePhase;
  canStart: boolean;
  warning: string | null;
  onStart: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roles,
  phase,
  canStart,
  warning,
  onStart,
  onOpenSettings,
}) => (
  <header className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6 max-w-[100rem] mx-auto w-full">
    <div className="flex items-center gap-3.5 min-w-0">
      <Duck bandana="var(--color-coral)" size={54} />
      <div className="min-w-0">
        <h1 className="font-display text-3xl md:text-4xl leading-none text-white">
          Gran Premio delle Paperelle
        </h1>
        {warning ? (
          <p className="mt-1 text-sm font-extrabold text-coral">{warning}</p>
        ) : (
          <p className="mt-1 text-sm font-extrabold text-foam">
            {roles
              .map((r, i) => `${FROM_LAST[i] ?? `${i + 1}ª dal fondo`}: ${r.name}`)
              .join(' · ')}
          </p>
        )}
      </div>
    </div>

    <div className="flex items-center gap-3">
      <button
        onClick={onOpenSettings}
        disabled={phase === 'countdown' || phase === 'racing'}
        aria-label="Impostazioni: concorrenti e ruoli"
        className="size-12 flex items-center justify-center rounded-full border-3 border-ink bg-paper text-ink shadow-sticker transition-transform active:translate-y-0.5 disabled:opacity-60"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
      </button>
      <button
        onClick={onStart}
        disabled={!canStart}
        className="min-h-13 rounded-full border-3 border-ink bg-duck px-7 font-display text-xl text-ink shadow-sticker transition-transform active:translate-y-0.5 disabled:opacity-60"
      >
        {START_LABEL[phase]}
      </button>
    </div>
  </header>
);
