import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import { Arrival, DuckView, RacePhase } from '../types';
import { createCamera, fitCamera } from './camera';
import { createLighting } from './createLighting';
import { createRiver, riverLayout } from './createRiver';
import { Quality } from './createWater';
import { disposeTree } from './disposeTree';
import { createDuckRig, DuckRig, poseDuckRig } from './duckRig';
import { arrivalChip, nameLabel, showArrival } from './laneLabels';

const MAX_PIXEL_RATIO = 2;
const LOW_QUALITY_MAX_WIDTH = 768;
const FPS_WINDOW_MS = 2000;
const FPS_WARMUP_MS = 3000;
const FPS_FLOOR = 40;
const SLOW_WINDOWS_BEFORE_DOWNGRADE = 2;
const RELAYOUT_ASPECT_CHANGE = 0.25;
const DUCK_START_OFFSET = 0.7;
const CHIP_OFFSET = 1.4;

interface Runner {
  id: string;
  name: string;
  color: string;
}

interface RaceFrame {
  ducks: DuckView[];
  arrivals: Arrival[];
  phase: RacePhase;
}

interface Lane {
  runner: Runner;
  rig: DuckRig;
  chip: HTMLSpanElement;
  shownPlace: number;
}

const initialQuality = (): Quality =>
  window.innerWidth < LOW_QUALITY_MAX_WIDTH ||
  window.matchMedia('(pointer: coarse)').matches
    ? 'low'
    : 'high';

export const createRaceScene = (container: HTMLElement) => {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let quality = initialQuality();

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(quality === 'high' ? Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO) : 1);
  renderer.shadowMap.enabled = quality === 'high';
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = 'absolute inset-0 size-full';
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = 'pointer-events-none absolute inset-0';
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  const camera = createCamera();
  const lighting = createLighting();
  lighting.sun.castShadow = quality === 'high';
  scene.background = lighting.sky;
  scene.environment = lighting.sky;
  scene.add(...lighting.lights);

  let layout = riverLayout(0, 1);
  let runners: Runner[] = [];
  let layoutAspect = 1;
  let river: ReturnType<typeof createRiver> | undefined;
  let lanes: Lane[] = [];
  let world = new THREE.Group();

  let frame: RaceFrame = { ducks: [], arrivals: [], phase: 'idle' };

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    const aspect = width / height;
    if (Math.abs(aspect - layoutAspect) / layoutAspect > RELAYOUT_ASPECT_CHANGE) {
      setRunners(runners);
      return;
    }
    renderer.setSize(width, height, false);
    labelRenderer.setSize(width, height);
    fitCamera(camera, layout, aspect);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);

  function setRunners(next: Runner[]) {
    runners = next;
    layoutAspect = container.clientWidth / Math.max(container.clientHeight, 1);
    scene.remove(world);
    disposeTree(world);

    layout = riverLayout(runners.length, layoutAspect);
    river = createRiver(layout, runners.length, quality, isReducedMotion);
    world = new THREE.Group();
    world.add(river.group);

    lanes = runners.map((runner, i) => {
      const z = layout.laneZ(i);
      const rig = createDuckRig(runner.color, layout.lane);
      rig.group.position.set(layout.startX + DUCK_START_OFFSET, 0, z);

      const name = nameLabel(runner.name, runner.color);
      name.position.set(layout.startX - layout.dockWidth / 2 + 0.2, 0.35, z);

      const chip = arrivalChip();
      const chipLabel = new CSS2DObject(chip);
      chipLabel.position.set(layout.finishX - CHIP_OFFSET, 0.8, z);

      world.add(rig.group, name, chipLabel);
      return { runner, rig, chip, shownPlace: 0 };
    });

    scene.add(world);
    resize();
  }

  const downgrade = () => {
    quality = 'low';
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false;
    lighting.sun.castShadow = false;
    river?.setQuality('low');
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const materials: THREE.Material[] = Array.isArray(node.material)
          ? node.material
          : [node.material];
        materials.forEach((m) => (m.needsUpdate = true));
      }
    });
    resize();
  };

  const timer = new THREE.Timer();
  const startedAt = performance.now();
  let frames = 0;
  let windowStart = startedAt;
  let slowWindows = 0;

  const watchFrameRate = (now: number) => {
    frames += 1;
    if (now - windowStart < FPS_WINDOW_MS) return;
    const fps = (frames * 1000) / (now - windowStart);
    frames = 0;
    windowStart = now;
    if (quality === 'low' || now - startedAt < FPS_WARMUP_MS) return;
    slowWindows = fps < FPS_FLOOR ? slowWindows + 1 : 0;
    if (slowWindows >= SLOW_WINDOWS_BEFORE_DOWNGRADE) downgrade();
  };

  renderer.setAnimationLoop((now) => {
    timer.update(now);
    const dt = Math.min(timer.getDelta(), 0.05);
    const time = timer.getElapsed();
    const isRacing = frame.phase === 'racing';
    const duckById = new Map(frame.ducks.map((d) => [d.id, d]));
    const arrivalById = new Map(frame.arrivals.map((a) => [a.id, a]));
    const travel = layout.finishX - 0.3 - (layout.startX + DUCK_START_OFFSET);

    river?.tick(time, dt);

    lanes.forEach((lane) => {
      const duck = duckById.get(lane.runner.id);
      poseDuckRig(lane.rig, duck, {
        x: layout.startX + DUCK_START_OFFSET + (duck?.progress ?? 0) * travel,
        time,
        isRacing,
        isReducedMotion,
      });

      const arrival = arrivalById.get(lane.runner.id);
      const place = arrival?.place ?? 0;
      if (place === lane.shownPlace) return;
      lane.shownPlace = place;
      showArrival(lane.chip, arrival);
    });

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    watchFrameRate(now);
  });

  const update = (next: RaceFrame) => {
    frame = next;
  };

  const dispose = () => {
    renderer.setAnimationLoop(null);
    observer.disconnect();
    disposeTree(scene);
    lighting.sky.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    labelRenderer.domElement.remove();
  };

  return { setRunners, update, dispose };
};

export type RaceScene = ReturnType<typeof createRaceScene>;
