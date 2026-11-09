import { useEffect, useRef, useState } from 'react';

import {
  DuckEffect,
  DuckView,
  Participant,
  Placement,
  RacePhase,
  Role,
} from '../types';
import {
  COUNTDOWN_LINE,
  finishLine,
  IDLE_LINE,
  lineFor,
  START_LINE,
} from '../utils/commentary';

const COUNTDOWN_FROM = 3;
const COUNTDOWN_STEP_MS = 800;
const RACE_SECONDS = 20;
const BASE_SPEED = 1 / RACE_SECONDS;
const SPEED_EASING = 2.5;
const TARGET_SPEED_RANGE = [0.6, 1.4] as const;
const RETARGET_SECONDS = [0.4, 1.2] as const;
const MAX_FRAME_SECONDS = 0.05;

const EVENT_CUTOFF_PROGRESS = 0.92;
const LEAD_CALL_MIN_PROGRESS = 0.1;
const LEAD_CALL_GAP_SECONDS = 1.2;

const NET_TRIGGER_WINDOW = [0.35, 0.65] as const;
const NET_DROPBACK = 0.18;
export const NET_CARRY_PHASE = [0.3, 0.85] as const;

const EFFECTS: Record<DuckEffect, { seconds: number; speedFactor: number }> = {
  current: { seconds: 1.2, speedFactor: 1.9 },
  whirlpool: { seconds: 1.1, speedFactor: 0 },
  lilypad: { seconds: 1.6, speedFactor: 0.35 },
  net: { seconds: 1.8, speedFactor: 0 },
};

const RANDOM_EVENT_RATES: [DuckEffect, number][] = [
  ['current', 0.035],
  ['whirlpool', 0.025],
  ['lilypad', 0.03],
];

interface Racer {
  id: string;
  name: string;
  progress: number;
  velocity: number;
  target: number;
  retargetIn: number;
  effect: DuckEffect | null;
  effectLeft: number;
}

const randomBetween = ([min, max]: readonly [number, number]) =>
  min + Math.random() * (max - min);
const randomTarget = () => BASE_SPEED * randomBetween(TARGET_SPEED_RANGE);
const randomInterval = () => randomBetween(RETARGET_SECONDS);

const effectElapsed = (racer: Racer) =>
  racer.effect ? 1 - racer.effectLeft / EFFECTS[racer.effect].seconds : 0;

const isBeingCarried = (racer: Racer) => {
  const elapsed = effectElapsed(racer);
  return (
    racer.effect === 'net' &&
    elapsed > NET_CARRY_PHASE[0] &&
    elapsed < NET_CARRY_PHASE[1]
  );
};

const NET_CARRY_SPEED =
  NET_DROPBACK /
  ((NET_CARRY_PHASE[1] - NET_CARRY_PHASE[0]) * EFFECTS.net.seconds);

const advance = (racer: Racer, dt: number): Racer => {
  if (racer.progress >= 1)
    return { ...racer, velocity: 0, effect: null, effectLeft: 0 };

  const effectLeft = Math.max(0, racer.effectLeft - dt);
  const effect = effectLeft > 0 ? racer.effect : null;

  const isRetargetDue = racer.retargetIn <= dt;
  const target = isRetargetDue ? randomTarget() : racer.target;
  const speedFactor = effect ? EFFECTS[effect].speedFactor : 1;
  const easing = effect === 'current' ? SPEED_EASING * 2 : SPEED_EASING;
  const velocity =
    speedFactor === 0
      ? 0
      : racer.velocity +
        (target * speedFactor - racer.velocity) * Math.min(1, dt * easing);

  const next = { ...racer, effect, effectLeft };
  const carryBack = isBeingCarried(next) ? NET_CARRY_SPEED * dt : 0;

  return {
    ...next,
    target,
    velocity,
    retargetIn: isRetargetDue ? randomInterval() : racer.retargetIn - dt,
    progress: Math.max(
      0,
      Math.min(1, racer.progress + velocity * dt - carryBack),
    ),
  };
};

const rollRandomEvent = (racer: Racer, dt: number): DuckEffect | null => {
  if (racer.effect || racer.progress >= EVENT_CUTOFF_PROGRESS) return null;
  const hit = RANDOM_EVENT_RATES.find(([, rate]) => Math.random() < rate * dt);
  return hit ? hit[0] : null;
};

const withEffect = (racer: Racer, effect: DuckEffect): Racer => ({
  ...racer,
  effect,
  effectLeft: EFFECTS[effect].seconds,
});

const leaderOf = (racers: Racer[]) =>
  racers.reduce((best, r) => (r.progress > best.progress ? r : best));

const startingGrid = (participants: Participant[]): Racer[] =>
  participants.map((p) => ({
    id: p.id,
    name: p.name,
    progress: 0,
    velocity: 0,
    target: randomTarget(),
    retargetIn: randomInterval(),
    effect: null,
    effectLeft: 0,
  }));

export const useDuckRace = (participants: Participant[], roles: Role[]) => {
  const [phase, setPhase] = useState<RacePhase>('idle');
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [finishers, setFinishers] = useState<string[]>([]);
  const [commentary, setCommentary] = useState(IDLE_LINE);
  const frame = useRef(0);
  const timer = useRef(0);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(timer.current);
    },
    [],
  );

  const isRunning = phase === 'countdown' || phase === 'racing';
  const hasEnoughRunners =
    roles.length > 0 && participants.length >= roles.length;

  const race = (grid: Racer[], podiumSize: number) => {
    const netTriggerAt = randomBetween(NET_TRIGGER_WINDOW);
    const order: string[] = [];
    let current = grid;
    let isNetUsed = false;
    let announcedLeaderId = '';
    let clock = 0;
    let lastCallAt = 0;
    let last = performance.now();

    const announce = (text: string) => {
      setCommentary(text);
      lastCallAt = clock;
    };

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
      last = now;
      clock += dt;

      current = current.map((r) => {
        const moved = advance(r, dt);
        const event = rollRandomEvent(moved, dt);
        if (!event) return moved;
        announce(lineFor(event, r.name));
        return withEffect(moved, event);
      });

      const leader = leaderOf(current);

      if (!isNetUsed && leader.progress >= netTriggerAt) {
        isNetUsed = true;
        const candidates = current.filter((r) => r.progress < 1 && !r.effect);
        if (candidates.length > 0) {
          const caught =
            candidates[Math.floor(Math.random() * candidates.length)];
          current = current.map((r) =>
            r.id === caught.id ? withEffect(r, 'net') : r,
          );
          announce(lineFor('net', caught.name));
        }
      }

      current.forEach((r) => {
        if (r.progress < 1 || order.includes(r.id)) return;
        order.push(r.id);
        announce(finishLine(r.name, order.length));
      });

      const canCallLead =
        order.length === 0 &&
        leader.id !== announcedLeaderId &&
        leader.progress > LEAD_CALL_MIN_PROGRESS &&
        clock - lastCallAt > LEAD_CALL_GAP_SECONDS;
      if (canCallLead) {
        announce(lineFor('lead', leader.name));
        announcedLeaderId = leader.id;
      }

      setRacers(current);
      setFinishers([...order]);

      if (order.length >= podiumSize) {
        setPhase('finished');
        return;
      }
      frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
  };

  const startRace = () => {
    if (isRunning || !hasEnoughRunners) return;

    const grid = startingGrid(participants);
    const podiumSize = roles.length;

    setRacers(grid);
    setFinishers([]);
    setPhase('countdown');
    setCommentary(COUNTDOWN_LINE);

    const count = (n: number) => {
      if (n === 0) {
        setPhase('racing');
        setCommentary(START_LINE);
        race(grid, podiumSize);
        return;
      }
      setCountdown(n);
      timer.current = window.setTimeout(() => count(n - 1), COUNTDOWN_STEP_MS);
    };
    count(COUNTDOWN_FROM);
  };

  const ducks: DuckView[] = racers.map((r) => ({
    id: r.id,
    progress: r.progress,
    surge: r.velocity / BASE_SPEED,
    effect: r.effect,
    effectElapsed: effectElapsed(r),
  }));

  const podium = roles.flatMap((role, i): Placement[] => {
    const participant = participants.find((p) => p.id === finishers[i]);
    return participant ? [{ role, participant }] : [];
  });

  return {
    phase,
    countdown,
    ducks,
    finishers,
    podium,
    commentary,
    isRunning,
    hasEnoughRunners,
    startRace,
  };
};
