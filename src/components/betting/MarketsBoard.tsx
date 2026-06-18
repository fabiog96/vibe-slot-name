import { useState, useCallback, useMemo } from 'react';

import type { Participant, Role, Bet, BetType, PlayerOdds } from '../../types';
import { HexChip } from './HexChip';
import { Sparkline } from './Sparkline';
import { OddsPill } from './OddsPill';

type MarketFilter = 'ALL' | 'FAVORITES' | 'LONGSHOTS';

interface MarketsBoardProps {
  participants: Participant[];
  roles: Role[];
  odds: PlayerOdds[];
  activeBets: Bet[];
  userChips: number;
  isBankrupt: boolean;
  totalStaked: number;
  totalPotentialPayout: number;
  onPlaceBet: (betType: BetType, participantIds: string[], roleIds: string[], amount: number) => Bet | null;
  onRemoveBet: (betId: string) => void;
}

interface DraftBet {
  betType: BetType;
  participantId: string;
  roleId: string;
  amount: number;
  odds: number;
}

const STAKE_OPTIONS = [5, 10, 25, 50] as const;

export const MarketsBoard: React.FC<MarketsBoardProps> = ({
  participants,
  roles,
  odds,
  activeBets,
  userChips,
  isBankrupt,
  totalStaked,
  totalPotentialPayout,
  onPlaceBet,
  onRemoveBet,
}) => {
  const [drafts, setDrafts] = useState<Map<string, DraftBet>>(new Map());
  const [globalStake, setGlobalStake] = useState(10);
  const [filter, setFilter] = useState<MarketFilter>('ALL');

  const togglePill = useCallback((betType: BetType, participantId: string, roleId: string, pillOdds: number) => {
    setDrafts((prev) => {
      const key = `${betType}-${participantId}-${roleId}`;
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, { betType, participantId, roleId, amount: globalStake, odds: pillOdds });
      }
      return next;
    });
  }, [globalStake]);

  const isDraftPicked = (betType: BetType, participantId: string, roleId: string) =>
    drafts.has(`${betType}-${participantId}-${roleId}`);

  const handleConfirm = useCallback(() => {
    drafts.forEach((draft) => {
      if (draft.betType === 'SINGLE') {
        onPlaceBet('SINGLE', [draft.participantId], [draft.roleId], draft.amount);
      } else if (draft.betType === 'ANY_ROLE') {
        onPlaceBet('ANY_ROLE', [draft.participantId], [], draft.amount);
      } else if (draft.betType === 'NOT_SELECTED') {
        onPlaceBet('NOT_SELECTED', [draft.participantId], [], draft.amount);
      }
    });
    setDrafts(new Map());
  }, [drafts, onPlaceBet]);

  const getOddsFor = (participantId: string, roleId: string) =>
    odds.find((o) => o.participantId === participantId && o.roleId === roleId);

  const getAnyRoleOdds = (participantId: string): number => {
    const pOdds = odds.filter((o) => o.participantId === participantId);
    const avg = pOdds.reduce((s, o) => s + o.odds, 0) / (pOdds.length || 1);
    return Math.round((avg / roles.length) * 10) / 10;
  };

  const getNotSelectedOdds = (): number => {
    const n = participants.length;
    return Math.round((1 / (1 - roles.length / n)) * 10) / 10;
  };

  const getParticipantProb = (participantId: string): number => {
    const pOdds = odds.filter((o) => o.participantId === participantId);
    if (pOdds.length === 0) return 0;
    return pOdds.reduce((s, o) => s + o.probability, 0) / pOdds.length;
  };

  const getTrending = (participantId: string, roleId: string): 'up' | 'down' | null => {
    let seed = 0;
    for (let i = 0; i < participantId.length; i++) seed += participantId.charCodeAt(i);
    for (let i = 0; i < roleId.length; i++) seed += roleId.charCodeAt(i);
    return seed % 3 === 0 ? 'up' : seed % 3 === 1 ? 'down' : null;
  };

  const sortedParticipants = useMemo(() => {
    const sorted = [...participants].sort((a, b) => b.strength - a.strength);
    if (filter === 'LONGSHOTS') return sorted.reverse();
    return sorted;
  }, [participants, filter]);

  const draftStakeTotal = Array.from(drafts.values()).reduce((s, d) => s + d.amount, 0);
  const notSelOdds = getNotSelectedOdds();

  return (
    <div className="w-full border border-frame bg-void-2/40">
      {/* Header */}
      <div className="px-4 py-3 border-b border-frame flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-neon-magenta rounded-sm" style={{ boxShadow: '0 0 6px oklch(0.62 0.26 12 / 0.5)' }} />
          <div>
            <span className="font-body text-xs font-bold uppercase tracking-[0.1em] text-ink">
              MARKETS · ROLE LOTTERY WK 18
            </span>
            <span className="font-mono text-[9px] text-ink-4 tracking-[0.08em] ml-3">
              {participants.length} runners · {roles.length} roles
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {(['ALL', 'FAVORITES', 'LONGSHOTS'] as MarketFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-[10px] tracking-[0.1em] uppercase pb-0.5 border-b-2 transition-colors ${
                filter === f
                  ? 'text-neon-cyan border-neon-cyan'
                  : 'text-ink-3 border-transparent hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="px-4 py-1.5 border-b border-frame/50 grid items-center gap-2" style={{ gridTemplateColumns: 'minmax(160px, 1fr) 36px 72px repeat(4, minmax(56px, 1fr))' }}>
        <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink-4">RUNNER</span>
        <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink-4 text-center">PROB</span>
        <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink-4 text-center">TREND</span>
        {roles.map((role) => (
          <span key={role.id} className="font-mono text-[8px] tracking-[0.2em] uppercase text-neon-magenta text-center">
            {role.name.toUpperCase()}
          </span>
        ))}
        <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-neon-cyan text-center">ANY ROLE</span>
        <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink-3 text-center">NOT SEL</span>
      </div>

      {/* Rows */}
      <div className="max-h-[340px] overflow-y-auto">
        {sortedParticipants.map((p, index) => {
          const prob = getParticipantProb(p.id);
          const anyOdds = getAnyRoleOdds(p.id);
          const isYou = p.id === '1';

          return (
            <div
              key={p.id}
              className={`px-4 py-2 border-b border-rule/30 grid items-center gap-2 transition-colors hover:bg-surface/20 ${
                isYou ? 'bg-neon-cyan/5' : ''
              }`}
              style={{ gridTemplateColumns: 'minmax(160px, 1fr) 36px 72px repeat(4, minmax(56px, 1fr))' }}
            >
              {/* Runner */}
              <div className="flex items-center gap-2 min-w-0">
                <HexChip name={p.name} index={index} size={30} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-body text-xs font-semibold text-ink truncate">{p.name}</span>
                    {isYou && <span className="font-mono text-[7px] tracking-wider uppercase text-neon-cyan">YOU</span>}
                  </div>
                  <p className="font-mono text-[8px] text-ink-4">strength {p.strength}</p>
                </div>
              </div>

              {/* Prob */}
              <span className="font-mono text-[11px] text-neon-cyan font-semibold tabular-nums text-center">
                {Math.round(prob * 100)}%
              </span>

              {/* Sparkline */}
              <div className="flex justify-center">
                <Sparkline participantId={p.id} width={60} height={18} />
              </div>

              {/* Role pills */}
              {roles.map((role) => {
                const o = getOddsFor(p.id, role.id);
                const pillOdds = o?.odds ?? 1;
                return (
                  <OddsPill
                    key={role.id}
                    odds={pillOdds}
                    label={role.name.slice(0, 3).toUpperCase()}
                    picked={isDraftPicked('SINGLE', p.id, role.id)}
                    trending={getTrending(p.id, role.id)}
                    onClick={() => togglePill('SINGLE', p.id, role.id, pillOdds)}
                  />
                );
              })}

              {/* Any */}
              <OddsPill
                odds={anyOdds}
                label="ANY"
                picked={isDraftPicked('ANY_ROLE', p.id, 'any')}
                onClick={() => togglePill('ANY_ROLE', p.id, 'any', anyOdds)}
              />

              {/* Not sel */}
              <OddsPill
                odds={notSelOdds}
                label="OUT"
                picked={isDraftPicked('NOT_SELECTED', p.id, 'not')}
                onClick={() => togglePill('NOT_SELECTED', p.id, 'not', notSelOdds)}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom bar: locked bets + stake + confirm */}
      <div className="border-t border-frame">
        {activeBets.length > 0 && (
          <div className="px-4 py-1.5 border-b border-rule/30 flex items-center gap-2 overflow-x-auto">
            <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-neon-cyan shrink-0">LOCKED:</span>
            {activeBets.map((bet) => (
              <div key={bet.id} className="flex items-center gap-1 bg-surface border border-neon-magenta/30 px-1.5 py-0.5 shrink-0">
                <span className="font-mono text-[9px] text-ink tabular-nums">₡{bet.amount}@{bet.odds.toFixed(1)}x</span>
                <button onClick={() => onRemoveBet(bet.id)} className="text-ink-4 hover:text-err text-[9px]">&#10005;</button>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-ink-4">STAKE</span>
            {STAKE_OPTIONS.map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setGlobalStake(amt);
                  setDrafts((prev) => {
                    const next = new Map(prev);
                    next.forEach((d, k) => next.set(k, { ...d, amount: amt }));
                    return next;
                  });
                }}
                className={`font-mono text-[9px] tabular-nums px-1.5 py-0.5 border transition-colors ${
                  globalStake === amt
                    ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
                    : 'border-rule text-ink-3 hover:border-rule-strong'
                }`}
              >
                +{amt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-ink-3 tabular-nums">
              {activeBets.length + drafts.size} bets · ₡{totalStaked + draftStakeTotal}
            </span>
            {totalPotentialPayout > 0 && (
              <span className="font-mono text-[9px] text-neon-acid tabular-nums">+₡{totalPotentialPayout.toFixed(0)}</span>
            )}
            <button
              onClick={handleConfirm}
              disabled={isBankrupt || drafts.size === 0}
              className="font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
              style={{
                background: drafts.size > 0 && !isBankrupt
                  ? 'linear-gradient(135deg, oklch(0.62 0.26 12), oklch(0.60 0.24 295))'
                  : 'var(--surface)',
              }}
            >
              ⚡ LOCK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
