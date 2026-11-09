import * as THREE from 'three';

import { RiverLayout } from './createRiver';

const CAMERA_FOV = 38;
const CAMERA_TILT_DEG = 48;
const CAMERA_TILT_SQUARE_DEG = 58;
const SQUARE_ASPECT = 1.3;
const CAMERA_MARGIN = 1.06;
const CAMERA_MIN_DISTANCE = 2;
const CAMERA_MAX_DISTANCE = 200;
const CAMERA_FIT_STEPS = 24;

export const createCamera = () => new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 200);

export const fitCamera = (
  camera: THREE.PerspectiveCamera,
  layout: RiverLayout,
  aspect: number,
) => {
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
