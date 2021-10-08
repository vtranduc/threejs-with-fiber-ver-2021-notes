import * as THREE from "three";

export function getSimpleSphere(
  geometryArgs: [number] | [number, number, number] = [1],
  materialOpts: THREE.MeshPhongMaterialParameters = {}
) {
  const defaultMaterialOpts = {
    color: 0xff0000,
    shininess: 100,
    side: THREE.DoubleSide,
  };
  const geometry = new THREE.SphereGeometry(...geometryArgs);
  const material = new THREE.MeshPhongMaterial({
    ...defaultMaterialOpts,
    ...materialOpts,
  });
  return new THREE.Mesh(geometry, material);
}
