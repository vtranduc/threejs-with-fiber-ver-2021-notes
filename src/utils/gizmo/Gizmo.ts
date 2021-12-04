import {
  GizmoAxis,
  GizmoDirectionalAxis,
  GizmoPlanarAxis,
  GizmoTransformAxis,
  GizmoMode,
  GizmoSpecialAxis,
  GizmoUpdateType,
} from "../../types";
import * as THREE from "three";

/**
 * Some attributes and methods are to be saved and shared among all gizmos.
 * This class is intended to assist with shared features.
 */

export class GizmoUtil {
  private raycaster: THREE.Raycaster;
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private mouse: THREE.Vector2;
  private baseRotation: THREE.Euler;
  private object: THREE.Object3D;

  constructor(
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    object = new THREE.Object3D()
  ) {
    this.raycaster = new THREE.Raycaster();
    this.camera = camera;
    this.mouse = new THREE.Vector2();
    this.baseRotation = new THREE.Euler();
    this.object = object;
  }

  get target() {
    return this.object;
  }

  public setTarget(object: THREE.Object3D) {
    this.object = object;
  }

  public getBaseRotation(target: THREE.Euler) {
    return target.copy(this.baseRotation);
  }

  public setBaseRotation(target: THREE.Euler) {
    this.baseRotation.copy(target);
  }

  public intersectPlane(plane: THREE.Plane, target: THREE.Vector3) {
    return this.raycaster.ray.intersectPlane(plane, target);
  }

  public intersectObjects(objects: THREE.Object3D[]) {
    return this.raycaster.intersectObjects(objects);
  }

  public setRaycaster(coord: [number, number]) {
    this.raycaster.setFromCamera(this.mouse.fromArray(coord), this.camera);
  }

  get raycasterDirection() {
    return this.raycaster.ray.direction;
  }
}

export abstract class Gizmo extends THREE.Group {
  private line3HalfLength = Math.pow(10, 10);
  // public dimension: THREE.Vector3;
  public gizmoPosition: THREE.Vector3;
  public gizmoRotation: THREE.Euler;
  // public target: THREE.Object3D;
  private line3s: Record<GizmoDirectionalAxis, THREE.Line3>;
  private planes: Record<GizmoPlanarAxis, THREE.Plane>;
  private utils: {
    plane: THREE.Plane;
    line3: THREE.Line3;
    dissectingPlane: THREE.Plane;
    normal: THREE.Vector3;
    intersect: THREE.Vector3;
  };
  public dragPoint: THREE.Vector3;
  public axis: GizmoAxis;
  // public raycaster: THREE.Raycaster;
  public initialTransform: THREE.Matrix4;

  private gizmoUtil: GizmoUtil;

  constructor(util: GizmoUtil) {
    super();
    // this.gizmoPosition = new THREE.Vector3();
    // this.gizmoRotation = new THREE.Euler();
    // this.dimension = new THREE.Vector3(5, 1, 1);

    this.gizmoUtil = util;

    this.line3s = {
      [GizmoDirectionalAxis.X]: new THREE.Line3(),
      [GizmoDirectionalAxis.Y]: new THREE.Line3(),
      [GizmoDirectionalAxis.Z]: new THREE.Line3(),
    };
    this.planes = {
      [GizmoPlanarAxis.Z]: new THREE.Plane(),
      [GizmoPlanarAxis.Y]: new THREE.Plane(),
      [GizmoPlanarAxis.X]: new THREE.Plane(),
    };

    // Object.assign(this, attributes);

    // this.target = new THREE.Object3D();

    // this.raycaster = attributes.raycaster;
    // this.gizmoPosition = attributes.gizmoPosition;
    // this.gizmoRotation = attributes.gizmoRotation;

    this.gizmoPosition = new THREE.Vector3();
    this.gizmoRotation = new THREE.Euler();

    // this.dimension = attributes.dimension;
    // this.line3s = attributes.line3s;
    // this.planes = attributes.planes;

    this.utils = {
      plane: new THREE.Plane(),
      line3: new THREE.Line3(),
      dissectingPlane: new THREE.Plane(),
      normal: new THREE.Vector3(),
      intersect: new THREE.Vector3(),
    };

    this.dragPoint = new THREE.Vector3();

    this.axis = GizmoSpecialAxis.XYZ;
    this.initialTransform = new THREE.Matrix4();

    this.reset(); // Call this only once later at the beginning
  }

  get target() {
    return this.gizmoUtil.target;
  }

  // get baseRotation() {
  //   return this.util.baseRotation;
  // }

  get util() {
    return this.gizmoUtil;
  }

  // User Controls

  public initializeDrag(): boolean {
    if (this.intersectHandle() && this.getAxisPoint()) {
      this.storeTargetMatrix();
      return this.setupDrag();
    } else return false;
  }

  public drag(): boolean {
    if (
      this.getAxisPoint() &&
      this.transformTarget() &&
      this.setFromTarget(GizmoUpdateType.Drag)
    )
      return true;
    this.resetTarget();
    this.setFromTarget(GizmoUpdateType.Drag);
    return false;
  }

  private storeTargetMatrix() {
    this.target.updateMatrix();
    this.initialTransform.copy(this.target.matrix);
  }

  private resetTarget() {
    this.initialTransform.decompose(
      this.target.position,
      this.target.quaternion,
      this.target.scale
    );
  }

  // For finding the relevant adjusted intersection point

  public intersectPlane(
    // planarAxis: GizmoPlanarAxis,
    // setRaycaster: THREE.Raycaster,
    target: THREE.Vector3
  ): THREE.Vector3 | null {
    // return setRaycaster.ray.intersectPlane(this.planes[planarAxis], target);
    switch (this.axis) {
      case GizmoPlanarAxis.X:
      case GizmoPlanarAxis.Y:
      case GizmoPlanarAxis.Z:
        // return this.raycaster.ray.intersectPlane(
        //   this.planes[this.axis],
        //   target
        // );
        return this.util.intersectPlane(this.planes[this.axis], target);
      default:
        return null;
    }
  }

  public intersectLine3(
    // directionalAxis: GizmoDirectionalAxis,
    // setRaycaster: THREE.Raycaster,
    target: THREE.Vector3
  ): THREE.Vector3 | null {
    // return this.intersectTargetLine3(
    //   this.line3s[directionalAxis],
    //   setRaycaster,
    //   target
    // );

    switch (this.axis) {
      case GizmoDirectionalAxis.X:
      case GizmoDirectionalAxis.Y:
      case GizmoDirectionalAxis.Z:
        return this.intersectTargetLine3(
          this.line3s[this.axis],
          // this.raycaster,
          target
        );
      default:
        return null;
    }
  }

  public intersectTargetLine3(
    targetLine3: THREE.Line3,
    // setRaycaster: THREE.Raycaster,
    target: THREE.Vector3
  ): THREE.Vector3 | null {
    const { plane, line3, dissectingPlane, intersect, normal } = this.utils;
    plane.setFromNormalAndCoplanarPoint(
      this.util.raycasterDirection,
      this.gizmoPosition
    );
    plane.projectPoint(targetLine3.start, line3.start);
    plane.projectPoint(targetLine3.end, line3.end);
    if (!line3.distance()) return null;
    // if (!this.raycaster.ray.intersectPlane(plane, intersect)) return null;
    if (!this.util.intersectPlane(plane, intersect)) return null;
    dissectingPlane.setFromNormalAndCoplanarPoint(
      normal.subVectors(line3.end, line3.start).normalize(),
      intersect
    );
    return dissectingPlane.intersectLine(targetLine3, target);
  }

  // For set up

  public getMaterial(color: number) {
    return new THREE.MeshPhongMaterial({
      color,
      shininess: 100,
      side: THREE.DoubleSide,
      depthTest: false,
    });
  }

  // For helpers

  public get planeList() {
    return {
      ...this.planes,
      rayPlane: this.utils.plane,
      dissectingPlane: this.utils.dissectingPlane,
    };
  }

  // For Gizmo's transform

  public set(
    position: THREE.Vector3,
    rotation: THREE.Euler,
    dimension?: THREE.Vector3
  ) {
    this.setPosition(position, false);
    this.setRotation(rotation, false);
    this.update();
  }

  public setPosition(position: THREE.Vector3, update = true) {
    this.gizmoPosition.copy(position);
    update && this.update();
  }

  public setRotation(rotation: THREE.Euler, update = true) {
    this.gizmoRotation.copy(rotation);
    update && this.update();
  }

  private update() {
    this.position.copy(this.gizmoPosition);
    this.rotation.copy(this.gizmoRotation);
    this.updateLine3s();
    this.updatePlanes();
  }

  private updateLine3s() {
    this.resetLine3s();
    Object.values(this.line3s).forEach((line3) => this.transformLine3(line3));
  }

  public transformLine3(line3: THREE.Line3) {
    [line3.start, line3.end].forEach((endPoint) =>
      endPoint
        .normalize()
        .multiplyScalar(this.line3HalfLength)
        .applyEuler(this.gizmoRotation)
        .add(this.gizmoPosition)
    );
  }

  private updatePlanes() {
    const { normal } = this.utils;
    this.resetPlaneRotations();
    Object.values(this.planes).forEach((plane) =>
      plane.setFromNormalAndCoplanarPoint(
        normal.copy(plane.normal).applyEuler(this.gizmoRotation),
        this.gizmoPosition
      )
    );
  }

  private reset() {
    this.gizmoPosition.set(0, 0, 0);
    this.gizmoRotation.set(0, 0, 0);
    this.position.set(0, 0, 0);
    this.rotation.set(0, 0, 0);
    this.resetLine3s();
    this.resetPlanes();
  }

  private resetLine3s() {
    this.line3s[GizmoDirectionalAxis.X].start.set(-this.line3HalfLength, 0, 0);
    this.line3s[GizmoDirectionalAxis.X].end.set(this.line3HalfLength, 0, 0);
    this.line3s[GizmoDirectionalAxis.Y].start.set(0, -this.line3HalfLength, 0);
    this.line3s[GizmoDirectionalAxis.Y].end.set(0, this.line3HalfLength, 0);
    this.line3s[GizmoDirectionalAxis.Z].start.set(0, 0, -this.line3HalfLength);
    this.line3s[GizmoDirectionalAxis.Z].end.set(0, 0, this.line3HalfLength);
  }

  private resetPlanes() {
    this.resetPlaneRotations();
    this.resetPlanePositions();
  }

  private resetPlaneRotations() {
    this.planes[GizmoPlanarAxis.Z].normal.set(0, 0, 1);
    this.planes[GizmoPlanarAxis.Y].normal.set(0, 1, 0);
    this.planes[GizmoPlanarAxis.X].normal.set(1, 0, 0);
  }

  private resetPlanePositions() {
    this.planes[GizmoPlanarAxis.X].constant = 0;
    this.planes[GizmoPlanarAxis.Y].constant = 0;
    this.planes[GizmoPlanarAxis.Z].constant = 0;
  }

  // Mandatory abstract methods

  /**
   * This builds the gizmo mesh. It is async because of
   * loading of draco. It should then do relevant set up.
   * It should be called only once immediately after the
   * constructor.
   */

  abstract build(): Promise<void>;

  /**
   * This method shoud update this.axis to intersected axis.
   * If gizmo is not intersected, it simply returns null.
   *
   * Attributes to update: this.axis
   */

  abstract intersectHandle(): GizmoAxis | null;

  /**
   * This method should update this.dragPoint to adjusted
   * touch point.
   *
   * Attributes to update: this.dragPoint
   */

  abstract getAxisPoint(): THREE.Vector3 | null;

  /**
   * This should save all of the relevant data related to starting point of drag.
   * Save any pre-computed values here for efficiency. Avoid any incremental
   * mathematics inside transformTarget method in order to avoid cumulative
   * rounding error.
   */

  abstract setupDrag(): boolean;

  /**
   * This method should transform this.target based on updated this.dragPoint.
   * Calculation should be based on first parameters (saved in setupDrag) and
   * current parameters only. If last parameters are used, the rounding errors
   * will be culmulative and may cause large deviation.
   *
   * Attributes to update: this.target (Object transformation only)
   */

  abstract transformTarget(): boolean;

  /**
   * This method should set the position of the gizmo to proper place.
   * Use this.setPosition and this.setRotation upon updating transformation.
   * Type of update can be specified, which can be used to avoid unnecessary
   * calculations.
   */

  abstract setFromTarget(type?: GizmoUpdateType): boolean;
}
