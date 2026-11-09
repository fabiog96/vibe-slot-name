import { NET_CARRY_PHASE } from '../hooks/useDuckRace';
import { DuckView } from '../types';
import { Duck } from './Duck';
import { Net } from './Net';

const MAX_TILT_DEG = 8;
const NET_LIFT_PX = 28;
const NET_START_OFFSET_PX = 80;
const [CARRY_START, CARRY_END] = NET_CARRY_PHASE;

interface RacingDuckProps {
  duck: DuckView | undefined;
  bandana: string;
  size: number;
  travel: string;
  isRacing: boolean;
}

const tiltFor = (duck: DuckView) => {
  const tilt = (duck.surge - 1) * MAX_TILT_DEG;
  return Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, tilt));
};

const netLift = (elapsed: number) =>
  elapsed > CARRY_START && elapsed < CARRY_END
    ? Math.sin((Math.PI * (elapsed - CARRY_START)) / (CARRY_END - CARRY_START)) *
      NET_LIFT_PX
    : 0;

const netOffset = (elapsed: number) => {
  if (elapsed <= CARRY_START)
    return -NET_START_OFFSET_PX * (1 - elapsed / CARRY_START);
  if (elapsed >= CARRY_END)
    return -NET_START_OFFSET_PX * ((elapsed - CARRY_END) / (1 - CARRY_END));
  return -netLift(elapsed);
};

export const RacingDuck: React.FC<RacingDuckProps> = ({
  duck,
  bandana,
  size,
  travel,
  isRacing,
}) => {
  const progress = duck?.progress ?? 0;
  const effect = isRacing ? (duck?.effect ?? null) : null;
  const elapsed = duck?.effectElapsed ?? 0;
  const isMoving = isRacing && progress < 1;
  const tilt = duck && isMoving && !effect ? tiltFor(duck) : 0;
  const lift = effect === 'net' ? netLift(elapsed) : 0;

  return (
    <div
      className="absolute left-0 top-1/2 z-10 will-change-transform"
      style={{
        transform: `translate(calc(${progress} * ${travel}), calc(-58% - ${lift}px)) rotate(${tilt}deg)`,
      }}
    >
      {effect === 'current' && (
        <div className="absolute -left-7 top-1/2 flex -translate-y-1/2 flex-col gap-1.5">
          <span className="h-0.5 w-6 animate-streak rounded-full bg-white" />
          <span className="h-0.5 w-8 animate-streak rounded-full bg-white [animation-delay:-0.15s]" />
          <span className="h-0.5 w-5 animate-streak rounded-full bg-white [animation-delay:-0.3s]" />
        </div>
      )}

      {effect === 'whirlpool' && (
        <span className="absolute left-1/2 top-[70%] size-12 -translate-x-1/2 -translate-y-1/2 animate-whirl rounded-full border-4 border-dotted border-white/70" />
      )}

      {effect === 'lilypad' && (
        <span className="absolute -right-3 bottom-0 flex animate-pop gap-0.5">
          <span className="h-3 w-6 rounded-[50%] border border-ink/40 bg-[#5BB450]" />
          <span className="mt-1 h-2.5 w-5 rounded-[50%] border border-ink/40 bg-[#4C9E43]" />
        </span>
      )}

      <div className={effect === 'whirlpool' ? 'animate-whirl' : undefined}>
        <Duck
          bandana={bandana}
          size={size}
          isBobbing={isMoving && effect !== 'whirlpool' && effect !== 'net'}
        />
      </div>

      {effect === 'net' && (
        <div
          className="absolute -left-2 bottom-[-14px] z-20"
          style={{
            transform: `translateY(${netOffset(elapsed)}px)`,
          }}
        >
          <Net />
        </div>
      )}

      {effect === 'net' && elapsed >= CARRY_END && (
        <span className="absolute left-1/2 top-full size-10 -translate-x-1/2 -translate-y-1/2 animate-splash rounded-full border-4 border-white" />
      )}
    </div>
  );
};
