import * as THREE from 'three';

import { canvasTexture } from './canvasTexture';
import { createWater, Quality } from './createWater';
import { disposeTree } from './disposeTree';
import { themeColor } from '../utils/themeColor';

const POOL_LENGTH = 17;
const MIN_POOL_WIDTH = 10.2;
const MIN_LANE_WIDTH = 1.25;
const FILL_RATIO = 0.72;
const DECK_WIDTH = 2.8;
const FINISH_MARGIN = 0.5;

const POOL_DEPTH = 0.7;
const DECK_HEIGHT = 0.2;
const DECK_REACH = 30;
const COPING_WIDTH = 0.22;
const FLOOR_TILE = 0.25;
const FLOOR_LINE_WIDTH = 0.2;
const FLOOR_LINE_INSET = 1.2;

const FLOAT_STEP = 0.17;
const FLOAT_RADIUS = 0.09;
const END_ZONE_RATIO = 0.1;

const BLOCK_LENGTH = 0.6;
const BLOCK_HEIGHT = 0.35;
const BLOCK_SETBACK = 0.45;
const TOUCHPAD_HEIGHT = 0.45;

const FLAG_HEIGHT = 1;
const FLAG_STEP = 0.42;
const FLAG_POLE_OFFSET = 0.5;

const ROPE_GREEN = '#2fb573';
const ROPE_BLUE = '#1668c9';

export interface PoolLayout {
  length: number;
  width: number;
  lane: number;
  deckWidth: number;
  startX: number;
  finishX: number;
  laneZ: (index: number) => number;
}

export const poolLayout = (lanes: number, aspect: number): PoolLayout => {
  const fillWidth = ((POOL_LENGTH + DECK_WIDTH) / Math.max(aspect, 0.5)) * FILL_RATIO;
  const width = Math.max(MIN_POOL_WIDTH, lanes * MIN_LANE_WIDTH, fillWidth);
  const lane = width / Math.max(lanes, 1);
  return {
    length: POOL_LENGTH,
    width,
    lane,
    deckWidth: DECK_WIDTH,
    startX: -POOL_LENGTH / 2,
    finishX: POOL_LENGTH / 2 - FINISH_MARGIN,
    laneZ: (index) => -width / 2 + lane * (index + 0.5),
  };
};

const rectangle = <T extends THREE.Path>(path: T, halfX: number, halfZ: number) =>
  path
    .moveTo(-halfX, -halfZ)
    .lineTo(halfX, -halfZ)
    .lineTo(halfX, halfZ)
    .lineTo(-halfX, halfZ)
    .closePath();

const frameAround = (layout: PoolLayout, reachX: number, reachZ: number) => {
  const shape = rectangle(new THREE.Shape(), reachX, reachZ);
  shape.holes.push(rectangle(new THREE.Path(), layout.length / 2, layout.width / 2));
  return new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2);
};

const deck = (layout: PoolLayout) => {
  const tiles = canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#8fa3ae';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#b4c4cc';
    for (const x of [0, w / 2])
      for (const y of [0, h / 2]) ctx.fillRect(x + 2, y + 2, w / 2 - 4, h / 2 - 4);
  });
  tiles.wrapS = THREE.RepeatWrapping;
  tiles.wrapT = THREE.RepeatWrapping;

  const floor = new THREE.Mesh(
    frameAround(layout, DECK_REACH, DECK_REACH),
    new THREE.MeshStandardMaterial({ roughness: 0.85, map: tiles }),
  );
  floor.position.y = DECK_HEIGHT;
  floor.receiveShadow = true;

  const coping = new THREE.Mesh(
    frameAround(layout, layout.length / 2 + COPING_WIDTH, layout.width / 2 + COPING_WIDTH),
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }),
  );
  coping.position.y = DECK_HEIGHT + 0.01;
  coping.receiveShadow = true;

  return [floor, coping];
};

const floorTexture = (layout: PoolLayout, lanes: number) =>
  canvasTexture(2048, 1024, (ctx, w, h) => {
    const perX = w / layout.length;
    const perZ = h / layout.width;
    ctx.fillStyle = '#34a9df';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= layout.length; x += FLOOR_TILE) {
      ctx.moveTo(x * perX, 0);
      ctx.lineTo(x * perX, h);
    }
    for (let z = 0; z <= layout.width; z += FLOOR_TILE) {
      ctx.moveTo(0, z * perZ);
      ctx.lineTo(w, z * perZ);
    }
    ctx.stroke();

    ctx.fillStyle = '#0b3a5c';
    const bar = layout.lane * 0.6;
    for (let i = 0; i < lanes; i++) {
      const z = (i + 0.5) * layout.lane;
      ctx.fillRect(
        FLOOR_LINE_INSET * perX,
        (z - FLOOR_LINE_WIDTH / 2) * perZ,
        (layout.length - 2 * FLOOR_LINE_INSET) * perX,
        FLOOR_LINE_WIDTH * perZ,
      );
      for (const x of [FLOOR_LINE_INSET, layout.length - FLOOR_LINE_INSET])
        ctx.fillRect(
          (x - FLOOR_LINE_WIDTH / 2) * perX,
          (z - bar / 2) * perZ,
          FLOOR_LINE_WIDTH * perX,
          bar * perZ,
        );
    }
  });

const basin = (layout: PoolLayout, lanes: number) => {
  const wall = new THREE.MeshStandardMaterial({
    color: '#cfeaf6',
    roughness: 0.6,
    side: THREE.BackSide,
  });
  const floor = new THREE.MeshStandardMaterial({
    roughness: 0.9,
    side: THREE.BackSide,
    map: floorTexture(layout, lanes),
  });
  const open = new THREE.MeshBasicMaterial({ visible: false });

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(layout.length, DECK_HEIGHT + POOL_DEPTH, layout.width),
    [wall, wall, open, floor, wall, wall],
  );
  mesh.position.y = (DECK_HEIGHT - POOL_DEPTH) / 2;
  mesh.receiveShadow = true;
  return mesh;
};

const startingBlocks = (layout: PoolLayout, lanes: number) => {
  const width = Math.min(layout.lane * 0.55, 0.8);
  const body = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
  const grip = new THREE.MeshStandardMaterial({ color: ROPE_BLUE, roughness: 0.7 });
  const group = new THREE.Group();

  for (let i = 0; i < lanes; i++) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(BLOCK_LENGTH, BLOCK_HEIGHT, width), body);
    block.position.set(layout.startX - BLOCK_SETBACK, DECK_HEIGHT + BLOCK_HEIGHT / 2, layout.laneZ(i));
    block.castShadow = true;
    const top = new THREE.Mesh(new THREE.BoxGeometry(BLOCK_LENGTH * 0.9, 0.03, width * 0.9), grip);
    top.position.y = BLOCK_HEIGHT / 2 + 0.015;
    block.add(top);
    group.add(block);
  }
  return group;
};

const touchpads = (layout: PoolLayout, lanes: number) => {
  const pad = new THREE.MeshStandardMaterial({ color: themeColor('duck'), roughness: 0.5 });
  const group = new THREE.Group();
  for (let i = 0; i < lanes; i++) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, TOUCHPAD_HEIGHT, layout.lane * 0.82),
      pad,
    );
    mesh.position.set(
      layout.length / 2 - 0.025,
      DECK_HEIGHT - 0.02 - TOUCHPAD_HEIGHT / 2,
      layout.laneZ(i),
    );
    group.add(mesh);
  }
  return group;
};

const backstrokeFlags = (layout: PoolLayout) => {
  const span = layout.width + 2 * FLAG_POLE_OFFSET;
  const perLine = Math.floor(layout.width / FLAG_STEP);
  const lineX = layout.length * (0.5 - END_ZONE_RATIO);
  const top = DECK_HEIGHT + FLAG_HEIGHT;
  const metal = new THREE.MeshStandardMaterial({ color: '#dfe6ea', roughness: 0.4 });
  const group = new THREE.Group();

  const pennants = new THREE.InstancedMesh(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.17, 0, 0),
      new THREE.Vector3(0.17, 0, 0),
      new THREE.Vector3(0, -0.36, 0),
    ]),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
    perLine * 2,
  );
  const colors = [themeColor('coral'), '#ffffff', ROPE_BLUE].map((c) => new THREE.Color(c));
  const matrix = new THREE.Matrix4();

  [-lineX, lineX].forEach((x, line) => {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, span), metal);
    cord.rotation.x = Math.PI / 2;
    cord.position.set(x, top, 0);
    group.add(cord);

    for (const side of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, FLAG_HEIGHT), metal);
      pole.position.set(x, DECK_HEIGHT + FLAG_HEIGHT / 2, (side * span) / 2);
      pole.castShadow = true;
      group.add(pole);
    }

    for (let j = 0; j < perLine; j++) {
      const index = line * perLine + j;
      matrix.makeTranslation(x, top, -layout.width / 2 + FLAG_STEP * (j + 0.5));
      pennants.setMatrixAt(index, matrix);
      pennants.setColorAt(index, colors[j % colors.length]);
    }
  });

  group.add(pennants);
  return group;
};

const ropeColor = (rope: number, ropes: number) => {
  if (rope === 1 || rope === ropes) return ROPE_GREEN;
  return Math.abs(rope - (ropes + 1) / 2) <= 1 ? themeColor('duck') : ROPE_BLUE;
};

const laneRopes = (layout: PoolLayout, lanes: number) => {
  const perRope = Math.floor(layout.length / FLOAT_STEP);
  const ropes = Math.max(lanes - 1, 0);
  const endZone = perRope * END_ZONE_RATIO;
  const firstX = -(perRope * FLOAT_STEP) / 2 + FLOAT_STEP / 2;
  const floats = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(FLOAT_RADIUS, FLOAT_RADIUS, FLOAT_STEP * 0.8, 12).rotateZ(Math.PI / 2),
    new THREE.MeshStandardMaterial({ roughness: 0.35 }),
    Math.max(perRope * ropes, 1),
  );
  floats.count = perRope * ropes;
  floats.castShadow = true;

  const red = new THREE.Color(themeColor('coral'));
  const ropeZ = (k: number) => -layout.width / 2 + layout.lane * k;

  for (let k = 1; k <= ropes; k++) {
    const color = new THREE.Color(ropeColor(k, ropes));
    for (let j = 0; j < perRope; j++) {
      const isEndZone = j < endZone || j >= perRope - endZone;
      floats.setColorAt((k - 1) * perRope + j, isEndZone ? red : color);
    }
  }

  const matrix = new THREE.Matrix4();
  const bob = (time: number) => {
    for (let k = 1; k <= ropes; k++)
      for (let j = 0; j < perRope; j++) {
        const y = 0.02 + Math.sin(time * 2.4 + j * 0.4 + k * 2.1) * 0.015;
        matrix.makeTranslation(firstX + FLOAT_STEP * j, y, ropeZ(k));
        floats.setMatrixAt((k - 1) * perRope + j, matrix);
      }
    floats.instanceMatrix.needsUpdate = true;
  };
  bob(0);
  return { floats, bob };
};

export const createPool = (
  layout: PoolLayout,
  lanes: number,
  quality: Quality,
  isReducedMotion: boolean,
) => {
  const group = new THREE.Group();
  const ropes = laneRopes(layout, lanes);
  group.add(
    ...deck(layout),
    basin(layout, lanes),
    startingBlocks(layout, lanes),
    touchpads(layout, lanes),
    backstrokeFlags(layout),
    ropes.floats,
  );

  let water = createWater(layout.length, layout.width, quality, isReducedMotion);
  group.add(water.mesh);

  const setQuality = (next: Quality) => {
    group.remove(water.mesh);
    disposeTree(water.mesh);
    water = createWater(layout.length, layout.width, next, isReducedMotion);
    group.add(water.mesh);
  };

  const tick = (time: number, dt: number) => {
    water.tick(dt);
    if (!isReducedMotion) ropes.bob(time);
  };

  return { group, setQuality, tick };
};
