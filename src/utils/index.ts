import * as THREE from "three";
import { Vector3 } from "three";
import { Compass } from "../types";
import { SCENE_CONSTANTS } from "../constants";

export * from "./gizmo";
export * from "./normalTracer";

export function hexToRgb(hex: number) {
  return hexStrToRgb(hexNumToStr(hex));

  function hexNumToStr(num: number) {
    let str = num.toString(16);
    while (str.length < 6) str = "0" + str;
    return "#" + str;
  }

  function hexStrToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 255, g: 255, b: 255 };
  }
}

export function rgbToHex(r: number, g: number, b: number) {
  return hexStrToNum(rgbToHexStr(Math.round(r), Math.round(g), Math.round(b)));

  function hexStrToNum(hex: string) {
    return parseInt("0x" + hex.slice(1));
  }

  function rgbToHexStr(r: number, g: number, b: number) {
    function componentToHex(c: number) {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }
}

export function atan(x: number, y: number) {
  if (x === 0) {
    if (y >= 0) return Math.PI / 2;
    else return (Math.PI * 3) / 2;
  }
  const division = y / x;
  const looseTheta = Math.atan(division);
  if (x >= 0) return looseTheta;
  else return looseTheta + Math.PI;
}

export function randomInRange(from: number, to: number) {
  return Math.random() * (to - from) + from;
}

export function randomIntInRange(from: number, to: number) {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}

export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i >= 0; i--) {
    const randomIndex = randomIntInRange(0, i);
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }
  return array;
}

export function adjustHeight(object: THREE.Object3D, height: number) {
  const boundingBox = new THREE.Box3().setFromObject(object);
  const scale = height / (boundingBox.max.y - boundingBox.min.y);
  object.scale.set(
    ...(object.scale.toArray().map((val) => val * scale) as [
      number,
      number,
      number
    ])
  );
}

export function adjustBaseCenterPos(
  object: THREE.Object3D,
  position = new Vector3(0, 0, 0)
) {
  const boundingBox = new THREE.Box3().setFromObject(object);
  const shift = new THREE.Vector3(
    -(boundingBox.max.x + boundingBox.min.x) / 2,
    -boundingBox.min.y,
    -(boundingBox.max.z + boundingBox.min.z) / 2
  );
  object.position.add(shift).add(position);
}

export function mapCompassRotation(compass: Compass) {
  switch (compass) {
    case Compass.N:
      return Math.PI;
    case Compass.S:
      return 0;
    case Compass.E:
      return Math.PI / 2;
    case Compass.W:
      return (Math.PI * 3) / 2;
    case Compass.NE:
      return (Math.PI * 3) / 4;
    case Compass.NW:
      return (Math.PI * 5) / 4;
    case Compass.SE:
      return Math.PI / 4;
    case Compass.SW:
      return (Math.PI * 7) / 4;
    default:
      return NaN;
  }
}

export function mapCompassVector3(compass: Compass) {
  switch (compass) {
    case Compass.N:
      return new Vector3(0, 0, -1);
    case Compass.S:
      return new Vector3(0, 0, 1);
    case Compass.E:
      return new Vector3(1, 0, 0);
    case Compass.W:
      return new Vector3(-1, 0, 0);
    case Compass.NE:
      return new Vector3(1, 0, -1).normalize();
    case Compass.NW:
      return new Vector3(-1, 0, -1).normalize();
    case Compass.SE:
      return new Vector3(1, 0, 1).normalize();
    case Compass.SW:
      return new Vector3(-1, 0, 1).normalize();
    default:
      return new Vector3(0, 0, 0);
  }
}

export function getSceneMouseCoord(e: MouseEvent) {
  return getSceneMouseCoordFromClient([e.clientX, e.clientY]);
}

export function getSceneMouseCoordFromClient(client: [number, number]) {
  return [
    ((client[0] - SCENE_CONSTANTS.left) / SCENE_CONSTANTS.width) * 2 - 1,
    -((client[1] - SCENE_CONSTANTS.top) / SCENE_CONSTANTS.height) * 2 + 1,
  ] as [number, number];
}
