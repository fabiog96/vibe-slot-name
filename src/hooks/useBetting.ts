import { useState, useCallback } from 'react';

import type { Bet, BetResult, BetType, PlayerOdds, SpinResult, Role } from '../types';
import { generateMockOdds, evaluateBets, MOCK_PARTICIPANTS, MOCK_ROLES } from '../services/mockData';

const STORAGE_KEY = 'betmarket-chips';
const DEFAULT_CHIPS = 100;

const loadChips = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : DEFAULT_CHIPS;
  }
  return DEFAULT_CHIPS;
};

const saveChips = (chips: number) => {
  localStorage.setItem(STORAGE_KEY, String(chips));
};

let betIdCounter = 0;

export const useBetting = () => {
  const [userChips, setUserChips] = useState<number>(loadChips);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [betResults, setBetResults] = useState<BetResult[]>([]);
  const [odds, setOdds] = useState<PlayerOdds[]>([]);

  const isBankrupt = userChips === 0 && activeBets.length === 0;

  const refreshOdds = useCallback(() => {
    const newOdds = generateMockOdds(MOCK_PARTICIPANTS, MOCK_ROLES);
    setOdds(newOdds);
  }, []);

  const placeBet = useCallback((
    betType: BetType,
    participantIds: string[],
    roleIds: string[],
    amount: number,
  ) => {
    if (amount <= 0 || amount > userChips) return null;

    let betOdds = 1;
    if (betType === 'SINGLE') {
      const found = odds.find(
        (o) => o.participantId === participantIds[0] && o.roleId === roleIds[0],
      );
      betOdds = found?.odds ?? 1;
    } else if (betType === 'ANY_ROLE') {
      const participantOdds = odds.filter((o) => o.participantId === participantIds[0]);
      const avgOdds = participantOdds.reduce((sum, o) => sum + o.odds, 0) / (participantOdds.length || 1);
      betOdds = avgOdds / MOCK_ROLES.length;
    } else if (betType === 'COMBO') {
      betOdds = participantIds.reduce((acc, pId, i) => {
        const found = odds.find((o) => o.participantId === pId && o.roleId === roleIds[i]);
        return acc * (found?.odds ?? 1);
      }, 1);
    } else if (betType === 'NOT_SELECTED') {
      const n = MOCK_PARTICIPANTS.length;
      betOdds = Math.round((1 / (1 - MOCK_ROLES.length / n)) * 10) / 10;
    }

    const bet: Bet = {
      id: `bet-${++betIdCounter}`,
      betType,
      participantIds,
      roleIds,
      amount,
      odds: Math.round(betOdds * 10) / 10,
      potentialPayout: Math.round(betOdds * amount * 10) / 10,
    };

    setUserChips((prev) => {
      const next = prev - amount;
      saveChips(next);
      return next;
    });
    setActiveBets((prev) => [...prev, bet]);

    return bet;
  }, [userChips, odds]);

  const removeBet = useCallback((betId: string) => {
    setActiveBets((prev) => {
      const bet = prev.find((b) => b.id === betId);
      if (bet) {
        setUserChips((chips) => {
          const next = chips + bet.amount;
          saveChips(next);
          return next;
        });
      }
      return prev.filter((b) => b.id !== betId);
    });
  }, []);

  const evaluateResults = useCallback((spinResult: SpinResult, roles: Role[]) => {
    const results = evaluateBets(activeBets, spinResult, roles);
    setBetResults(results);

    const totalWinnings = results.reduce((sum, r) => sum + r.payout, 0);
    if (totalWinnings > 0) {
      setUserChips((prev) => {
        const next = prev + totalWinnings;
        saveChips(next);
        return next;
      });
    }

    return results;
  }, [activeBets]);

  const resetBets = useCallback(() => {
    setActiveBets([]);
    setBetResults([]);
  }, []);

  const resetChips = useCallback(() => {
    setUserChips(DEFAULT_CHIPS);
    saveChips(DEFAULT_CHIPS);
    setActiveBets([]);
    setBetResults([]);
  }, []);

  const totalStaked = activeBets.reduce((sum, b) => sum + b.amount, 0);
  const totalPotentialPayout = activeBets.reduce((sum, b) => sum + b.potentialPayout, 0);

  return {
    userChips,
    activeBets,
    betResults,
    odds,
    isBankrupt,
    totalStaked,
    totalPotentialPayout,
    refreshOdds,
    placeBet,
    removeBet,
    evaluateResults,
    resetBets,
    resetChips,
  };
};
