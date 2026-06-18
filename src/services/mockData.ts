import type { Participant, Role, PlayerOdds, Bet, BetResult, LeaderboardEntry, MockUser, SpinResult } from '../types';

export const MOCK_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Capra', strength: 85 },
  { id: '2', name: 'Mapelli', strength: 70 },
  { id: '3', name: 'Baccini', strength: 90 },
  { id: '4', name: 'Farinato', strength: 60 },
  { id: '5', name: 'Yang', strength: 110 },
  { id: '6', name: 'Agati', strength: 50 },
  { id: '7', name: 'Olivieri', strength: 75 },
  { id: '8', name: 'Petta', strength: 65 },
  { id: '9', name: 'Cariato', strength: 95 },
  { id: '10', name: 'Gioia', strength: 80 },
  { id: '11', name: 'Manduca', strength: 55 },
];

export const MOCK_ROLES: Role[] = [
  { id: 'r1', name: 'Moderator' },
  { id: 'r2', name: 'Notary' },
];

export const MOCK_USER: MockUser = {
  id: 'u1',
  displayName: 'You',
  chips: 100,
  totalBets: 0,
  totalWins: 0,
  streak: 0,
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { userId: 'u2', displayName: 'Rossi', chips: 245, totalBets: 18, totalWins: 12, streak: 3 },
  { userId: 'u3', displayName: 'Bianchi', chips: 180, totalBets: 15, totalWins: 9, streak: 1 },
  { userId: 'u1', displayName: 'You', chips: 100, totalBets: 0, totalWins: 0, streak: 0 },
  { userId: 'u4', displayName: 'Verdi', chips: 75, totalBets: 20, totalWins: 8, streak: 0 },
  { userId: 'u5', displayName: 'Neri', chips: 30, totalBets: 12, totalWins: 3, streak: 0 },
  { userId: 'u6', displayName: 'Russo', chips: 0, totalBets: 10, totalWins: 1, streak: 0 },
];

type ParticipantStats = Record<string, { timesSelected: number; totalSpins: number }>;

const MOCK_STATS: ParticipantStats = {
  '1': { timesSelected: 5, totalSpins: 20 },
  '2': { timesSelected: 3, totalSpins: 20 },
  '3': { timesSelected: 4, totalSpins: 20 },
  '4': { timesSelected: 2, totalSpins: 20 },
  '5': { timesSelected: 6, totalSpins: 20 },
  '6': { timesSelected: 1, totalSpins: 20 },
  '7': { timesSelected: 3, totalSpins: 20 },
  '8': { timesSelected: 2, totalSpins: 20 },
  '9': { timesSelected: 4, totalSpins: 20 },
  '10': { timesSelected: 3, totalSpins: 20 },
  '11': { timesSelected: 1, totalSpins: 20 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const generateMockOdds = (
  participants: Participant[],
  roles: Role[],
): PlayerOdds[] => {
  const odds: PlayerOdds[] = [];

  for (const role of roles) {
    const roleOdds: number[] = [];

    for (const p of participants) {
      const stats = MOCK_STATS[p.id] ?? { timesSelected: 0, totalSpins: 20 };
      const raw = (stats.totalSpins + 1) / (stats.timesSelected + 1);
      const clamped = clamp(raw, 1.1, 20.0);
      roleOdds.push(clamped);
    }

    const totalInverse = roleOdds.reduce((sum, o) => sum + 1 / o, 0);

    for (let i = 0; i < participants.length; i++) {
      odds.push({
        participantId: participants[i].id,
        roleId: role.id,
        odds: Math.round(roleOdds[i] * 10) / 10,
        probability: Math.round((1 / roleOdds[i] / totalInverse) * 100) / 100,
      });
    }
  }

  return odds;
};

export const evaluateBets = (
  bets: Bet[],
  spinResult: SpinResult,
  roles: Role[],
): BetResult[] => {
  const winnerByRole = new Map<string, string>();
  for (const role of roles) {
    const winner = spinResult[role.id];
    if (winner) winnerByRole.set(role.id, winner.id);
  }

  const selectedParticipants = new Set(winnerByRole.values());

  return bets.map((bet) => {
    let won = false;

    switch (bet.betType) {
      case 'SINGLE': {
        const targetParticipant = bet.participantIds[0];
        const targetRole = bet.roleIds[0];
        won = winnerByRole.get(targetRole) === targetParticipant;
        break;
      }
      case 'ANY_ROLE': {
        const targetParticipant = bet.participantIds[0];
        won = selectedParticipants.has(targetParticipant);
        break;
      }
      case 'COMBO': {
        won = bet.participantIds.every((pId, i) =>
          winnerByRole.get(bet.roleIds[i]) === pId,
        );
        break;
      }
      case 'NOT_SELECTED': {
        const targetParticipant = bet.participantIds[0];
        won = !selectedParticipants.has(targetParticipant);
        break;
      }
    }

    return {
      ...bet,
      won,
      payout: won ? Math.round(bet.potentialPayout) : 0,
    };
  });
};
