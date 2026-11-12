import { useEffect, useRef, useState } from 'react';

import { play } from '../audio/sounds';
import {
  Arrival,
  CommentaryLine,
  DuckEffect,
  DuckView,
  Placement,
  RacePhase,
  Role,
  Runner,
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
const RACE_SECONDS = 12;
const BASE_SPEED = 1 / RACE_SECONDS;
const SPEED_EASING = 2.5;
const TARGET_SPEED_RANGE = [0.6, 1.4] as const;
const RETARGET_SECONDS = [0.4, 1.2] as const;
const MAX_FRAME_SECONDS = 0.05;
const MAX_COMMENTARY_LINES = 40;

const EVENT_CUTOFF_PROGRESS = 0.92;
const LEAD_CALL_MIN_PROGRESS = 0.1;
const LEAD_CALL_GAP_SECONDS = 1.2;

const NET_TRIGGER_WINDOW = [0.35, 0.65] as const;
const NET_DROPBACK = 0.18;
export const NET_CARRY_PHASE = [0.3, 0.85] as const;

const EFFECTS: Record<DuckEffect, { seconds: number; speedFactor: number }> = {
  jet: { seconds: 1.2, speedFactor: 1.9 },
  rope: { seconds: 1.1, speedFactor: 0 },
  capsize: { seconds: 1.6, speedFactor: 0.35 },
  net: { seconds: 1.8, speedFactor: 0 },
};

const RANDOM_EVENT_RATES: [DuckEffect, number][] = [
  ['jet', 0.035],
  ['rope', 0.025],
  ['capsize', 0.03],
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
  const easing = effect === 'jet' ? SPEED_EASING * 2 : SPEED_EASING;
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

const startingGrid = (runners: Runner[]): Racer[] =>
  runners.map((p) => ({
    id: p.id,
    name: p.name,
    progress: 0,
    velocity: 0,
    target: randomTarget(),
    retargetIn: randomInterval(),
    effect: null,
    effectLeft: 0,
  }));

export const useDuckRace = (
  runners: Runner[],
  roles: Role[],
  lastHolderIds: string[],
) => {
  const [phase, setPhase] = useState<RacePhase>('idle');
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [unavailableIds, setUnavailableIds] = useState<string[]>([]);
  const [restingIds, setRestingIds] = useState<string[]>([]);
  const [commentary, setCommentary] = useState<CommentaryLine[]>([
    { id: 0, text: IDLE_LINE, seconds: 0 },
  ]);
  const frame = useRef(0);
  const timer = useRef(0);
  const lineId = useRef(0);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(timer.current);
    },
    [],
  );

  const isRunning = phase === 'countdown' || phase === 'racing';
  const hasEnoughRunners =
    roles.length > 0 && runners.length >= roles.length;

  const pushLine = (text: string, seconds: number) => {
    lineId.current += 1;
    const line = { id: lineId.current, text, seconds };
    setCommentary((prev) => [line, ...prev].slice(0, MAX_COMMENTARY_LINES));
  };

  const race = (grid: Racer[]) => {
    const netTriggerAt = randomBetween(NET_TRIGGER_WINDOW);
    const order: Arrival[] = [];
    let current = grid;
    let isNetUsed = false;
    let announcedLeaderId = '';
    let clock = 0;
    let lastCallAt = 0;
    let last = performance.now();

    const announce = (text: string) => {
      pushLine(text, clock);
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
          play('net');
        }
      }

      current.forEach((r) => {
        if (r.progress < 1 || order.some((a) => a.id === r.id)) return;
        order.push({
          id: r.id,
          name: r.name,
          place: order.length + 1,
          seconds: clock,
        });
        announce(finishLine(r.name, order.length, current.length));
        play(order.length === current.length ? 'finish' : 'arrival');
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
      setArrivals([...order]);

      if (order.length === current.length) {
        setPhase('finished');
        return;
      }
      frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
  };

  const startRace = () => {
    if (isRunning || !hasEnoughRunners) return;

    const grid = startingGrid(runners);

    setRacers(grid);
    setArrivals([]);
    setUnavailableIds(lastHolderIds);
    setRestingIds(lastHolderIds);
    setPhase('countdown');
    pushLine(COUNTDOWN_LINE, 0);

    const count = (n: number) => {
      if (n === 0) {
        setPhase('racing');
        pushLine(START_LINE, 0);
        play('start');
        race(grid);
        return;
      }
      setCountdown(n);
      play('countdown');
      timer.current = window.setTimeout(() => count(n - 1), COUNTDOWN_STEP_MS);
    };
    count(COUNTDOWN_FROM);
  };

  const toggleAvailability = (id: string) => {
    setUnavailableIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const ducks: DuckView[] = racers.map((r) => ({
    id: r.id,
    progress: r.progress,
    surge: r.velocity / BASE_SPEED,
    effect: r.effect,
    effectElapsed: effectElapsed(r),
  }));

  const availableFromLast = arrivals
    .filter((a) => !unavailableIds.includes(a.id))
    .reverse();
  const placements = roles.flatMap((role, i): Placement[] => {
    const arrival = availableFromLast[i];
    return arrival ? [{ role, arrival }] : [];
  });

  return {
    phase,
    countdown,
    ducks,
    arrivals,
    placements,
    unavailableIds,
    restingIds,
    commentary,
    isRunning,
    hasEnoughRunners,
    startRace,
    toggleAvailability,
  };
};
