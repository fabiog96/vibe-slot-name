import * as THREE from 'three';

import { canvasTexture } from './canvasTexture';
import { themeColor } from '../utils/themeColor';

const CLOUDS = 26;

const skyTexture = () => {
  const sky = canvasTexture(1024, 512, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#2f8fd8');
    gradient.addColorStop(0.45, '#9fd8ff');
    gradient.addColorStop(0.5, '#e8f7ff');
    gradient.addColorStop(1, '#6aa86a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < CLOUDS; i++) {
      const x = Math.random() * w;
      const y = 40 + Math.random() * h * 0.32;
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.ellipse(x + j * 18, y + Math.sin(j) * 6, 30 + Math.random() * 20, 12 + Math.random() * 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  sky.mapping = THREE.EquirectangularReflectionMapping;
  return sky;
};

export const createLighting = () => {
  const sky = skyTexture();
  const hemisphere = new THREE.HemisphereLight('#d6f0ff', themeColor('dock'), 1.4);
  const sun = new THREE.DirectionalLight('#fff3d6', 2.2);
  sun.position.set(-6, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 7, bottom: -7, near: 1, far: 40 });

  return { sky, lights: [hemisphere, sun], sun };
};
