import * as THREE from 'three'

export const SCENE_CONSTANTS = {
  width: 800,
  height: 500,
  backgroundColor: 0xababab,
  showGrid: true,
  fov: 30,
  cameraPosition: new THREE.Vector3(0, 10, 10),
  cameraLookAt: new THREE.Vector3(0, 0, 0),
  isOrthographic: false,
  shadows: false,
}
