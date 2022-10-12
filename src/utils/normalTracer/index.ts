import * as THREE from "three";

export class NormalTracer extends THREE.Group {
  private raycaster = new THREE.Raycaster();
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private yDir = new THREE.Vector3(0, 1, 0);
  private xzPlane = new THREE.Plane(this.yDir, 0);
  private constants = {
    normalPlateRadius: 0.02,
    camFacingPlateRadius: 0.01,
  };
  private variables = {
    scaleFactor: 1,
    color: new THREE.Color(0xeeeeee),
    rimColor: new THREE.Color(0x7f7f7f),
    opacity: 0.8,
    position: new THREE.Vector3(0, 0, 0),
    normal: new THREE.Vector3(0, 0, 0),
  };
  private plates = {
    normal: this.getNormalPlate(),
    cameraFacing: this.getCameraFacingPlate(),
  };
  private utils = {
    scale: new THREE.Vector3(),
    xyIntersection: new THREE.Vector3(),
    set: new THREE.Vector3(),
    mouse: new THREE.Vector2(),
    intersect: {
      position: new THREE.Vector3(),
      normal: new THREE.Vector3(),
    },
  };

  constructor(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    super();
    this.camera = camera;
    this.add(this.plates.normal);
    this.add(this.plates.cameraFacing);
    this.placeOnIntersectedSurface([0, 0], []);
  }

  // Getters and Setters

  public get size() {
    return 1 / this.variables.scaleFactor;
  }

  public set size(inputSize: number) {
    if (inputSize <= 0) return;
    this.variables.scaleFactor = 1 / inputSize;
    this.updateScaleByViewDistance();
    this.setCameraFacingPlatePosition();
  }

  public get color() {
    return this.variables.color.getHex();
  }

  public set color(inputColor: number) {
    const color = this.adjustRimColor(inputColor);
    this.variables.color.set(color);
    this.plates.normal.material.color.setHex(color);
  }

  public get rimColor() {
    return this.variables.rimColor.getHex();
  }

  public set rimColor(inputColor: number) {
    const color = this.adjustRimColor(inputColor);
    this.variables.rimColor.set(color);
  }

  public get opacity() {
    return this.plates.normal.material.opacity;
  }

  public set opacity(opacity: number) {
    this.plates.normal.material.opacity =
      opacity > 1 ? 1 : opacity < 0 ? 0 : opacity;
  }

  // Public methods

  public placeOnIntersectedSurface(
    mouse: [number, number],
    objects: THREE.Object3D[]
  ): boolean {
    this.updateRaycaster(mouse);
    const intersections = this.raycaster.intersectObjects(objects);

    const surfaceIntersection = intersections.find(
      (intersection) => !!intersection.face?.normal
    );
    const { position, normal } = this.utils.intersect;
    if (!surfaceIntersection) {
      const intersection = this.raycaster.ray.intersectPlane(
        this.xzPlane,
        position
      );
      if (!intersection) return false;
      normal.copy(this.yDir);
    } else {
      position.copy(surfaceIntersection.point);
      normal.copy((surfaceIntersection.face as THREE.Face).normal);
    }
    this.set(position, normal);

    this.updateScaleByViewDistance();

    return true;
  }

  // Meshes

  private getNormalPlate() {
    const geometry = new THREE.CircleGeometry(
      this.constants.normalPlateRadius,
      30
    );
    const material = new THREE.MeshBasicMaterial({
      color: this.variables.color,
      opacity: this.variables.opacity,
      transparent: true,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(geometry, material);
  }

  private getCameraFacingPlate() {
    const geometry = new THREE.CircleGeometry(
      this.constants.camFacingPlateRadius,
      50
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_color: { value: this.variables.color },
        u_rim_color: { value: this.variables.rimColor },
        u_innerRadius: { value: this.constants.camFacingPlateRadius * 0.8 },
      },
      vertexShader: `
          varying vec3 v_position;
          void main() {
            v_position = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }
        `,
      fragmentShader: `
          uniform vec3 u_color;
          uniform vec3 u_rim_color;
          uniform float u_innerRadius;
          varying vec3 v_position;
  
          void main() {
            if (length(v_position) > u_innerRadius) gl_FragColor = vec4(u_rim_color, 1.0);
            else gl_FragColor = vec4(u_color, 1.0);
          }
        `,
    });
    return new THREE.Mesh(geometry, material);
  }

  // Utils

  private updateScaleByViewDistance() {
    const scale =
      this.utils.scale
        .subVectors(this.plates.normal.position, this.camera.position)
        .length() / this.variables.scaleFactor;
    this.plates.normal.scale.set(scale, scale, scale);
    this.plates.cameraFacing.scale.set(scale, scale, scale);
  }

  private updateRaycaster(mouse: [number, number]) {
    this.raycaster.setFromCamera(
      this.utils.mouse.fromArray(mouse),
      this.camera
    );
  }

  private set(position: THREE.Vector3, normal: THREE.Vector3) {
    this.variables.position.copy(position);
    this.variables.normal.copy(normal);
    this.plates.normal.position.copy(position);
    this.plates.normal.lookAt(this.utils.set.addVectors(position, normal));
    const cameraFacingPlate = this.plates.cameraFacing;
    this.setCameraFacingPlatePosition();
    cameraFacingPlate.lookAt(this.camera.position);
  }

  /**
   * This method adjusts the position of camera facing plate based on current position
   * of normal plate and its scale.
   * This implementation is not in method "set" because only the position of camera
   * facing plate needs to be re-adjusted when the size is changed as it may make
   * the plate detached too far from or engulfed into normal plate.
   * Note this this way of placement is not perfect
   */

  private setCameraFacingPlatePosition() {
    const { position, normal } = this.variables;
    this.plates.cameraFacing.position
      .copy(position)
      .add(
        this.utils.set
          .copy(normal)
          .multiplyScalar(
            this.constants.camFacingPlateRadius *
              this.plates.cameraFacing.scale.x
          )
      );
  }

  private adjustRimColor(inputColor: number) {
    return inputColor > 0xffffff
      ? 0xffffff
      : inputColor < 0x000000
      ? 0x000000
      : inputColor;
  }
}
