import * as THREE from "three";

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export enum ArrowCode {
  A = "KeyA",
  W = "KeyW",
  S = "KeyS",
  D = "KeyD",
  Up = "ArrowUp",
  Down = "ArrowDown",
  Left = "ArrowLeft",
  Right = "ArrowRight",
}

export enum Compass {
  N = "N",
  E = "E",
  S = "S",
  W = "W",
  NE = "NE",
  NW = "NW",
  SE = "SE",
  SW = "SW",
}

export type ActionOpts<Action extends string> = Record<
  Action,
  { repeat: boolean }
>;

export enum StandardAxis {
  X = "x",
  Y = "y",
  Z = "z",
}

export enum GizmoDirectionalAxis {
  X = "X",
  Y = "Y",
  Z = "Z",
}

export enum GizmoNegativeDirectionalAxis {
  X = "nX",
  Y = "nY",
  Z = "nZ",
}

export enum GizmoPlanarAxis {
  X = "planarX",
  Y = "planarY",
  Z = "planarZ",
}

export enum GizmoDiagonalAxis {
  XY1 = "XY1",
  XY2 = "XY2",
  XZ1 = "XZ1",
  XZ2 = "XZ2",
  YZ1 = "YZ1",
  YZ2 = "YZ2",
}

export enum GizmoNegativeDiagonalAxis {
  XY1 = "nXY1",
  XY2 = "nXY2",
  XZ1 = "nXZ1",
  XZ2 = "nXZ2",
  YZ1 = "nYZ1",
  YZ2 = "nYZ2",
}

export enum GizmoSpecialAxis {
  XYZ = "XYZ",
}

export enum GizmoMode {
  Translate = "TRANSLATE",
  Rotate = "ROTATE",
  Scale = "SCALE",
}

export type GizmoAxis =
  | GizmoDirectionalAxis
  | GizmoPlanarAxis
  | GizmoDiagonalAxis
  | GizmoSpecialAxis;

export type GizmoTransformAxis<T extends GizmoMode> =
  T extends GizmoMode.Translate
    ? GizmoDirectionalAxis | GizmoPlanarAxis | GizmoSpecialAxis.XYZ
    : T extends GizmoMode.Rotate
    ? GizmoPlanarAxis
    : T extends GizmoMode.Scale
    ? GizmoDirectionalAxis | GizmoDiagonalAxis.XZ1 | GizmoDiagonalAxis.XZ2
    : never;

export type GizmoComponentSpec<
  T extends GizmoMode.Translate | GizmoMode.Rotate
> = {
  component: GizmoTransformAxis<T>;
  color: number;
  file: string;
};

export type GizmoHandles<T extends GizmoMode> = Record<
  T extends GizmoMode.Scale
    ?
        | GizmoTransformAxis<T>
        | Exclude<GizmoNegativeDirectionalAxis, GizmoNegativeDirectionalAxis.Y>
        | GizmoNegativeDiagonalAxis.XZ1
        | GizmoNegativeDiagonalAxis.XZ2
    : GizmoTransformAxis<T>,
  THREE.Mesh
>;

export enum GizmoUpdateType {
  Drag = "DRAG",
  Rotate = "ROTATE",
}

// export interface GizmoSharedAttributes {
//   raycaster: THREE.Raycaster;
//   dimension: THREE.Vector3;
//   gizmoPosition: THREE.Vector3;
//   gizmoRotation: THREE.Euler;
//   line3s: Record<GizmoDirectionalAxis, THREE.Line3>;
//   planes: Record<GizmoPlanarAxis, THREE.Plane>;
// }

// private line3HalfLength = Math.pow(10, 10);
// public dimension: THREE.Vector3;
// public gizmoPosition: THREE.Vector3;
// public gizmoRotation: THREE.Euler;
// private line3s: Record<GizmoDirectionalAxis, THREE.Line3>;
// private planes: Record<GizmoPlanarAxis, THREE.Plane>;
// private utils: {
//   plane: THREE.Plane;
//   line3: THREE.Line3;
//   dissectingPlane: THREE.Plane;
//   normal: THREE.Vector3;
//   intersect: THREE.Vector3;
// };
