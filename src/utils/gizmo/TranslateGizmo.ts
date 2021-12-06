import * as THREE from "three";
import {
  GizmoComponentSpec,
  GizmoMode,
  GizmoDirectionalAxis,
  GizmoPlanarAxis,
  GizmoSpecialAxis,
  GizmoHandles,
  GizmoUpdateType,
} from "../../types";
import { Gizmo, GizmoUtil } from "./Gizmo";

export class TranslateGizmo extends Gizmo {
  private filePath = "utils/gizmo/translate/";
  private componentSpecs: GizmoComponentSpec<GizmoMode.Translate>[];
  private handles: GizmoHandles<GizmoMode.Translate>;
  private startPoint: THREE.Vector3;
  private translateUtils: {
    vector: THREE.Vector3;
    box3: THREE.Box3;
    rotation: THREE.Euler;
  };

  constructor(util: GizmoUtil) {
    super(util);
    this.translateUtils = {
      vector: new THREE.Vector3(),
      box3: new THREE.Box3(),
      rotation: new THREE.Euler(),
    };
    this.startPoint = new THREE.Vector3();
    this.componentSpecs = [
      {
        component: GizmoDirectionalAxis.X,
        color: 0xff0000,
        file: "gizmo_0.drc",
      },
      {
        component: GizmoDirectionalAxis.Y,
        color: 0x00ff00,
        file: "gizmo_1.drc",
      },
      {
        component: GizmoDirectionalAxis.Z,
        color: 0x0000ff,
        file: "gizmo_2.drc",
      },
      { component: GizmoPlanarAxis.Z, color: 0xffffff, file: "gizmo_3.drc" },
      { component: GizmoPlanarAxis.Y, color: 0xffffff, file: "gizmo_4.drc" },
      { component: GizmoPlanarAxis.X, color: 0xffffff, file: "gizmo_5.drc" },
    ];
    this.handles = [
      ...Object.values(GizmoDirectionalAxis),
      ...Object.values(GizmoPlanarAxis),
      GizmoSpecialAxis.XYZ,
    ].reduce((acc, axis) => {
      const mesh = new THREE.Mesh();
      Object.assign(mesh.userData, { axis });
      this.add(mesh);
      return { ...acc, [axis]: mesh };
    }, {}) as GizmoHandles<GizmoMode.Translate>;
  }

  public async build() {
    for (let spec of this.componentSpecs)
      await this.loader.load(this.filePath + spec.file, (geo) => {
        const handle = this.handles[spec.component];
        handle.geometry = geo;
        handle.material = this.getMaterial(spec.color);
      });
  }

  public getAxisPoint() {
    switch (this.axis) {
      case GizmoPlanarAxis.X:
      case GizmoPlanarAxis.Y:
      case GizmoPlanarAxis.Z:
        return this.intersectPlane(this.dragPoint);
      case GizmoDirectionalAxis.X:
      case GizmoDirectionalAxis.Y:
      case GizmoDirectionalAxis.Z:
        return this.intersectLine3(this.dragPoint);
      case GizmoSpecialAxis.XYZ:
        return null;
      default:
        return null;
    }
  }

  public get handleList() {
    return Object.values(this.handles);
  }

  public setupDrag() {
    this.startPoint.copy(this.dragPoint);
    return true;
  }

  public setFromTarget(type?: GizmoUpdateType) {
    switch (type) {
      case GizmoUpdateType.Drag:
        this.setPosition(this.getPositionFromTarget());
        return true;
      case GizmoUpdateType.Rotate:
        this.setRotation(this.getRotationFromTarget());
        return true;
      default:
        this.set(this.getPositionFromTarget(), this.getRotationFromTarget());
        return true;
    }
  }

  private getRotationFromTarget() {
    return this.getBaseRotation(this.translateUtils.rotation);
  }

  private getPositionFromTarget() {
    const { vector, box3 } = this.translateUtils;
    return box3.setFromObject(this.target).getCenter(vector);
  }

  public transformTarget() {
    const { vector } = this.translateUtils;
    this.target.position
      .setFromMatrixPosition(this.initialTransform)
      .add(vector.subVectors(this.dragPoint, this.startPoint));
    return true;
  }
}
