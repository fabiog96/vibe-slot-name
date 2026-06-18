export interface Participant {
  id: string;
  name: string;
  strength: number;
}

export interface Role {
  id: string;
  name: string;
}

export type SpinResult = Record<string, Participant | null>;

export enum GameState {
  IDLE = 'IDLE',
  BETTING = 'BETTING',
  SPINNING = 'SPINNING',
  STOPPING = 'STOPPING',
  RESULT = 'RESULT',
}

export type BetType = 'SINGLE' | 'ANY_ROLE' | 'COMBO' | 'NOT_SELECTED';

export interface Bet {
  id: string;
  betType: BetType;
  participantIds: string[];
  roleIds: string[];
  amount: number;
  odds: number;
  potentialPayout: number;
}

export interface BetResult extends Bet {
  won: boolean;
  payout: number;
}

export interface PlayerOdds {
  participantId: string;
  roleId: string;
  odds: number;
  probability: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  chips: number;
  totalBets: number;
  totalWins: number;
  streak: number;
}

export interface MockUser {
  id: string;
  displayName: string;
  chips: number;
  totalBets: number;
  totalWins: number;
  streak: number;
}
