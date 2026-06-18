import { useState, useCallback, useMemo } from 'react';

import type { Participant, Role, Bet, BetType, PlayerOdds } from '../../types';
import { CountdownTimer } from './CountdownTimer';
import { ChipBadge } from './ChipBadge';
import { HexChip } from './HexChip';
import { Sparkline } from './Sparkline';
import { OddsPill } from './OddsPill';

type MarketFilter = 'ALL' | 'FAVORITES' | 'LONGSHOTS';

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  roles: Role[];
  odds: PlayerOdds[];
  activeBets: Bet[];
  userChips: number;
  isBankrupt: boolean;
  totalStaked: number;
  totalPotentialPayout: number;
  secondsLeft: number;
  totalSeconds: number;
  formatted: string;
  onPlaceBet: (betType: BetType, participantIds: string[], roleIds: string[], amount: number) => Bet | null;
  onRemoveBet: (betId: string) => void;
  onReady: () => void;
}

interface DraftBet {
  betType: BetType;
  participantId: string;
  roleId: string;
  amount: number;
  odds: number;
}

const STAKE_OPTIONS = [5, 10, 25, 50] as const;

export const BettingModal: React.FC<BettingModalProps> = ({
  isOpen,
  onClose,
  participants,
  roles,
  odds,
  activeBets,
  userChips,
  isBankrupt,
  totalStaked,
  totalPotentialPayout,
  secondsLeft,
  totalSeconds,
  formatted,
  onPlaceBet,
  onRemoveBet,
  onReady,
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

  const handleConfirmDrafts = useCallback(() => {
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

  const handleReady = useCallback(() => {
    if (drafts.size > 0) handleConfirmDrafts();
    onReady();
  }, [drafts.size, handleConfirmDrafts, onReady]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="modal-overlay fixed inset-0" />
      <div
        className="modal-content animate-modal-enter relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col notch-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-neon-magenta/30" style={{ boxShadow: '0 1px 8px oklch(0.62 0.26 12 / 0.08)' }}>
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-neon-magenta rounded-sm" style={{ boxShadow: '0 0 6px oklch(0.62 0.26 12 / 0.5)' }} />
              <div>
                <h2 className="font-body text-sm font-bold uppercase tracking-[0.1em] text-ink">
                  MARKETS · ROLE LOTTERY
                </h2>
                <p className="font-mono text-[9px] text-ink-4 tracking-[0.1em]">
                  {participants.length} runners · {roles.length} roles · 4 markets
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ChipBadge chips={userChips} size="sm" bankrupt={isBankrupt} />
              <div className="w-28">
                <CountdownTimer secondsLeft={secondsLeft} totalSeconds={totalSeconds} formatted={formatted} />
              </div>
              <button onClick={onClose} className="p-1 text-ink-4 hover:text-neon-magenta transition-colors font-mono text-sm">&#10005;</button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-5">
            {(['ALL', 'FAVORITES', 'LONGSHOTS'] as MarketFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-mono text-[11px] tracking-[0.12em] uppercase pb-1 border-b-2 transition-colors ${
                  filter === f
                    ? 'text-neon-cyan border-neon-cyan glow-cyan'
                    : 'text-ink-3 border-transparent hover:text-ink'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div className="px-5 py-2 border-b border-neon-magenta/20 grid items-center gap-2" style={{ gridTemplateColumns: 'minmax(180px, 1fr) 40px 80px repeat(4, minmax(64px, 1fr))' }}>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-4">RUNNER</span>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-4 text-center">PROB</span>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-4 text-center">TREND</span>
          {roles.map((role) => (
            <span key={role.id} className="font-mono text-[9px] tracking-[0.2em] uppercase text-neon-magenta text-center">
              {role.name.length > 5 ? role.name.slice(0, 3).toUpperCase() : role.name.toUpperCase()}
            </span>
          ))}
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-neon-cyan text-center">ANY</span>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-3 text-center">NOT SEL</span>
        </div>

        {/* Market rows */}
        <div className="flex-1 overflow-y-auto">
          {sortedParticipants.map((p, index) => {
            const prob = getParticipantProb(p.id);
            const anyOdds = getAnyRoleOdds(p.id);
            const isYou = p.id === '1';

            return (
              <div
                key={p.id}
                className={`px-5 py-2.5 border-b border-rule/50 grid items-center gap-2 transition-colors hover:bg-surface/30 ${
                  isYou ? 'bg-neon-cyan/5' : ''
                }`}
                style={{ gridTemplateColumns: 'minmax(180px, 1fr) 40px 80px repeat(4, minmax(64px, 1fr))' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <HexChip name={p.name} index={index} size={36} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-body text-sm font-semibold text-ink truncate">{p.name}</span>
                      {isYou && <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-neon-cyan">YOU</span>}
                    </div>
                    <p className="font-mono text-[9px] text-ink-4 tracking-wider">strength {p.strength}</p>
                  </div>
                </div>

                <span className="font-mono text-xs text-neon-cyan font-semibold tabular-nums text-center">
                  {Math.round(prob * 100)}%
                </span>

                <div className="flex justify-center">
                  <Sparkline participantId={p.id} width={70} height={20} />
                </div>

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

                <OddsPill
                  odds={anyOdds}
                  label="ANY"
                  picked={isDraftPicked('ANY_ROLE', p.id, 'any')}
                  onClick={() => togglePill('ANY_ROLE', p.id, 'any', anyOdds)}
                />

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

        {/* Locked bets strip */}
        {activeBets.length > 0 && (
          <div className="px-5 py-2 border-t border-rule bg-void-3/50">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-neon-cyan shrink-0">LOCKED:</span>
              {activeBets.map((bet) => (
                <div key={bet.id} className="flex items-center gap-1.5 bg-surface border border-neon-magenta/30 px-2 py-1 shrink-0">
                  <span className="font-mono text-[10px] text-ink tabular-nums">₡{bet.amount} @ {bet.odds.toFixed(1)}x</span>
                  <button onClick={() => onRemoveBet(bet.id)} className="text-ink-4 hover:text-err text-[10px] font-mono">&#10005;</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom bar: stake + lock + ready */}
        <div className="px-5 py-3 border-t border-frame flex items-center justify-between gap-3">
          {/* Stake selector */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink-4">STAKE</span>
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
                className={`font-mono text-[10px] tabular-nums px-2 py-0.5 border transition-colors ${
                  globalStake === amt
                    ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
                    : 'border-rule text-ink-3 hover:border-rule-strong'
                }`}
              >
                +{amt}
              </button>
            ))}
          </div>

          {/* Summary + actions */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-ink-3 tabular-nums">
              {activeBets.length + drafts.size} bets · ₡{totalStaked + draftStakeTotal}
            </span>
            {totalPotentialPayout > 0 && (
              <span className="font-mono text-[9px] text-neon-acid tabular-nums">+₡{totalPotentialPayout.toFixed(0)}</span>
            )}

            {/* Lock drafts button */}
            {drafts.size > 0 && (
              <button
                onClick={handleConfirmDrafts}
                disabled={isBankrupt}
                className="font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 transition-all disabled:opacity-30"
              >
                ⚡ LOCK {drafts.size}
              </button>
            )}

            {/* READY button */}
            <button
              onClick={handleReady}
              className="font-body text-xs font-bold tracking-[0.12em] uppercase px-5 py-2 text-white transition-all active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, oklch(0.62 0.26 12), oklch(0.60 0.24 295))',
                boxShadow: '0 0 12px oklch(0.62 0.26 12 / 0.25)',
              }}
            >
              ✓ READY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
