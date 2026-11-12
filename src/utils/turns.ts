import { Turn } from '../types';

const REMEMBERED_TURNS = 2;

const today = () => new Date().toLocaleDateString('sv-SE');

export const previousHolders = (turns: Turn[]) =>
  turns.find((turn) => turn.day !== today())?.holderIds ?? [];

export const recordTurn = (turns: Turn[], holderIds: string[]): Turn[] =>
  [
    { day: today(), holderIds },
    ...turns.filter((turn) => turn.day !== today()),
  ].slice(0, REMEMBERED_TURNS);
