import type { BetResult } from '../../types';
import { MOCK_PARTICIPANTS, MOCK_ROLES } from '../../services/mockData';

interface BetResultsProps {
  betResults: BetResult[];
  chipDelta: number;
}

const getParticipantName = (id: string) =>
  MOCK_PARTICIPANTS.find((p) => p.id === id)?.name ?? id;

const getRoleName = (id: string) =>
  MOCK_ROLES.find((r) => r.id === id)?.name ?? id;

const formatBetLabel = (result: BetResult): string => {
  switch (result.betType) {
    case 'SINGLE':
      return `${getParticipantName(result.participantIds[0])} → ${getRoleName(result.roleIds[0])}`;
    case 'ANY_ROLE':
      return `${getParticipantName(result.participantIds[0])} → ANY`;
    case 'COMBO':
      return result.participantIds.map((pId, i) =>
        `${getParticipantName(pId)} → ${getRoleName(result.roleIds[i])}`,
      ).join(' + ');
    case 'NOT_SELECTED':
      return `${getParticipantName(result.participantIds[0])} → EXCLUDED`;
  }
};

export const BetResults: React.FC<BetResultsProps> = ({ betResults, chipDelta }) => (
  <div className="space-y-2.5">
    <div className="text-center py-3">
      <span className={`font-mono text-xl font-bold tabular-nums ${
        chipDelta > 0 ? 'text-bet-win glow-win' : chipDelta < 0 ? 'text-bet-loss glow-loss' : 'text-ink-3'
      }`}>
        {chipDelta > 0 ? `+₡${chipDelta} JACKPOT` : chipDelta < 0 ? `−₡${Math.abs(chipDelta)} LIQUIDATED` : '₡0'}
      </span>
    </div>

    {betResults.map((result) => (
      <div
        key={result.id}
        className={`bet-card notch ${result.won ? 'won' : 'lost'} p-3 flex items-center justify-between`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`font-mono text-sm font-bold ${result.won ? 'text-bet-win glow-win' : 'text-bet-loss glow-loss'}`}>
            {result.won ? '✓' : '✗'}
          </span>
          <div>
            <p className="text-sm text-ink font-mono uppercase tracking-wider">{formatBetLabel(result)}</p>
            <p className="font-mono text-[10px] text-ink-4 tabular-nums">
              ₡{result.amount} @ {result.odds.toFixed(1)}x
            </p>
          </div>
        </div>
        <span className={`font-mono text-sm font-bold tabular-nums ${
          result.won ? 'text-bet-win glow-win' : 'text-bet-loss glow-loss'
        }`}>
          {result.won ? `+₡${result.payout}` : `−₡${result.amount}`}
        </span>
      </div>
    ))}

    {betResults.length === 0 && (
      <p className="text-center text-ink-4 text-sm py-4 font-mono tracking-wider">// NO POSITIONS THIS ROUND //</p>
    )}
  </div>
);
