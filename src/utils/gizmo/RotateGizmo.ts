import { Gizmo, GizmoUtil } from "./Gizmo";
import {
  GizmoPlanarAxis,
  GizmoComponentSpec,
  GizmoMode,
  Entries,
  GizmoHandles,
  GizmoUpdateType,
} from "../../types";
import * as THREE from "three";

export class RotateGizmo extends Gizmo {
  private filePath = "utils/gizmo/rotate/";
  private componentSpecs: GizmoComponentSpec<GizmoMode.Rotate>[];
  private handles: GizmoHandles<GizmoMode.Rotate>;
  private rotateUtils: {
    vector1: THREE.Vector3;
    vector2: THREE.Vector3;
    box3: THREE.Box3;
    quaternion: THREE.Quaternion;
    rotation: THREE.Euler;
  };
  private dragStart: {
    unitVector: THREE.Vector3;
    rotation: THREE.Euler;
    center: THREE.Vector3;
  };

  constructor(util: GizmoUtil) {
    super(util);
    this.rotateUtils = {
      vector1: new THREE.Vector3(),
      vector2: new THREE.Vector3(),
      box3: new THREE.Box3(),
      quaternion: new THREE.Quaternion(),
      rotation: new THREE.Euler(),
    };
    this.dragStart = {
      unitVector: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      center: new THREE.Vector3(),
    };
    this.handles = {
      [GizmoPlanarAxis.X]: new THREE.Mesh(),
      [GizmoPlanarAxis.Y]: new THREE.Mesh(),
      [GizmoPlanarAxis.Z]: new THREE.Mesh(),
    };
    this.componentSpecs = [
      { component: GizmoPlanarAxis.X, color: 0xff0000, file: "gizmo_6.drc" },
      { component: GizmoPlanarAxis.Y, color: 0x00ff00, file: "gizmo_7.drc" },
      { component: GizmoPlanarAxis.Z, color: 0x0000ff, file: "gizmo_8.drc" },
    ];
    (
      Object.entries(this.handles) as Entries<GizmoHandles<GizmoMode.Rotate>>
    ).forEach(([axis, mesh]) => {
      Object.assign(mesh.userData, { axis });
      this.add(mesh);
    });
  }

  public async build() {
    for (let spec of this.componentSpecs) {
      await this.loader.load(this.filePath + spec.file, (geo) => {
        const handle = this.handles[spec.component];
        handle.geometry = geo;
        handle.material = this.getMaterial(spec.color);
      });
    }
  }

  public get handleList() {
    return Object.values(this.handles);
  }

  public getAxisPoint() {
    return (
      this.intersectPlane(this.dragPoint) &&
      this.dragPoint.sub(this.gizmoPosition).normalize()
    );
  }

  public setupDrag() {
    this.dragStart.unitVector.copy(this.dragPoint);
    this.dragStart.rotation.copy(this.target.rotation);
    this.dragStart.center.copy(this.gizmoPosition);
    return true;
  }

  public transformTarget() {
    const { quaternion, vector1, vector2 } = this.rotateUtils;
    quaternion.setFromUnitVectors(this.dragStart.unitVector, this.dragPoint);
    this.target.rotation.copy(this.dragStart.rotation);
    this.target.applyQuaternion(quaternion);
    vector1.setFromMatrixPosition(this.initialTransform);
    this.target.position.copy(vector1);
    vector1.subVectors(this.dragStart.center, vector1);
    vector2.copy(vector1);
    vector1.applyQuaternion(quaternion).sub(vector2);
    this.target.position.sub(vector1);
    return true;
  }

  public setFromTarget(type?: GizmoUpdateType) {
    if (type === GizmoUpdateType.Drag) return true;
    this.setRotation(this.getBaseRotation(this.rotateUtils.rotation));
    if (type === GizmoUpdateType.Rotate) return true;
    const { vector1, box3 } = this.rotateUtils;
    box3.setFromObject(this.target);
    box3.getCenter(vector1);
    this.setPosition(vector1);
    return true;
  }
}
