import * as THREE from "three";
import { MeshBasicMaterial } from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

export class NormalFresnelTracer extends THREE.Mesh {
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private raycaster = new THREE.Raycaster();
  private yDir = new THREE.Vector3(0, 1, 0);
  private xzPlane = new THREE.Plane(this.yDir, 0);
  private constants = {
    normalPlateRadius: 0.02,
    normalSphereRadius: 0.01,
    segments: 35,
  };
  private variables = {
    scaleFactor: 1,
    color: new THREE.Color(0xeeeeee),
    rimColor: new THREE.Color(0x7f7f7f),
  };
  private utils = {
    scale: new THREE.Vector3(),
    set: new THREE.Vector3(),
    mouse: new THREE.Vector2(),
    intersect: {
      position: new THREE.Vector3(),
      normal: new THREE.Vector3(),
    },
  };

  public geometry = this.getGeometry();
  public material = [this.getFresnelMaterial(), this.getTransparentMaterial()];

  constructor(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    super();
    this.camera = camera;
  }

  // Getters and Setters

  public get size() {
    return 1 / this.variables.scaleFactor;
  }

  public set size(inputSize: number) {
    if (inputSize <= 0) return;
    this.variables.scaleFactor = 1 / inputSize;
    this.updateScaleByViewDistance();
  }

  public get color() {
    return this.variables.color.getHex();
  }

  public set color(inputColor: number) {
    this.variables.color.set(this.adjustRimColor(inputColor));
  }

  public get rimColor() {
    return this.variables.rimColor.getHex();
  }

  public set rimColor(inputColor: number) {
    this.variables.rimColor.set(this.adjustRimColor(inputColor));
  }

  public get opacity() {
    return (this.material[1] as MeshBasicMaterial).opacity;
  }

  public set opacity(opacity: number) {
    (this.material[1] as MeshBasicMaterial).opacity =
      opacity > 1 ? 1 : opacity < 0 ? 0 : opacity;
  }

  // Public method

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

  // Geometry and material creation

  private getGeometry() {
    const circleGeometry = new THREE.CircleGeometry(
      this.constants.normalPlateRadius,
      this.constants.segments
    );
    const sphereGeometry = new THREE.SphereGeometry(
      this.constants.normalSphereRadius,
      this.constants.segments,
      this.constants.segments
    );
    sphereGeometry.translate(0, 0, this.constants.normalSphereRadius);
    return mergeBufferGeometries([sphereGeometry, circleGeometry], true);
  }

  private getTransparentMaterial() {
    const material = new THREE.MeshBasicMaterial({
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
    });
    material.color = this.variables.color;
    return material;
  }

  private getFresnelMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_color: { value: this.variables.color },
        u_rim_color: { value: this.variables.rimColor },
        u_rim_dot_level: { value: { x: 0.65, y: 0.75 } },
      },

      vertexShader: `
        varying vec3 v_view_position;
        varying vec3 v_world_normal;

        void main() {
          v_view_position = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          v_world_normal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        uniform vec3 u_rim_color;
        uniform vec2 u_rim_dot_level;

        varying vec3 v_view_position;
        varying vec3 v_world_normal;

        void main() {
          float fresnelTerm = abs(dot(v_view_position, v_world_normal));
          float level = smoothstep(u_rim_dot_level.x, u_rim_dot_level.y, fresnelTerm);
          gl_FragColor = vec4(mix(u_rim_color, u_color, level), 1.0);
        }
      `,
    });
  }

  // Utilities

  private updateScaleByViewDistance() {
    const scale =
      this.utils.scale
        .subVectors(this.position, this.camera.position)
        .length() / this.variables.scaleFactor;
    this.scale.set(scale, scale, scale);
  }

  private set(position: THREE.Vector3, normal: THREE.Vector3) {
    this.position.copy(position);
    this.lookAt(this.utils.set.addVectors(position, normal));
  }

  private updateRaycaster(mouse: [number, number]) {
    this.raycaster.setFromCamera(
      this.utils.mouse.fromArray(mouse),
      this.camera
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
