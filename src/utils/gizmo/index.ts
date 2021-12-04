import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as THREE from "three";
import {
  GizmoAxis,
  GizmoComponentSpec,
  GizmoMode,
  GizmoDirectionalAxis,
  GizmoPlanarAxis,
  GizmoSpecialAxis,
  GizmoTransformAxis,
  GizmoHandles,
  GizmoUpdateType,
  // GizmoSharedAttributes,
} from "../../types";
import { Gizmo, GizmoUtil } from "./Gizmo";
import { RotateGizmo } from "./RotateGizmo";
import { ScaleGizmo } from "./ScaleGizmo";
import { TranslateGizmo } from "./TranslateGizmo";
// import { Vector2 } from "three";

export class TransformControl extends THREE.Group {
  private gizmos: Record<GizmoMode, Gizmo>;
  // private raycaster: THREE.Raycaster;
  // private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private mode: GizmoMode;
  // private mouse: THREE.Vector2;
  // private dragStartPoint: THREE.Vector3;
  // private dragAxis: GizmoAxis | null;

  // private helperGroup: THREE.Group;

  // private

  private target: THREE.Object3D;

  private placeHolderTarget: THREE.Object3D;

  private isDragging: boolean;

  // private box3: THREE.Box3;

  private utils: {
    box3: THREE.Box3;
    vector: THREE.Vector3;
    rotation: THREE.Euler;
    quaternion: THREE.Quaternion;
    mesh: THREE.Mesh;
  };

  // private original: THREE.Matrix4;

  private gizmoUtil: GizmoUtil;

  constructor(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    // this.helperGroup = helperGroup;
    super();

    this.gizmoUtil = new GizmoUtil(camera);

    this.gizmos = {
      [GizmoMode.Translate]: new TranslateGizmo(this.gizmoUtil),
      [GizmoMode.Rotate]: new RotateGizmo(this.gizmoUtil),
      [GizmoMode.Scale]: new ScaleGizmo(this.gizmoUtil),
    };

    this.isDragging = false;

    this.mode = GizmoMode.Rotate;

    // this.camera = camera;
    // this.mouse = new THREE.Vector2();
    // this.mode = GizmoMode.Rotate;
    // this.dragAxis = null;
    // this.dragStartPoint = new THREE.Vector3();

    this.placeHolderTarget = new THREE.Object3D();

    this.target = this.placeHolderTarget;

    // this.box3 = new THREE.Box3();

    // this.original = new THREE.Matrix4();

    this.utils = {
      box3: new THREE.Box3(),
      vector: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      quaternion: new THREE.Quaternion(),
      mesh: new THREE.Mesh(),
    };

    // this.renderOrder = 999;
    // this.material.depthTest = false;
    // this.material.depthWrite = false;

    // this.controlAccess

    this.addHelpers();

    // this.gizmo.setRotation(
    //   new THREE.Euler(Math.PI / 4, Math.PI / 8, Math.PI / 16)
    // );

    this.gizmo.setPosition(new THREE.Vector3(3, 1, 2));
  }

  private addHelpers() {
    const colors = [0xff0000, 0x0000ff, 0x00ff00, 0xffffff, 0x000000];
    this.children.forEach((child) => this.remove(child));
    Object.values(this.gizmo.planeList).forEach((plane, i) => {
      this.add(new THREE.PlaneHelper(plane, 2, colors[i]));
    });
    this.add(this.gizmo);
  }

  public async build() {
    for (let mode of Object.values(GizmoMode) as GizmoMode[])
      await this.gizmos[mode].build();
  }

  // Listener handlers

  public onMouseDown(coord: [number, number]): void {
    // if (this.dragAxis) this.resetDrag();
    // this.setRaycaster(coord);

    this.gizmoUtil.setRaycaster(coord);

    // const axis = this.gizmo.intersectHandle(this.raycaster);
    // if (!axis) return;

    // console.log("SHOW THE AXIS HERE!!!: ", axis);

    // if (!this.gizmo.getAxisPoint(axis, this.raycaster, this.dragStartPoint))
    //   return;
    // this.dragAxis = axis;

    // this.gizmo.getOriginal(this.target, this.original);

    // if (this.gizmo.initializeDrag)

    // The only part needed

    this.isDragging = this.gizmo.initializeDrag();

    // -------------------------

    // 0000000000000000000000000000

    // const name = "peon fdas good abac";

    // const ball = this.children.find((child) => child.name === name);

    // if (ball) ball.position.copy(this.dragStartPoint);
    // else {
    //   const geo = new THREE.SphereGeometry(0.05, 30, 30);
    //   const mat = new THREE.MeshPhongMaterial({
    //     color: 0xffff00,
    //     side: THREE.DoubleSide,
    //     shininess: 100,
    //   });
    //   const mesh = new THREE.Mesh(geo, mat);
    //   mesh.name = name;
    //   mesh.position.copy(this.dragStartPoint);
    //   this.add(mesh);
    // }

    // 000000000000000000000000000
  }

  public onMouseUp(coord: [number, number]): void {
    // if (this.dragAxis) this.resetDrag();
    this.isDragging = false;
  }

  public onMouseMove(coord: [number, number]): void {
    // if (!this.dragAxis) return;

    if (!this.isDragging) return;
    // this.setRaycaster(coord);

    this.gizmoUtil.setRaycaster(coord);

    this.isDragging = this.gizmo.drag();
  }

  public changeMode(mode: GizmoMode) {
    const { gizmoPosition, gizmoRotation } = this.gizmo;
    this.remove(this.gizmo);
    this.mode = mode;
    this.add(this.gizmo);
    // this.gizmo.set(gizmoPosition, gizmoRotation);
    // this.setFromTarget();

    this.gizmo.setFromTarget();
  }

  public setTarget(object3D: THREE.Object3D, updateRotation = false) {
    this.gizmoUtil.setTarget(object3D);

    console.log("huh???");

    // this.target = object3D;
    if (updateRotation) this.rotateByTarget();

    // this.target_ = object3D;

    // this.setFromTarget();

    this.gizmo.setFromTarget();

    this.visible = true;

    // New

    // console.log("SETTING THE TARGET HERE!!!");
  }

  // private get target_() {
  //   return this.gizmo.target;
  // }

  // private set target_(target: THREE.Object3D) {
  //   // if (this.target_.uuid !== target.uuid)
  //   //   Object.values(this.gizmos).forEach((gizmo) => (gizmo.target = target));
  // }

  public unsetTarget() {
    // this.target = this.placeHolderTarget;

    this.gizmoUtil.setTarget(this.placeHolderTarget);

    this.visible = false;
  }

  public setRotation(rotation: THREE.Euler) {
    // this.gizmo.setRotation(rotation);

    console.log("rotation is good!");

    this.gizmoUtil.setBaseRotation(rotation);

    // this.setFromTarget();

    this.gizmo.setFromTarget(GizmoUpdateType.Rotate);
  }

  public rotateByTarget() {
    // this.gizmo.setRotation(this.target.rotation);

    // this.gizmoUtil.setBaseRotation(this.target.rotation);

    // // this.setFromTarget();

    // this.gizmo.setFromTarget(GizmoUpdateType.Rotate);

    this.setRotation(this.gizmoUtil.target.rotation);
  }

  public rotateToAlignXYZ() {
    // this.gizmo.setRotation(this.utils.rotation.set(0, 0, 0));

    // this.gizmoUtil.setBaseRotation(this.utils.rotation.set(0, 0, 0));

    // // this.setFromTarget();

    // this.gizmo.setFromTarget(GizmoUpdateType.Rotate);

    this.setRotation(this.utils.rotation.set(0, 0, 0));
  }

  // ----------------->

  // Read-only properties

  get controlRotation() {
    return this.gizmoUtil.getBaseRotation(this.utils.rotation);
  }

  get targetUuid() {
    return this.gizmoUtil.target.uuid;
  }

  private get gizmo() {
    return this.gizmos[this.mode];
  }
}
