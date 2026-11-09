import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import { Arrival, DuckView, RacePhase } from '../types';
import { formatSeconds } from '../utils/formatSeconds';
import { createLighting } from './createLighting';
import { createRiver, riverLayout, RiverLayout } from './createRiver';
import { Quality } from './createWater';
import { createDuckRig, DuckRig, poseDuckRig } from './duckRig';

const CAMERA_FOV = 38;
const CAMERA_TILT_DEG = 48;
const CAMERA_TILT_SQUARE_DEG = 58;
const SQUARE_ASPECT = 1.3;
const CAMERA_MARGIN = 1.06;
const CAMERA_MIN_DISTANCE = 2;
const CAMERA_MAX_DISTANCE = 200;
const CAMERA_FIT_STEPS = 24;
const MAX_PIXEL_RATIO = 2;
const LOW_QUALITY_MAX_WIDTH = 768;
const FPS_WINDOW_MS = 2000;
const FPS_WARMUP_MS = 3000;
const FPS_FLOOR = 40;
const SLOW_WINDOWS_BEFORE_DOWNGRADE = 2;
const RELAYOUT_ASPECT_CHANGE = 0.25;
const DUCK_START_OFFSET = 0.7;
const CHIP_OFFSET = 1.4;
const PLACE_CHIP = ['bg-duck', 'bg-silver', 'bg-bronze'];
const PLACE_CHIP_DEFAULT = 'bg-paper';

export interface Runner {
  id: string;
  name: string;
  color: string;
}

export interface RaceFrame {
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

const nameLabel = (runner: Runner) => {
  const element = document.createElement('div');
  element.className =
    'flex items-center gap-1.5 rounded-md bg-ink/60 px-2 py-0.5 text-xs font-black text-dock-ink sm:text-sm';
  const dot = document.createElement('span');
  dot.className = 'size-2.5 shrink-0 rounded-full border-[1.5px] border-ink';
  dot.style.backgroundColor = runner.color;
  element.append(dot, runner.name);
  return new CSS2DObject(element);
};

const arrivalChip = () => {
  const element = document.createElement('span');
  element.className = 'hidden';
  return element;
};

const showArrival = (chip: HTMLSpanElement, arrival: Arrival) => {
  chip.className = `flex animate-pop items-baseline gap-1.5 rounded-lg border-2 border-ink px-2 text-ink ${
    PLACE_CHIP[arrival.place - 1] ?? PLACE_CHIP_DEFAULT
  }`;
  chip.innerHTML = '';
  const place = document.createElement('span');
  place.className = 'font-display text-lg leading-6';
  place.textContent = String(arrival.place);
  const time = document.createElement('span');
  time.className = 'text-xs font-black tabular-nums';
  time.textContent = formatSeconds(arrival.seconds);
  chip.append(place, time);
};

const disposeTree = (root: THREE.Object3D) => {
  root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.geometry.dispose();
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((m: THREE.Material) => m.dispose());
    }
    if (node instanceof CSS2DObject) node.element.remove();
  });
};

const fitCamera = (camera: THREE.PerspectiveCamera, layout: RiverLayout, aspect: number) => {
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  const tilt = THREE.MathUtils.degToRad(
    aspect < SQUARE_ASPECT ? CAMERA_TILT_SQUARE_DEG : CAMERA_TILT_DEG,
  );
  const minX = layout.startX - layout.dockWidth - 0.1;
  const maxX = layout.length / 2 + 0.6;
  const centerX = (minX + maxX) / 2;
  const halfDepth = layout.width / 2 + 0.3;
  const corners = [minX, maxX].flatMap((x) =>
    [-halfDepth, halfDepth].map((z) => new THREE.Vector3(x, 0, z)),
  );

  const place = (distance: number) => {
    camera.position.set(centerX, Math.sin(tilt) * distance, Math.cos(tilt) * distance);
    camera.lookAt(centerX, 0, 0);
    camera.updateMatrixWorld();
  };
  const fits = (distance: number) => {
    place(distance);
    return corners.every((corner) => {
      const p = corner.clone().project(camera);
      return Math.abs(p.x) <= 1 / CAMERA_MARGIN && Math.abs(p.y) <= 1 / CAMERA_MARGIN;
    });
  };

  let near = CAMERA_MIN_DISTANCE;
  let far = CAMERA_MAX_DISTANCE;
  for (let i = 0; i < CAMERA_FIT_STEPS; i++) {
    const mid = (near + far) / 2;
    if (fits(mid)) far = mid;
    else near = mid;
  }
  place(far);
};

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
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 200);
  const lighting = createLighting();
  lighting.sun.castShadow = quality === 'high';
  scene.background = lighting.sky;
  scene.environment = lighting.sky;
  scene.add(...lighting.lights);

  let layout = riverLayout(0, 1);
  let runners: Runner[] = [];
  let layoutAspect = 1;
  let river = createRiver(layout, 0, quality, isReducedMotion);
  let lanes: Lane[] = [];
  let world = new THREE.Group();
  world.add(river.group);
  scene.add(world);

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

      const name = nameLabel(runner);
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
    river.setQuality('low');
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((m: THREE.Material) => (m.needsUpdate = true));
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

    river.tick(time, dt);

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
      if (arrival) showArrival(lane.chip, arrival);
      else lane.chip.className = 'hidden';
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
