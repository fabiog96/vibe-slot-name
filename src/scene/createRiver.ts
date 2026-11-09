import * as THREE from 'three';

import { canvasTexture } from './canvasTexture';
import { createWater, Quality } from './createWater';
import { disposeTree } from './disposeTree';
import { themeColor } from './themeColor';

const RIVER_LENGTH = 17;
const MIN_RIVER_WIDTH = 10.2;
const MIN_LANE_WIDTH = 1.25;
const FILL_RATIO = 0.72;
const DOCK_WIDTH = 2.8;
const FINISH_MARGIN = 0.6;
const BUOY_STEP = 0.55;

export interface RiverLayout {
  length: number;
  width: number;
  lane: number;
  dockWidth: number;
  startX: number;
  finishX: number;
  laneZ: (index: number) => number;
}

export const riverLayout = (lanes: number, aspect: number): RiverLayout => {
  const fillWidth = ((RIVER_LENGTH + DOCK_WIDTH) / Math.max(aspect, 0.5)) * FILL_RATIO;
  const width = Math.max(MIN_RIVER_WIDTH, lanes * MIN_LANE_WIDTH, fillWidth);
  const lane = width / Math.max(lanes, 1);
  return {
    length: RIVER_LENGTH,
    width,
    lane,
    dockWidth: DOCK_WIDTH,
    startX: -RIVER_LENGTH / 2,
    finishX: RIVER_LENGTH / 2 - FINISH_MARGIN,
    laneZ: (index) => -width / 2 + lane * (index + 0.5),
  };
};

const riverBed = (layout: RiverLayout) => {
  const bed = new THREE.Mesh(
    new THREE.PlaneGeometry(layout.length + 4, layout.width + 2),
    new THREE.MeshStandardMaterial({
      roughness: 0.9,
      map: canvasTexture(1024, 512, (ctx, w, h) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#d8c08a');
        gradient.addColorStop(0.12, '#4fb3d9');
        gradient.addColorStop(0.5, '#1d7fb3');
        gradient.addColorStop(0.88, '#4fb3d9');
        gradient.addColorStop(1, '#d8c08a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 900; i++) {
          const y = Math.random() * h;
          const edge = Math.abs(y / h - 0.5) * 2;
          ctx.fillStyle = `hsla(${190 + Math.random() * 30}, 35%, ${30 + edge * 40 + Math.random() * 15}%, ${0.25 + Math.random() * 0.35})`;
          ctx.beginPath();
          ctx.ellipse(Math.random() * w, y, 2 + Math.random() * 7, 1.5 + Math.random() * 5, Math.random() * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }),
    }),
  );
  bed.rotation.x = -Math.PI / 2;
  bed.position.y = -0.7;
  bed.receiveShadow = true;
  return bed;
};

const banks = (layout: RiverLayout) => {
  const grassMap = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#4c9a3a';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = `hsla(${95 + Math.random() * 30}, 45%, ${25 + Math.random() * 25}%, 0.5)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 5);
    }
  });
  grassMap.wrapS = THREE.RepeatWrapping;
  grassMap.wrapT = THREE.RepeatWrapping;
  grassMap.repeat.set(12, 4);
  const grass = new THREE.MeshStandardMaterial({ roughness: 1, map: grassMap });
  const sand = new THREE.MeshStandardMaterial({ color: '#d8b77e', roughness: 1 });
  const faces = [sand, sand, grass, sand, sand, sand];

  const group = new THREE.Group();
  for (const side of [-1, 1]) {
    const bank = new THREE.Mesh(new THREE.BoxGeometry(60, 1.4, 20), faces);
    bank.position.set(0, -0.5, side * (layout.width / 2 + 0.15 + 10));
    bank.receiveShadow = true;
    group.add(bank);
  }
  for (const side of [-1, 1]) {
    const end = new THREE.Mesh(new THREE.BoxGeometry(20, 1.4, layout.width + 1), faces);
    end.position.set(side * (layout.length / 2 + 10.4), -0.5, 0);
    group.add(end);
  }
  return group;
};

const dock = (layout: RiverLayout) => {
  const depth = layout.width + 0.6;
  const wood = new THREE.MeshStandardMaterial({ color: '#8a5530', roughness: 0.8 });
  const planks = new THREE.MeshStandardMaterial({
    roughness: 0.75,
    map: canvasTexture(512, Math.round((512 * depth) / layout.dockWidth), (ctx, w, h) => {
      ctx.fillStyle = themeColor('dock');
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 44) {
        ctx.fillStyle = `rgba(0,0,0,${0.06 + Math.random() * 0.08})`;
        ctx.fillRect(x, 0, 44, h);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x, 0, 3, h);
      }
    }),
  });

  const group = new THREE.Group();
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(layout.dockWidth, 0.5, depth),
    [wood, wood, planks, wood, wood, wood],
  );
  deck.position.set(layout.startX - layout.dockWidth / 2 + 0.2, 0.05, 0);
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);

  for (let i = 0; i < 4; i++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6), wood);
    post.position.set(layout.startX + 0.15, -0.4, -depth / 2 + 0.3 + (i * (depth - 0.6)) / 3);
    group.add(post);
  }
  return group;
};

const finishLine = (layout: RiverLayout) => {
  const ink = themeColor('ink');
  const checks = canvasTexture(2, 30, (ctx, w, h) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        ctx.fillStyle = (x + y) % 2 ? ink : '#ffffff';
        ctx.fillRect(x, y, 1, 1);
      }
  });
  checks.magFilter = THREE.NearestFilter;
  checks.minFilter = THREE.NearestFilter;
  checks.generateMipmaps = false;

  const finish = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, layout.width + 0.3),
    new THREE.MeshStandardMaterial({ roughness: 0.6, map: checks }),
  );
  finish.rotation.x = -Math.PI / 2;
  finish.position.set(layout.finishX + 0.45, 0.05, 0);
  return finish;
};

const laneRopes = (layout: RiverLayout, lanes: number) => {
  const group = new THREE.Group();
  const perRope = Math.floor(layout.length / BUOY_STEP);
  const ropes = Math.max(lanes - 1, 0);
  const rope = new THREE.MeshStandardMaterial({ color: '#f4efe0', roughness: 0.9 });
  const buoys = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.075, 12, 8),
    new THREE.MeshStandardMaterial({ roughness: 0.35 }),
    Math.max(perRope * ropes, 1),
  );
  buoys.count = perRope * ropes;
  buoys.castShadow = true;

  const red = new THREE.Color(themeColor('coral'));
  const white = new THREE.Color('#ffffff');
  const ropeZ = (k: number) => -layout.width / 2 + layout.lane * k;

  for (let k = 1; k <= ropes; k++) {
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, layout.length), rope);
    line.rotation.z = Math.PI / 2;
    line.position.set(0, 0.02, ropeZ(k));
    group.add(line);
    for (let j = 0; j < perRope; j++)
      buoys.setColorAt((k - 1) * perRope + j, (j + k) % 2 ? red : white);
  }
  group.add(buoys);

  const matrix = new THREE.Matrix4();
  const bob = (time: number) => {
    for (let k = 1; k <= ropes; k++)
      for (let j = 0; j < perRope; j++) {
        const x = layout.startX + BUOY_STEP * (j + 0.5);
        const y = 0.025 + Math.sin(time * 2.4 + j * 1.7 + k * 2.1) * 0.02;
        matrix.makeTranslation(x, y, ropeZ(k));
        buoys.setMatrixAt((k - 1) * perRope + j, matrix);
      }
    buoys.instanceMatrix.needsUpdate = true;
  };
  bob(0);
  return { group, bob };
};

export const createRiver = (
  layout: RiverLayout,
  lanes: number,
  quality: Quality,
  isReducedMotion: boolean,
) => {
  const group = new THREE.Group();
  const ropes = laneRopes(layout, lanes);
  group.add(riverBed(layout), banks(layout), dock(layout), finishLine(layout), ropes.group);

  let water = createWater(layout.length + 1, layout.width + 0.4, quality, isReducedMotion);
  group.add(water.mesh);

  const setQuality = (next: Quality) => {
    group.remove(water.mesh);
    disposeTree(water.mesh);
    water = createWater(layout.length + 1, layout.width + 0.4, next, isReducedMotion);
    group.add(water.mesh);
  };

  const tick = (time: number, dt: number) => {
    water.tick(dt);
    if (!isReducedMotion) ropes.bob(time);
  };

  return { group, setQuality, tick };
};
