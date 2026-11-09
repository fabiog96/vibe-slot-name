import * as THREE from 'three';

import { DuckView } from '../types';
import { netHeight, netLift, splashProgress } from '../utils/netMotion';
import { themeColor } from './themeColor';

const MAX_DUCK_SCALE = 1.45;
const BOB_HEIGHT = 0.035;
const MAX_PITCH = 0.22;
const NET_LIFT_HEIGHT = 0.7;
const NET_DROP_HEIGHT = 3;
const WHIRL_TURNS = 2;
const STREAKS = 3;
const MAX_WAKE_STRENGTH = 1.3;

const inkOutline = new THREE.MeshBasicMaterial({ color: themeColor('ink'), side: THREE.BackSide });
const yellow = new THREE.MeshStandardMaterial({ color: themeColor('duck'), roughness: 0.35 });
const orange = new THREE.MeshStandardMaterial({ color: themeColor('beak'), roughness: 0.4 });
const inkFront = new THREE.MeshBasicMaterial({ color: themeColor('ink') });
const foam = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, depthWrite: false });
const lily = new THREE.MeshStandardMaterial({ color: '#5bb450', roughness: 0.6 });
const coral = new THREE.MeshStandardMaterial({ color: themeColor('coral'), roughness: 0.5 });
const netting = new THREE.MeshBasicMaterial({ color: themeColor('ink'), wireframe: true, transparent: true, opacity: 0.55 });
const handle = new THREE.MeshStandardMaterial({ color: themeColor('dock'), roughness: 0.7 });

const WAKE_VERTEX = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const WAKE_FRAGMENT = `
  uniform float uTime;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    float s = (1.0 - vUv.x) * 3.2;
    float y = abs(vUv.y - 0.5) * 1.4;
    float arm = y - 0.06 - s * 0.36;
    float band = exp(-arm * arm / (0.0015 + s * 0.002));
    float crest = 0.8 + 0.2 * sin(s * 9.0 - uTime * 7.0);
    float fade = exp(-s / 1.3) * smoothstep(0.0, 0.08, s);
    gl_FragColor = vec4(vec3(0.95, 0.99, 1.0), band * crest * fade * 0.85 * uStrength);
  }`;

const withOutline = (mesh: THREE.Mesh) => {
  const outline = new THREE.Mesh(mesh.geometry, inkOutline);
  outline.scale.setScalar(1.08);
  mesh.add(outline);
  mesh.castShadow = true;
  return mesh;
};

const duckModel = (bandana: string) => {
  const duck = new THREE.Group();
  const body = withOutline(new THREE.Mesh(new THREE.SphereGeometry(0.3, 28, 18), yellow));
  body.scale.set(1.35, 0.8, 1);
  body.position.y = 0.1;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 16), yellow);
  tail.rotation.z = Math.PI / 2 + 0.7;
  tail.position.set(-0.38, 0.24, 0);
  const head = withOutline(new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), yellow));
  head.position.set(0.2, 0.44, 0);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 14), orange);
  beak.rotation.z = -Math.PI / 2;
  beak.scale.set(1, 1, 0.6);
  beak.position.set(0.44, 0.41, 0);
  const scarf = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.045, 10, 24),
    new THREE.MeshStandardMaterial({ color: bandana, roughness: 0.6 }),
  );
  scarf.rotation.x = Math.PI / 2;
  scarf.position.set(0.18, 0.28, 0);
  duck.add(body, tail, head, beak, scarf);
  for (const z of [-0.1, 0.1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), inkFront);
    eye.position.set(0.33, 0.5, z);
    duck.add(eye);
  }
  return duck;
};

const flatRing = (radius: number, tube: number, material: THREE.Material) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 40), material);
  ring.rotation.x = -Math.PI / 2;
  return ring;
};

const fairgroundNet = () => {
  const net = new THREE.Group();
  const hoop = flatRing(0.55, 0.04, coral);
  const bag = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.55, 16, 3, true), netting);
  bag.rotation.x = Math.PI;
  bag.position.y = -0.27;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.6), handle);
  pole.rotation.z = 0.5;
  pole.position.set(-0.55 - Math.sin(0.5) * 1.3, Math.cos(0.5) * 1.3, 0);
  net.add(hoop, bag, pole);
  return net;
};

export const createDuckRig = (bandana: string, laneWidth: number) => {
  const group = new THREE.Group();
  const scale = Math.min(MAX_DUCK_SCALE, laneWidth * 0.85);

  const body = duckModel(bandana);
  body.scale.setScalar(scale);

  const wakeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uStrength: { value: 0 } },
    vertexShader: WAKE_VERTEX,
    fragmentShader: WAKE_FRAGMENT,
  });
  const wake = new THREE.Mesh(new THREE.PlaneGeometry(3.2 * scale / MAX_DUCK_SCALE, 2.6 * scale / MAX_DUCK_SCALE), wakeMaterial);
  wake.rotation.x = -Math.PI / 2;
  wake.position.set((-1.75 * scale) / MAX_DUCK_SCALE, 0.012, 0);
  wake.renderOrder = 2;

  const whirl = flatRing(0.55 * scale, 0.05 * scale, foam);
  whirl.position.y = 0.02;

  const lilies = new THREE.Group();
  for (const [x, z, r] of [[0.5, 0.25, 0.22], [0.75, -0.2, 0.17]]) {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(r * scale, r * scale, 0.02, 20, 1, false, 0.3, Math.PI * 2 - 0.6), lily);
    pad.position.set(x * scale, 0.02, z * scale);
    lilies.add(pad);
  }

  const streaks = Array.from({ length: STREAKS }, (_, k) => {
    const streak = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.01, 0.03), foam);
    streak.position.set(0, 0.03, (k - 1) * 0.18 * scale);
    group.add(streak);
    return streak;
  });

  const net = fairgroundNet();
  net.scale.setScalar(scale / MAX_DUCK_SCALE);

  const splashMaterial = foam.clone();
  const splash = flatRing(0.4 * scale, 0.04 * scale, splashMaterial);
  splash.position.y = 0.03;

  group.add(body, wake, whirl, lilies, net, splash);
  return { group, body, wakeMaterial, whirl, lilies, streaks, net, splash, splashMaterial, scale, phase: Math.random() * Math.PI * 2 };
};

export type DuckRig = ReturnType<typeof createDuckRig>;

interface PoseOptions {
  x: number;
  time: number;
  isRacing: boolean;
  isReducedMotion: boolean;
}

export const poseDuckRig = (
  rig: DuckRig,
  duck: DuckView | undefined,
  { x, time, isRacing, isReducedMotion }: PoseOptions,
) => {
  const progress = duck?.progress ?? 0;
  const effect = isRacing ? (duck?.effect ?? null) : null;
  const elapsed = duck?.effectElapsed ?? 0;
  const isMoving = isRacing && progress < 1;
  const lift = effect === 'net' ? netLift(elapsed) * NET_LIFT_HEIGHT : 0;
  const bob = isMoving && !isReducedMotion ? Math.sin(time * 6 + rig.phase) * BOB_HEIGHT : 0;
  const surge = duck?.surge ?? 0;
  const motionTime = isReducedMotion ? 0 : time;

  rig.group.position.x = x;
  rig.body.position.y = bob + lift;
  rig.body.rotation.z = isMoving && !effect
    ? -THREE.MathUtils.clamp((surge - 1) * 0.2, -MAX_PITCH, MAX_PITCH)
    : 0;
  rig.body.rotation.x = isMoving && !isReducedMotion ? Math.sin(time * 4.3 + rig.phase) * 0.05 : 0;
  rig.body.rotation.y = effect === 'whirlpool' ? elapsed * Math.PI * 2 * WHIRL_TURNS : 0;

  rig.wakeMaterial.uniforms.uTime.value = motionTime;
  rig.wakeMaterial.uniforms.uStrength.value =
    isMoving && effect !== 'whirlpool' && effect !== 'net' ? THREE.MathUtils.clamp(surge, 0, MAX_WAKE_STRENGTH) : 0;

  rig.whirl.visible = effect === 'whirlpool';
  rig.whirl.rotation.z = motionTime * 6;
  rig.lilies.visible = effect === 'lilypad';

  rig.streaks.forEach((streak, k) => {
    streak.visible = effect === 'current';
    streak.position.x = -0.5 * rig.scale - ((motionTime * 3 + k * 0.33) % 1) * 0.6 * rig.scale;
  });

  rig.net.visible = effect === 'net';
  rig.net.position.y = 0.35 * rig.scale + lift + netHeight(elapsed) * NET_DROP_HEIGHT;

  const splash = effect === 'net' ? splashProgress(elapsed) : 0;
  rig.splash.visible = splash > 0;
  rig.splash.scale.setScalar(1 + splash * 1.5);
  rig.splashMaterial.opacity = 0.8 * (1 - splash);
};
