import { useEffect, useMemo } from "react";
import * as THREE from "three";
import Shelter from "../fonts/Shelter_PersonalUseOnly_Regular.json";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import {
  TextGeometry,
  TextGeometryParameters,
} from "three/examples/jsm/geometries/TextGeometry";

export function useText(text: string, color: number) {
  const textOpts = useMemo(() => {
    const loader = new FontLoader();
    const font = loader.parse(Shelter);
    return {
      font,
      size: 1,
      height: 0.1,
    } as TextGeometryParameters;
  }, []);

  const mesh = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      color,
      side: THREE.DoubleSide,
      shininess: 100,
    });
    return new THREE.Mesh(undefined, material);
  }, [color]);

  useEffect(() => {
    mesh.material.color.set(color);
  }, [mesh, color]);

  useEffect(() => {
    mesh.geometry = new TextGeometry(text, textOpts);
  }, [text, textOpts, mesh]);

  return mesh;
}
