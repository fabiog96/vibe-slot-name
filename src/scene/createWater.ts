import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water2.js';

export type Quality = 'high' | 'low';

const FLOW_SPEED = 0.05;

const normalMap = (loader: THREE.TextureLoader, file: string) => {
  const texture = loader.load(`${import.meta.env.BASE_URL}textures/water/${file}`);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

export const createWater = (
  length: number,
  width: number,
  quality: Quality,
  isReducedMotion: boolean,
) => {
  const geometry = new THREE.PlaneGeometry(length, width);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (length / width));
  const loader = new THREE.TextureLoader();
  const flowSpeed = isReducedMotion ? 0 : FLOW_SPEED;

  if (quality === 'high') {
    const water = new Water(geometry, {
      color: '#d4f1ff',
      scale: 1.6,
      flowDirection: new THREE.Vector2(1, 0),
      flowSpeed,
      reflectivity: 0.12,
      textureWidth: 1024,
      textureHeight: 1024,
      normalMap0: normalMap(loader, 'Water_1_M_Normal.jpg'),
      normalMap1: normalMap(loader, 'Water_2_M_Normal.jpg'),
    });
    water.rotation.x = -Math.PI / 2;
    return { mesh: water, tick: () => {} };
  }

  const ripples = normalMap(loader, 'Water_1_M_Normal.jpg');
  ripples.repeat.set(width / 4, width / 4);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: '#3aa6dc',
      roughness: 0.12,
      metalness: 0.1,
      normalMap: ripples,
      normalScale: new THREE.Vector2(0.6, 0.6),
      transparent: true,
      opacity: 0.82,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  return {
    mesh,
    tick: (dt: number) => {
      ripples.offset.x -= dt * flowSpeed;
    },
  };
};
