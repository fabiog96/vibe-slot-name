import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const texturesOf = (material: THREE.Material) => {
  const values =
    material instanceof THREE.ShaderMaterial
      ? Object.values(material.uniforms).map((u) => u.value)
      : Object.values(material);
  return values.filter((v): v is THREE.Texture => v instanceof THREE.Texture);
};

const disposeTexture = (texture: THREE.Texture) => {
  if (texture.renderTarget) texture.renderTarget.dispose();
  else texture.dispose();
};

export const disposeTree = (root: THREE.Object3D) => {
  root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.geometry.dispose();
      const materials: THREE.Material[] = Array.isArray(node.material)
        ? node.material
        : [node.material];
      materials.forEach((material) => {
        texturesOf(material).forEach(disposeTexture);
        material.dispose();
      });
    }
    if (node instanceof CSS2DObject) node.element.remove();
  });
};
