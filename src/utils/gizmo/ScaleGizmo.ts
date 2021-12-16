import { Gizmo, GizmoUtil } from "./Gizmo";
import {
  GizmoDiagonalAxis,
  GizmoNegativeDiagonalAxis,
  GizmoMode,
  GizmoDirectionalAxis,
  Entries,
  GizmoHandles,
  GizmoTransformAxis,
  GizmoNegativeDirectionalAxis,
  StandardAxis,
  GizmoUpdateType,
} from "../../types";
import * as THREE from "three";

type ScaleGizmoDiagLine3s = Record<
  GizmoDiagonalAxis.XZ1 | GizmoDiagonalAxis.XZ2,
  THREE.Line3
>;

export class ScaleGizmo extends Gizmo {
  private handles: GizmoHandles<GizmoMode.Scale>;
  private handleWidth = 0.1;
  private topHeight = 0.3;
  private topRadius = 0.15;
  private diagLine3s: ScaleGizmoDiagLine3s;
  private dimension: THREE.Vector3;
  private geoDimension = new THREE.Vector3();
  private scaleUtils: {
    vector: THREE.Vector3;
    size: THREE.Vector3;
    plane: THREE.Plane;
    rotation: THREE.Euler;
    box3: THREE.Box3;
  };
  private dragStart: {
    axis: StandardAxis | null;
    direction: THREE.Vector3;
    offset: number;
    startDistance: number;
    // nightmare
    center: THREE.Vector3;
  };
  private simulatedGroups: THREE.Group[];

  constructor(util: GizmoUtil) {
    super(util);
    this.dimension = new THREE.Vector3();
    this.simulatedGroups = [];
    this.scaleUtils = {
      vector: new THREE.Vector3(),
      size: new THREE.Vector3(),
      plane: new THREE.Plane(),
      rotation: new THREE.Euler(),
      box3: new THREE.Box3(),
    };
    this.dragStart = {
      axis: null,
      direction: new THREE.Vector3(),
      startDistance: 0,
      offset: 0,
      // test
      center: new THREE.Vector3(),
    };
    this.diagLine3s = {
      [GizmoDiagonalAxis.XZ1]: new THREE.Line3(),
      [GizmoDiagonalAxis.XZ2]: new THREE.Line3(),
    };
    this.handles = Object.fromEntries(
      [
        ...Object.values(GizmoDirectionalAxis),
        GizmoNegativeDirectionalAxis.X,
        GizmoNegativeDirectionalAxis.Z,
        GizmoDiagonalAxis.XZ1,
        GizmoDiagonalAxis.XZ2,
        GizmoNegativeDiagonalAxis.XZ1,
        GizmoNegativeDiagonalAxis.XZ2,
      ].map((axis) => [axis, new THREE.Mesh()])
    ) as GizmoHandles<GizmoMode.Scale>;
    this.handleEntries.forEach(([axis, mesh]) => {
      Object.assign(mesh.userData, { axis: this.mapToGizmoAxis(axis) });
      this.add(mesh);
    });
  }

  public async build() {
    const edgeMaterial = this.getMaterial(0xffffff);
    const xMaterial = this.getMaterial(0xff0000);
    const yMaterial = this.getMaterial(0x0000ff);
    const topMaterial = this.getMaterial(0x00ff00);

    this.handleEntries.forEach(([axis, mesh]) => {
      switch (axis) {
        case GizmoDiagonalAxis.XZ1:
        case GizmoDiagonalAxis.XZ2:
        case GizmoNegativeDiagonalAxis.XZ1:
        case GizmoNegativeDiagonalAxis.XZ2:
          mesh.geometry = new THREE.PlaneGeometry(1, 1).rotateX(Math.PI / 2);
          mesh.material = edgeMaterial;
          break;
        case GizmoDirectionalAxis.X:
        case GizmoNegativeDirectionalAxis.X:
          mesh.geometry = new THREE.PlaneGeometry(1, 1)
            .rotateX(Math.PI / 2)
            .rotateY(Math.PI / 2);
          mesh.material = xMaterial;
          break;
        case GizmoDirectionalAxis.Z:
        case GizmoNegativeDirectionalAxis.Z:
          mesh.geometry = new THREE.PlaneGeometry(1, 1).rotateX(Math.PI / 2);
          mesh.material = yMaterial;
          break;
        case GizmoDirectionalAxis.Y:
          mesh.geometry = new THREE.CylinderGeometry(0, this.topRadius, 1, 16);
          mesh.material = topMaterial;
          break;
        default:
      }
    });

    this.updateGeometryAndLine3s();
  }

  private mapToGizmoAxis(
    handleAxis: keyof GizmoHandles<GizmoMode.Scale>
  ): GizmoTransformAxis<GizmoMode.Scale> {
    switch (handleAxis) {
      case GizmoDirectionalAxis.X:
      case GizmoNegativeDirectionalAxis.X:
        return GizmoDirectionalAxis.X;
      case GizmoDirectionalAxis.Z:
      case GizmoNegativeDirectionalAxis.Z:
        return GizmoDirectionalAxis.Z;
      case GizmoDiagonalAxis.XZ1:
      case GizmoNegativeDiagonalAxis.XZ1:
        return GizmoDiagonalAxis.XZ1;
      case GizmoDiagonalAxis.XZ2:
      case GizmoNegativeDiagonalAxis.XZ2:
        return GizmoDiagonalAxis.XZ2;
      case GizmoDirectionalAxis.Y:
      default:
        return GizmoDirectionalAxis.Y;
    }
  }

  private updateGeometryAndLine3s() {
    this.updateGeometry();
    this.updateDiagLine3s();
  }

  private updateGeometry() {
    const { vector } = this.scaleUtils;

    const xDistance = (this.geoDimension.x + this.handleWidth) / 2;
    const yDistance = this.geoDimension.y / 2;
    const zDistance = (this.geoDimension.z + this.handleWidth) / 2;

    this.handleEntries.forEach(([axis, { geometry }]) => {
      geometry.computeBoundingBox();
      geometry.center();
      const boundingBox = geometry.boundingBox;
      if (!boundingBox) return;
      boundingBox.getSize(vector);
      let scale: [number, number, number];

      switch (axis) {
        case GizmoDiagonalAxis.XZ1:
        case GizmoDiagonalAxis.XZ2:
        case GizmoNegativeDiagonalAxis.XZ1:
        case GizmoNegativeDiagonalAxis.XZ2:
          scale = [this.handleWidth / vector.x, 1, this.handleWidth / vector.z];
          break;
        case GizmoDirectionalAxis.X:
        case GizmoNegativeDirectionalAxis.X:
          scale = [
            this.handleWidth / vector.x,
            1,
            this.geoDimension.z / vector.z,
          ];
          break;
        case GizmoDirectionalAxis.Z:
        case GizmoNegativeDirectionalAxis.Z:
          scale = [
            this.geoDimension.x / vector.x,
            1,
            this.handleWidth / vector.z,
          ];
          break;
        case GizmoDirectionalAxis.Y:
          scale = [1, this.topHeight / vector.y, 1];
          break;
        default:
          return;
      }

      if (scale.some((val) => !val || !isFinite(val))) return;
      geometry.scale(...scale);

      switch (axis) {
        case GizmoDiagonalAxis.XZ1:
          geometry.translate(xDistance, 0, zDistance);
          break;
        case GizmoDiagonalAxis.XZ2:
          geometry.translate(xDistance, 0, -zDistance);
          break;
        case GizmoNegativeDiagonalAxis.XZ2:
          geometry.translate(-xDistance, 0, zDistance);
          break;
        case GizmoNegativeDiagonalAxis.XZ1:
          geometry.translate(-xDistance, 0, -zDistance);
          break;
        case GizmoDirectionalAxis.X:
          geometry.translate(xDistance, 0, 0);
          break;
        case GizmoNegativeDirectionalAxis.X:
          geometry.translate(-xDistance, 0, 0);
          break;
        case GizmoDirectionalAxis.Z:
          geometry.translate(0, 0, zDistance);
          break;
        case GizmoNegativeDirectionalAxis.Z:
          geometry.translate(0, 0, -zDistance);
          break;
        case GizmoDirectionalAxis.Y:
          geometry.translate(0, yDistance + this.topHeight / 2, 0);
          break;
        default:
      }
    });
  }

  private updateDiagLine3s() {
    const { [GizmoDiagonalAxis.XZ1]: pos, [GizmoDiagonalAxis.XZ2]: neg } =
      this.diagLine3s;
    const x = this.dimension.x / 2;
    const z = this.dimension.z / 2;
    pos.start.set(-x, 0, -z);
    pos.end.set(x, 0, z);
    neg.start.set(-x, 0, z);
    neg.end.set(x, 0, -z);
    this.transformLine3(pos);
    this.transformLine3(neg);
  }

  private get handleEntries() {
    return Object.entries(this.handles) as Entries<
      GizmoHandles<GizmoMode.Scale>
    >;
  }

  public get handleList() {
    return Object.values(this.handles);
  }

  public getAxisPoint() {
    switch (this.axis) {
      case GizmoDirectionalAxis.X:
      case GizmoDirectionalAxis.Z:
      case GizmoDirectionalAxis.Y:
        return this.intersectLine3(this.dragPoint);
      case GizmoDiagonalAxis.XZ1:
      case GizmoDiagonalAxis.XZ2:
        return this.intersectTargetLine3(
          this.diagLine3s[this.axis],
          this.dragPoint
        );
      default:
        return null;
    }
  }

  public set(
    position: THREE.Vector3,
    rotation: THREE.Euler,
    dimension: THREE.Vector3
  ) {
    super.set(position, rotation);
    this.setDimension(dimension, false);
    this.updateGeometryAndLine3s();
  }

  public updateScaleFactor() {
    super.updateScaleFactor();
    this.geoDimension.copy(this.dimension).divideScalar(this.scaleFactor);
    this.updateGeometry();
  }

  private setDimension(dimension: THREE.Vector3, update = true) {
    this.dimension.copy(dimension);
    this.geoDimension.copy(dimension).divideScalar(this.scaleFactor);
    if (update) this.updateGeometryAndLine3s();
  }

  public setupDrag(): boolean {
    const { vector, plane } = this.scaleUtils;
    const { direction } = this.dragStart;
    switch (this.axis) {
      case GizmoDirectionalAxis.X:
        direction.set(1, 0, 0);
        this.dragStart.axis = StandardAxis.X;
        break;
      case GizmoDirectionalAxis.Y:
        direction.set(0, 1, 0);
        this.dragStart.axis = StandardAxis.Y;
        break;
      case GizmoDirectionalAxis.Z:
        direction.set(0, 0, 1);
        this.dragStart.axis = StandardAxis.Z;
        break;
      case GizmoDiagonalAxis.XZ1:
      case GizmoDiagonalAxis.XZ2:
        this.dragStart.axis = null;
        break;
      default:
        return false;
    }

    if (!this.pivoted) {
      // aa bb cc

      // this.dragStart.offset =

      const distance = vector
        .subVectors(this.dragPoint, this.gizmoPosition)
        .length();

      // this.dragStart.offset =
      //   distance - this.dimension[this.dragStart.axis] * 0.5;

      if (this.dragStart.axis) {
        this.dragStart.offset =
          distance - this.dimension[this.dragStart.axis] * 0.5;

        this.dragStart.startDistance = distance - this.dragStart.offset;

        this.dragStart.center.copy(this.gizmoPosition);
      }

      return true;
    }

    if (this.dragStart.axis) {
      direction.applyEuler(this.gizmoRotation);
      vector.setFromMatrixPosition(this.initialTransform);
      plane.setFromNormalAndCoplanarPoint(direction, vector);
      direction.multiplyScalar(plane.distanceToPoint(this.gizmoPosition));
      const distance = vector
        .subVectors(this.dragPoint, this.gizmoPosition)
        .length();
      this.dragStart.offset =
        distance - this.dimension[this.dragStart.axis] * 0.5;
      this.dragStart.startDistance = distance - this.dragStart.offset;
    } else {
      vector.setFromMatrixPosition(this.initialTransform);
      direction.subVectors(this.gizmoPosition, vector);
      const distance = vector
        .subVectors(this.dragPoint, this.gizmoPosition)
        .length();
      const hypotenuse = Math.sqrt(
        Math.pow(this.dimension.x / 2, 2) + Math.pow(this.dimension.z / 2, 2)
      );
      this.dragStart.offset = distance - hypotenuse;
      this.dragStart.startDistance = distance - this.dragStart.offset;
    }
    return this.dragStart.startDistance > 0;
  }

  public transformTarget() {
    const { vector } = this.scaleUtils;
    const { axis, direction, offset, startDistance } = this.dragStart;
    const scalarScale =
      (vector.subVectors(this.dragPoint, this.gizmoPosition).length() -
        offset) /
      startDistance;

    if (!this.pivoted) {
      console.log("scale: ", scalarScale);

      // New logic here

      return true;
    }

    vector
      .copy(direction)
      .normalize()
      .multiplyScalar(direction.length() * (scalarScale - 1));
    this.target.position
      .setFromMatrixPosition(this.initialTransform)
      .sub(vector);
    this.target.scale.setFromMatrixScale(this.initialTransform);
    if (axis) this.target.scale[axis] *= scalarScale;
    else this.target.scale.multiplyScalar(scalarScale);
    return true;
  }

  public setFromTarget(type?: GizmoUpdateType) {
    if (type === GizmoUpdateType.Rotate) return true; // No rotation allowed
    const { box3, vector, size, rotation } = this.scaleUtils;

    if (this.pivoted) {
      // if (false) {
      rotation.copy(this.target.rotation);
      this.target.rotation.set(0, 0, 0);
      box3.setFromObject(this.target);
      this.target.rotation.copy(rotation);
      box3.getSize(size);
      size.y *= 2;
      if (size.toArray().some((val) => !val || !isFinite(val))) return false;
      if (type === GizmoUpdateType.Drag) {
        this.setDimension(size);
        return true;
      }
      box3.getCenter(vector);
      vector.y = box3.min.y;
      vector
        .sub(this.target.position)
        .applyEuler(rotation)
        .add(this.target.position);
      this.set(vector, this.target.rotation, size);

      // const v1 = new THREE.Vector3();
      // const v2 = new THREE.Vector3();
      // const v3 = new THREE.Vector3();
      // const v4 = new THREE.Vector3();
      // const v5 = new THREE.Vector3();
      // const v6 = new THREE.Vector3();

      // const q1 = new THREE.Quaternion();
      // const q2 = new THREE.Quaternion();
      // const q3 = new THREE.Quaternion();
      // const q4 = new THREE.Quaternion();
      // const q5 = new THREE.Quaternion();
      // const q6 = new THREE.Quaternion();

      // const mx = new THREE.Matrix4().compose(
      //   vector,
      //   this.target.quaternion,
      //   size
      // );

      // console.log("mx: ", vector);

      // const parent = this.target.parent;

      // if (parent) {
      //   parent.updateMatrix();
      //   parent.updateMatrixWorld();

      //   const L2 = parent.matrix.clone().multiply(mx);

      //   L2.decompose(v1, q1, v2);
      // }
    } else {
      const parent = this.target.parent;
      if (!parent) return false;
      const numOfAncestors = this.setSimulatedGroup(this.target);
      parent.remove(this.target);
      this.simulatedGroups[0].add(this.target);
      box3.setFromObject(this.simulatedGroups[numOfAncestors - 1]);
      this.simulatedGroups[0].remove(this.target);
      parent.add(this.target);
      box3.getSize(size);
      box3.getCenter(vector);
      size.y *= 2;
      vector.y = box3.min.y;
      this.set(vector, this.scaleUtils.rotation.set(0, 0, 0), size);
    }
    return true;
  }

  private setSimulatedGroup(object: THREE.Object3D, index = 0): number {
    const parent = object.parent;
    if (!parent) return index;

    // let forgedParent: THREE.Group

    // if (!this.simulatedGroups[index]) {

    // }

    // const forgedParent =
    //   this.simulatedGroups[index] ||
    //   function () {
    //     const group = new THREE.Group();
    //     this.simulatedGroups.push(group);
    //     return group;
    //   }.bind(this)();

    let forgedParent = this.simulatedGroups[index];

    if (!forgedParent) {
      const group = new THREE.Group();
      this.simulatedGroups.push(group);
      if (index) group.add(this.simulatedGroups[index - 1]);
      forgedParent = group;
    }

    parent.updateMatrix();

    // console.log("show this: ", parent.matrix);

    parent.matrix.decompose(
      forgedParent.position,
      forgedParent.quaternion,
      forgedParent.scale
    );

    return this.setSimulatedGroup(parent, index + 1);
  }
}
