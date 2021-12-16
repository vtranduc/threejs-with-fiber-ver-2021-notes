import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import {
  GizmoAxis,
  GizmoDirectionalAxis,
  GizmoPlanarAxis,
  GizmoSpecialAxis,
  GizmoUpdateType,
} from "../../types";

export abstract class Gizmo extends THREE.Group {
  private line3HalfLength = Math.pow(10, 10);
  public gizmoPosition: THREE.Vector3;
  public gizmoRotation: THREE.Euler;
  private line3s: Record<GizmoDirectionalAxis, THREE.Line3>;

  private planes: Record<GizmoPlanarAxis, THREE.Plane>;

  public dragPoint: THREE.Vector3;
  public axis: GizmoAxis;
  public initialTransform: THREE.Matrix4;
  private gizmoUtil: GizmoUtil;
  private utils: {
    plane: THREE.Plane;
    line3: THREE.Line3;
    dissectingPlane: THREE.Plane;
    normal: THREE.Vector3;
    intersect: THREE.Vector3;
  };

  // Mandatory abstract methods

  /**
   * This builds the gizmo mesh. It is async because of
   * loading of draco. It should then do relevant set up.
   * It should be called only once immediately after the
   * constructor.
   */

  abstract build(): Promise<void>;

  /**
   * This get method should return the list of meshes of
   * the handle that can be clicked and interacted with.
   * Each mesh must have axis property inside userData,
   * where axis is of type GizmoAxis. Otherwise, error
   * will occur.
   */

  abstract get handleList(): THREE.Mesh[];

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

  constructor(util: GizmoUtil) {
    super();
    this.gizmoUtil = util;
    this.gizmoPosition = new THREE.Vector3();
    this.gizmoRotation = new THREE.Euler();
    this.dragPoint = new THREE.Vector3();
    this.axis = GizmoSpecialAxis.XYZ;
    this.initialTransform = new THREE.Matrix4();
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
    this.utils = {
      plane: new THREE.Plane(),
      line3: new THREE.Line3(),
      dissectingPlane: new THREE.Plane(),
      normal: new THREE.Vector3(),
      intersect: new THREE.Vector3(),
    };
    this.reset();
  }

  // User Controls. To be used from within TransformControl class.

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

  // Adjust the size of gizmo

  public updateScaleFactor() {
    this.scale.set(this.scaleFactor, this.scaleFactor, this.scaleFactor);
  }

  // Find which handle has been clicked

  private intersectHandle() {
    const intersect = this.gizmoUtil.intersectObjects(this.handleList)[0];
    if (!intersect) return null;
    this.axis = intersect.object.userData.axis as GizmoAxis;
    return this.axis;
  }

  // For finding the relevant adjusted intersection point

  public intersectPlane(target: THREE.Vector3): THREE.Vector3 | null {
    switch (this.axis) {
      case GizmoPlanarAxis.X:
      case GizmoPlanarAxis.Y:
      case GizmoPlanarAxis.Z:
        return this.gizmoUtil.intersectPlane(this.planes[this.axis], target);
      default:
        return null;
    }
  }

  public intersectLine3(target: THREE.Vector3): THREE.Vector3 | null {
    switch (this.axis) {
      case GizmoDirectionalAxis.X:
      case GizmoDirectionalAxis.Y:
      case GizmoDirectionalAxis.Z:
        return this.intersectTargetLine3(this.line3s[this.axis], target);
      default:
        return null;
    }
  }

  public intersectTargetLine3(
    targetLine3: THREE.Line3,
    target: THREE.Vector3
  ): THREE.Vector3 | null {
    const { plane, line3, dissectingPlane, intersect, normal } = this.utils;
    plane.setFromNormalAndCoplanarPoint(
      this.gizmoUtil.raycasterDirection,
      this.gizmoPosition
    );
    plane.projectPoint(targetLine3.start, line3.start);
    plane.projectPoint(targetLine3.end, line3.end);
    if (!line3.distance()) return null;
    if (!this.gizmoUtil.intersectPlane(plane, intersect)) return null;
    dissectingPlane.setFromNormalAndCoplanarPoint(
      normal.subVectors(line3.end, line3.start).normalize(),
      intersect
    );
    return dissectingPlane.intersectLine(targetLine3, target);
  }

  // Default material for gizmo's meshes

  public getMaterial(color: number) {
    return new THREE.MeshPhongMaterial({
      color,
      shininess: 100,
      side: THREE.DoubleSide,
      depthTest: false,
    });
  }

  // Read-only properties

  public get planeList() {
    return Object.values(this.planes).concat([
      this.utils.plane,
      this.utils.dissectingPlane,
    ]);
  }

  get target() {
    return this.gizmoUtil.target;
  }

  public getBaseRotation(target: THREE.Euler) {
    return this.gizmoUtil.getBaseRotation(target);
  }

  get loader() {
    return this.gizmoUtil.loader;
  }

  get scaleFactor() {
    return this.gizmoUtil.scaleFactor;
  }

  public getPlaneNormal(axis: GizmoPlanarAxis, target: THREE.Vector3) {
    target.copy(this.planes[axis].normal);
  }

  get pivoted() {
    return this.gizmoUtil.pivoted;
  }

  // For Gizmo's transform. Not to be used from within TransformControl class

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

  // Update and reset logics for planes and line3s.

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
}

/**
 * Some attributes and methods are to be saved and shared among all gizmos.
 * This class is intended to assist with shared features.
 */

export class GizmoUtil {
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private object: THREE.Object3D;
  private mouse = new THREE.Vector2();
  private baseRotation = new THREE.Euler();
  private raycaster = new THREE.Raycaster();
  private dracoLoader = new DRACOLoader();
  public scaleFactor: number;
  public pivoted: boolean;

  constructor(
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    object = new THREE.Object3D()
  ) {
    this.camera = camera;
    this.object = object;
    this.scaleFactor = 1;
    this.pivoted = false;
    this.dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/v1/decoders/"
    );
  }

  get loader() {
    return this.dracoLoader;
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
