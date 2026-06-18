import type { SpinResult, Role } from '../types';
import { MOCK_PARTICIPANTS } from '../services/mockData';

interface FooterProps {
  lastResult: SpinResult;
  roles: Role[];
}

export const Footer: React.FC<FooterProps> = ({ lastResult, roles }) => {
  const hasResults = Object.keys(lastResult).length > 0 && Object.values(lastResult).some(Boolean);

  return (
    <footer className="px-5 md:px-8 py-2.5 flex items-center justify-center gap-4 border-t border-rule">
      {hasResults ? (
        <div className="flex items-center gap-4 text-[9px] font-mono text-ink-4 tracking-[0.1em] uppercase">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-ok" style={{ boxShadow: '0 0 4px oklch(0.75 0.22 150 / 0.6)' }} />
            RESOLVED
          </span>
          {roles.map((role) => {
            const winner = lastResult[role.id];
            const name = winner
              ? MOCK_PARTICIPANTS.find((p) => p.id === winner.id)?.name ?? winner.name
              : '?';
            return (
              <span key={role.id} className="text-ink-3">
                <span className="text-ink-4">{role.name}:</span>{' '}
                <span className="text-neon-cyan">{name}</span>
              </span>
            );
          })}
        </div>
      ) : (
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-4">
          // NO ROUNDS EXECUTED //
        </span>
      )}
    </footer>
  );
};
