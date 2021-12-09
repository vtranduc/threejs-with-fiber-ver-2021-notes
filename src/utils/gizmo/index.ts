import * as THREE from "three";
import { GizmoMode, GizmoUpdateType } from "../../types";
import { Gizmo, GizmoUtil } from "./Gizmo";
import { RotateGizmo } from "./RotateGizmo";
import { ScaleGizmo } from "./ScaleGizmo";
import { TranslateGizmo } from "./TranslateGizmo";

export class TransformControl {
  private gizmos: Record<GizmoMode, Gizmo>;
  private gizmoUtil: GizmoUtil;
  private mode: GizmoMode;
  private placeHolderTarget: THREE.Object3D;
  private isDragging: boolean;
  private planeHelpers: THREE.PlaneHelper[];
  private object: THREE.Group;
  private utils: {
    rotation: THREE.Euler;
  };

  constructor(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    this.gizmoUtil = new GizmoUtil(camera);
    this.gizmos = {
      [GizmoMode.Translate]: new TranslateGizmo(this.gizmoUtil),
      [GizmoMode.Rotate]: new RotateGizmo(this.gizmoUtil),
      [GizmoMode.Scale]: new ScaleGizmo(this.gizmoUtil),
    };
    this.object = new THREE.Group();
    this.isDragging = false;
    this.mode = GizmoMode.Translate;
    this.placeHolderTarget = new THREE.Object3D();
    this.utils = {
      rotation: new THREE.Euler(),
    };
    this.planeHelpers = [];
    this.unsetTarget();
  }

  // Plane Helpers

  private updatePlaneHelpers() {
    const colors = [0xff0000, 0x0000ff, 0x00ff00, 0xffffff, 0x000000];
    this.planeHelpers = this.gizmo.planeList.map((plane, i) => {
      const helper =
        this.planeHelpers[i] ||
        new THREE.PlaneHelper(plane, 2, colors[i % colors.length]);
      helper.plane = plane;
      return helper;
    });
  }

  // Prepare gizmo meshes asynchronously

  public async build() {
    for (let mode of Object.values(GizmoMode) as GizmoMode[])
      await this.gizmos[mode].build();
  }

  // Listener handlers

  public onMouseDown(coord: [number, number]): void {
    if (!this.enabled) return;
    this.gizmoUtil.setRaycaster(coord);
    this.isDragging = this.gizmo.initializeDrag();
  }

  public onMouseUp(coord: [number, number]): void {
    this.isDragging = false;
  }

  public onMouseMove(coord: [number, number]): void {
    if (!this.isTransforming) return;
    this.gizmoUtil.setRaycaster(coord);
    this.isDragging = this.gizmo.drag();
  }

  // Mode control

  public changeMode(mode: GizmoMode) {
    this.mode = mode;
    this.addGizmo();
    this.gizmo.updateScaleFactor();
    this.gizmo.setFromTarget();
  }

  // Target control

  public setTarget(object3D: THREE.Object3D, updateRotation = false) {
    this.gizmoUtil.setTarget(object3D);
    if (updateRotation) this.rotateByTarget(false);
    this.gizmo.setFromTarget();
    this.enabled = true;
  }

  public unsetTarget() {
    this.gizmoUtil.setTarget(this.placeHolderTarget);
    this.enabled = false;
  }

  // Rotation control

  public setRotation(rotation: THREE.Euler, update = true) {
    this.gizmoUtil.setBaseRotation(rotation);
    if (update) this.gizmo.setFromTarget(GizmoUpdateType.Rotate);
  }

  public rotateByTarget(update = true) {
    this.setRotation(this.gizmoUtil.target.rotation, update);
  }

  public rotateToAlignXYZ(update = true) {
    this.setRotation(this.utils.rotation.set(0, 0, 0), update);
  }

  // Size control

  public setScaleFactor(scaleFactor: number) {
    this.gizmoUtil.scaleFactor = scaleFactor;
    this.gizmo.updateScaleFactor();
  }

  // Private helpers

  private get gizmo() {
    return this.gizmos[this.mode];
  }

  private get enabled() {
    return this.object.visible;
  }

  private set enabled(enabled: boolean) {
    if (this.enabled === enabled) return;
    this.object.visible = enabled;
    if (enabled) this.addGizmo();
    else this.clearChildren();
  }

  private addGizmo() {
    this.clearChildren();
    this.object.add(this.gizmo);
    this.updatePlaneHelpers();
    this.planeHelpers.forEach((helper) => this.object.add(helper));
  }

  private clearChildren() {
    this.object.children.forEach((child) => this.object.remove(child));
  }

  // User-accessible read-only properties

  get isTransforming() {
    return this.isDragging;
  }

  public getRotation(target: THREE.Euler) {
    target.copy(this.gizmoUtil.getBaseRotation(this.utils.rotation));
  }

  get targetUuid() {
    return this.enabled ? this.gizmoUtil.target.uuid : null;
  }

  get scene() {
    return this.object;
  }
}
