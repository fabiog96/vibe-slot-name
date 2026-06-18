import type { Participant, PlayerOdds, Role, SpinResult, GameState as GameStateType } from '../types';
import { GameState } from '../types';

interface ParticipantsPanelProps {
  participants: Participant[];
  roles: Role[];
  odds: PlayerOdds[];
  spinResult: SpinResult;
  gameState: GameStateType;
}

const CHIP_COLORS = [
  'bg-accent',
  'bg-teal',
  'bg-warn',
  'bg-err',
  'bg-ok',
  'bg-ink-3',
  'bg-accent',
];

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  roles,
  odds,
  spinResult,
  gameState,
}) => {
  const winners = new Set(
    Object.values(spinResult).filter(Boolean).map((p) => p!.id),
  );

  const getOdds = (pId: string, rId: string) =>
    odds.find((o) => o.participantId === pId && o.roleId === rId);

  const getWinningRole = (pId: string): string | null => {
    for (const role of roles) {
      if (spinResult[role.id]?.id === pId) return role.name;
    }
    return null;
  };

  return (
    <div className="panel-card flex flex-col h-full">
      <div className="px-4 py-3 border-b border-rule">
        <h3 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-3 font-semibold">
          Players
          <span className="text-ink-4 ml-2 font-normal">{participants.length}</span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto py-1.5">
        {participants.map((p, i) => {
          const isWinner = gameState === GameState.RESULT && winners.has(p.id);
          const winRole = isWinner ? getWinningRole(p.id) : null;

          return (
            <div
              key={p.id}
              className={`flex items-center gap-2.5 px-4 py-2 transition-colors ${
                isWinner ? 'bg-teal-wash' : 'hover:bg-paper-2'
              }`}
            >
              <div className={`w-5 h-5 rounded-full ${CHIP_COLORS[i % CHIP_COLORS.length]} flex items-center justify-center shrink-0`}>
                <span className="text-[9px] font-mono font-bold text-white">
                  {i + 1}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium truncate ${isWinner ? 'text-teal' : 'text-ink'}`}>
                    {p.name}
                  </span>
                  {winRole && (
                    <span className="text-[9px] font-mono text-teal bg-teal-wash px-1.5 py-0.5 rounded-md">
                      {winRole}
                    </span>
                  )}
                </div>

                {odds.length > 0 && (
                  <div className="flex gap-2 mt-0.5">
                    {roles.map((role) => {
                      const o = getOdds(p.id, role.id);
                      if (!o) return null;
                      return (
                        <span key={role.id} className="font-mono text-[9px] text-ink-4 tabular-nums">
                          <span className="text-ink-4/60">{role.name[0]}:</span>
                          <span className={o.odds >= 5 ? 'text-bet-win' : o.odds >= 2 ? 'text-teal' : 'text-accent'}>
                            {o.odds.toFixed(1)}x
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
