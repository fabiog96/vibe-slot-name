import { useEffect, useRef, useState } from 'react';

import type { RaceScene } from '../scene/createRaceScene';
import { Arrival, DuckView, RacePhase, Runner } from '../types';

interface RaceTrack3DProps {
  runners: Runner[];
  ducks: DuckView[];
  arrivals: Arrival[];
  phase: RacePhase;
}

export const RaceTrack3D: React.FC<RaceTrack3DProps> = ({
  runners,
  ducks,
  arrivals,
  phase,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<RaceScene | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let created: RaceScene | null = null;
    let isCancelled = false;

    import('../scene/createRaceScene').then(({ createRaceScene }) => {
      if (isCancelled) return;
      created = createRaceScene(container);
      setScene(created);
    });

    return () => {
      isCancelled = true;
      created?.dispose();
      setScene(null);
    };
  }, []);

  useEffect(() => {
    scene?.setRunners(runners);
  }, [scene, runners]);

  useEffect(() => {
    scene?.update({ ducks, arrivals, phase });
  }, [scene, ducks, arrivals, phase]);

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-hidden rounded-2xl border-3 border-ink bg-river"
    >
      {!scene && (
        <p className="absolute inset-0 flex items-center justify-center font-display text-xl text-foam">
          Riempio la vasca…
        </p>
      )}
    </div>
  );
};
