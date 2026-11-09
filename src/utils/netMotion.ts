import { NET_CARRY_PHASE } from '../hooks/useDuckRace';

const [CARRY_START, CARRY_END] = NET_CARRY_PHASE;

export const netLift = (elapsed: number) =>
  elapsed > CARRY_START && elapsed < CARRY_END
    ? Math.sin((Math.PI * (elapsed - CARRY_START)) / (CARRY_END - CARRY_START))
    : 0;

export const netHeight = (elapsed: number) => {
  if (elapsed <= CARRY_START) return 1 - elapsed / CARRY_START;
  if (elapsed >= CARRY_END) return (elapsed - CARRY_END) / (1 - CARRY_END);
  return 0;
};

export const splashProgress = (elapsed: number) =>
  elapsed >= CARRY_END ? (elapsed - CARRY_END) / (1 - CARRY_END) : 0;
