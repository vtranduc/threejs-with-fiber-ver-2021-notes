import React, { SetStateAction, useEffect, useRef, useState, Dispatch, useMemo } from 'react';
import { Canvas, useFrame, extend, useThree, ReactThreeFiber } from "@react-three/fiber";
import * as THREE from 'three'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Shelter from './fonts/Shelter_PersonalUseOnly_Regular.json'

extend({ OrbitControls, VertexNormalsHelper, Line_: THREE.Line });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
      vertexNormalsHelper: ReactThreeFiber.Object3DNode<VertexNormalsHelper, typeof VertexNormalsHelper>
      line_: ReactThreeFiber.Object3DNode<THREE.Line, typeof THREE.Line>
    }
  }
}

enum Geometry {
  Sphere = 'SPHERE',
  Cube = 'CUBE',
  Torus = 'TORUS'
}

enum LightSensitiveMaterial {
  Lambert = 'LAMBERT',
  Phong = 'PHONG',
  Standard = 'STANDARD'
}

const SCENE_CONSTANTS = {
  width: 800,
  height: 500,
  backgroundColor: 0xababab
}

function App() {
  const pages = 15
  const [page, setPage] = useState<number>(pages - 1)
  const [backgroundColor, setBackgroundColor] = useState<number>(SCENE_CONSTANTS.backgroundColor)

  function displayPage() {
    switch (page) {
      case 0:
        return <SimpleAnimatedCube />
      case 1:
        return <SimpleSphere />
      case 2:
        return <SimpleTorus />
      case 3:
        return <SimpleCustomGeo />
      case 4:
        return <SimpleText />
      case 5:
        return <SimpleNormal geometry={Geometry.Cube} />
      case 6:
        return <SimpleNormal geometry={Geometry.Sphere} />
      case 7:
        return <SimpleNormal geometry={Geometry.Torus} />
      case 8:
        return <SimpleDepthMaterial setBackgroundColor={setBackgroundColor} />
      case 9:
        return <SimpleLineMaterial />
      case 10:
        return <SimpleDashedLineMaterial />
      case 11:
        return <SimplePointsMaterial />
      case 12:
        return <SimpleLightSensitiveMaterial type={LightSensitiveMaterial.Lambert} />
      case 13:
        return <SimpleLightSensitiveMaterial type={LightSensitiveMaterial.Phong} />
      case 14:
        return <SimpleLightSensitiveMaterial type={LightSensitiveMaterial.Standard} />
      default:
        return null
    }
  }

  return (
    <>
      <button onClick={() => setPage((page ? page : pages) - 1)}>Previous</button>
      <button onClick={() => setPage((page + 1) % pages)}>Next</button>
      <label>{page}</label>
      <SimpleScene backgroundColor={backgroundColor} >
        {displayPage()}
      </SimpleScene>
    </>
  );
}

export default App;

function SimpleLightSensitiveMaterial({ type = LightSensitiveMaterial.Standard }
  : { type?: LightSensitiveMaterial }) {
  const box = useRef<THREE.Mesh>(new THREE.Mesh())
  const sphere = useRef<THREE.Mesh>(new THREE.Mesh())
  const cone = useRef<THREE.Mesh>(new THREE.Mesh())

  const [add, setAdd] = useState<number>(0)

  const material = useMemo(() => {
    switch (type) {
      case LightSensitiveMaterial.Lambert:
        return new THREE.MeshLambertMaterial({
          side: THREE.DoubleSide, color: 0x7fc5f9,
          emissive: 0x25673d, emissiveIntensity: 0.5
        })
      case LightSensitiveMaterial.Phong:
        return new THREE.MeshPhongMaterial({
          side: THREE.DoubleSide, color: 0x7fc5f9,
          emissive: 0x25673d, emissiveIntensity: 0.5,
          shininess: 100,
          specular: 0x9d0a00
        })
      case LightSensitiveMaterial.Standard:
      default:
        return new THREE.MeshStandardMaterial({
          side: THREE.DoubleSide, color: 0x7fc5f9,
          emissive: 0x25673d, emissiveIntensity: 0,
          metalness: 1, roughness: 0.2
        })
    }
  }, [type])

  useEffect(() => { setAdd(type === LightSensitiveMaterial.Phong ? 0.6 : 0.006) }, [type])

  useEffect(() => {
    box.current.material = material
    box.current.position.x = -3
  }, [box, material])

  useEffect(() => {
    sphere.current.material = material
    sphere.current.position.x = 0
  }, [sphere, material])

  useEffect(() => {
    cone.current.material = material
    cone.current.position.x = 3.5
  }, [cone, material])

  useFrame(() => {
    [box, sphere, cone].forEach(mesh => mesh.current.rotation.x += 0.0085)
    switch (type) {
      case LightSensitiveMaterial.Lambert:
        material.emissiveIntensity += add
        if (material.emissiveIntensity >= 1) setAdd(-Math.abs(add))
        else if (material.emissiveIntensity <= 0) setAdd(Math.abs(add))
        break;
      case LightSensitiveMaterial.Phong:
        (material as THREE.MeshPhongMaterial).shininess += add
        if ((material as THREE.MeshPhongMaterial).shininess >= 100) setAdd(-Math.abs(add))
        else if ((material as THREE.MeshPhongMaterial).shininess <= 0) setAdd(Math.abs(add))
        break
      case LightSensitiveMaterial.Standard:
        (material as THREE.MeshStandardMaterial).roughness += add
        if ((material as THREE.MeshStandardMaterial).roughness >= 1) setAdd(-Math.abs(add))
        else if ((material as THREE.MeshStandardMaterial).roughness <= 0) setAdd(Math.abs(add))
        break
      default:
    }
  })

  return <group>
    <directionalLight args={[0xffffff]} />
    <mesh ref={box}><boxGeometry args={[1.5, 1.5, 1.5]} /></mesh>
    <mesh ref={sphere}><sphereGeometry args={[1.5, 15, 15]} /></mesh>
    <mesh ref={cone}><coneGeometry args={[1.5, 2, 10, 1, true]} /></mesh>
  </group>
}

function SimplePointsMaterial() {
  const points = useRef<THREE.Points>(new THREE.Points())
  const geometry = useMemo(() => {
    const nPoints = 5000
    let vertices = []
    for (let i = 0; i < nPoints * 3; i++) vertices.push(randInt(-25, 25))
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
    geometry.computeBoundingSphere()
    return geometry
  }, [])
  useEffect(() => { points.current.geometry = geometry }, [points, geometry])
  useFrame(() => points.current.rotation.y += 0.001)
  function randInt(from: number, to: number) { return Math.random() * (to - from) + from }
  return <points ref={points}><pointsMaterial color={0xffffff} size={0.5} /></points>
}

function SimpleDashedLineMaterial() {
  const ref = useRef<THREE.Line>(new THREE.Line())
  const geometry = useMemo(() => {
    const vertices = [];
    const divisions = 50;
    for (let i = 0; i <= divisions; i++) {
      const v = (i / divisions) * (Math.PI * 2);
      const x = Math.sin(v);
      const y = Math.cos(v);
      vertices.push(x, y, 0);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, []);
  useFrame(() => ref.current.rotation.z += 0.005)
  return (
    <line_
      ref={ref}
      onUpdate={(line) => line.computeLineDistances()}
      geometry={geometry}
      scale={[2, 2, 2]}
    >
      <lineDashedMaterial color="blue" dashSize={0.1} gapSize={0.1} />
    </line_>
  );
}


function SimpleLineMaterial({ dashed = true }: { dashed?: boolean }) {
  const cylinderGeo = new THREE.CylinderGeometry(1.5, 1, 2)
  const cylinderPos = new THREE.Vector3(-2.5, 0, -5)

  const sphereGeo = new THREE.SphereGeometry(1.5, 15, 15)
  const spherePos = new THREE.Vector3(2.5, 0, 0)

  function LineObject({ geo, pos }
    : { geo: THREE.CylinderGeometry | THREE.SphereGeometry, pos: THREE.Vector3 }) {
    const line = useRef<THREE.Line>(new THREE.Line())
    useFrame(() => line.current.rotation.y += 0.01)
    return <line_ ref={line} geometry={geo} position={pos}>
      <lineBasicMaterial color={"blue"} linewidth={1} />
    </line_>
  }

  return <group>
    <LineObject geo={cylinderGeo} pos={cylinderPos} />
    <LineObject geo={sphereGeo} pos={spherePos} />
  </group>
}

function SimpleDepthMaterial({ setBackgroundColor }: { setBackgroundColor: Dispatch<SetStateAction<number>> }) {
  const material = new THREE.MeshDepthMaterial()

  useEffect(() => {
    setBackgroundColor(0xffffff)
    return () => setBackgroundColor(SCENE_CONSTANTS.backgroundColor)
  }, [setBackgroundColor])

  function SimpleBoxDepth() {
    const [add, setAdd] = useState<number>(0.03)
    const ref = useRef<THREE.Mesh>(new THREE.Mesh())
    useEffect(() => {
      ref.current.material = material
    }, [ref])
    useFrame(() => {
      if (ref.current.position.z > 3) setAdd(-Math.abs(add))
      else if (ref.current.position.z < -8) setAdd(Math.abs(add))
      ref.current.position.z += add
    })
    return <mesh ref={ref} position={[-2.5, 0, -5]}><boxGeometry args={[1.5, 1, 2]} /></mesh>
  }

  function SimpleSphereDepth() {
    const [add, setAdd] = useState<number>(-0.03)
    const ref = useRef<THREE.Mesh>(new THREE.Mesh())
    useEffect(() => {
      ref.current.material = material
    }, [ref])
    useFrame(() => {
      if (ref.current.position.z > 3) setAdd(-Math.abs(add))
      else if (ref.current.position.z < -8) setAdd(Math.abs(add))
      ref.current.position.z += add
    })
    return <mesh ref={ref} position={[2.5, 0, 0]}><sphereGeometry args={[1.5, 30, 30]} /></mesh>
  }

  return <group><SimpleBoxDepth /><SimpleSphereDepth /></group>
}

function SimpleNormal({ geometry }: { geometry?: Geometry }) {
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh())
  useFrame(() => mesh.current.rotation.x += 0.01)
  useEffect(() => {
    if (mesh.current) {
      mesh.current.rotation.x = 0
      const vNormals = new VertexNormalsHelper(mesh.current, 0.3, 0xbabbbb)
      while (mesh.current.children.length) mesh.current.remove(mesh.current.children[0])
      mesh.current.add(vNormals)
      const wireframe = new THREE.WireframeGeometry(mesh.current.geometry)
      const frame = new THREE.LineSegments(wireframe)
      mesh.current.add(frame)
    }
  }, [mesh, geometry])
  function getGeo() {
    switch (geometry) {
      case Geometry.Sphere:
        return <sphereGeometry args={[1, 10, 10]} />
      case Geometry.Torus:
        return <torusGeometry args={[1, 0.3, 10, 12]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }
  return <mesh ref={mesh}>{getGeo()}<meshNormalMaterial /></mesh>
}

function SimpleText() {
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh())
  const loader = new THREE.FontLoader()
  const font = loader.parse(Shelter)
  const opts: THREE.TextGeometryParameters = {
    font,
    size: 1,
    height: 0.1
  };
  useEffect(() => {
    mesh.current.position.x = -1
  }, [mesh])
  useFrame(() => mesh.current.rotation.y += 0.006)
  return <mesh ref={mesh}>
    <textGeometry args={['Hello\nWorld', opts]} />
    <meshBasicMaterial color={0x034b59} />
  </mesh>
}

function SimpleCustomGeo() {
  const v0Limit = 3
  const [add, setAdd] = useState<number>(0.05)
  const [v0Comp, setV0Comp] = useState<number>(0)
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh())
  const geometry = useRef<THREE.BufferGeometry>(null)
  useEffect(() => {
    if (geometry.current) {
      const v0 = [1.5, v0Comp, 0]
      const v1 = [0, 2.5, 0]
      const v2 = [0, 0, 1]
      const v3 = [0.5, 1, -1]
      const vertices = new Float32Array([
        ...v0, ...v1, ...v2,
        ...v1, ...v2, ...v3,
        ...v0, ...v2, ...v3
      ])
      geometry.current.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    }
  }, [geometry, v0Comp])
  useFrame(() => {
    mesh.current.rotation.y += 0.01
    setV0Comp(oldV0Compt => {
      if (oldV0Compt > v0Limit) setAdd(-Math.abs(add))
      else if (oldV0Compt < -v0Limit) setAdd(Math.abs(add))
      return oldV0Compt + add
    })
  })
  return <mesh ref={mesh}>
    <bufferGeometry ref={geometry} />
    <meshBasicMaterial color={0xffffff} side={THREE.DoubleSide} wireframe />
  </mesh>
}

function SimpleTorus() {
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh())
  useFrame(() => mesh.current.rotation.y += 0.01)
  return <mesh ref={mesh}>
    <torusGeometry args={[1, 0.5, 10, 30, Math.PI]} />
    <meshBasicMaterial color={0xffffff} wireframe />
  </mesh>
}

function SimpleSphere() {
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh())
  useFrame(() => {
    mesh.current.rotation.y += 0.01
  })
  return <mesh ref={mesh}>
    <sphereGeometry args={[0.5, 10, 10, 0, Math.PI, 0, Math.PI / 2]} />
    <meshBasicMaterial color={0x00a1cb} wireframe />
  </mesh>
}

function SimpleAnimatedCube() {
  let ADD = 0.05
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh())
  const material = useRef<THREE.MeshBasicMaterial>(new THREE.MeshBasicMaterial())
  useFrame(() => {
    mesh.current.position.x += ADD
    if (mesh.current.position.x >= 2
      || mesh.current.position.x <= -2) {
      ADD *= -1
      material.current.color.setHex(Math.random() * 0xffffff)
    }
  })
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial ref={material} color={0x00a1cb} />
    </mesh >
  )
}

function getCamera() {
  const camera = new THREE.PerspectiveCamera(30, SCENE_CONSTANTS.width / SCENE_CONSTANTS.height, 1, 1000)
  camera.position.z = 5
  return camera
}

function SimpleScene({ children, backgroundColor }: {
  children?: React.ReactChild
  | React.ReactChild[] | null;
  backgroundColor: number
}) {
  const camera2 = getCamera()
  const gridProperties = { size: 10, divisions: 50 }
  return (
    <div style={{ width: SCENE_CONSTANTS.width, height: SCENE_CONSTANTS.height }}>
      <Canvas camera={camera2}>
        <CameraControls />
        <gridHelper args={[gridProperties.size, gridProperties.divisions]} />
        <color attach="background" args={[backgroundColor]} />
        {children}
      </Canvas>
    </div>
  )
}

type IncludeDummy<T> = T | Dummy

class Dummy {
  public update() { }
}

function CameraControls() {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls class.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls

  const {
    camera,
    gl: { domElement },
  } = useThree();

  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls = useRef<IncludeDummy<OrbitControls>>(new Dummy());
  useFrame(() => controls.current.update());
  return (
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
    // enableZoom={false}
    // maxAzimuthAngle={Math.PI / 4}
    // maxPolarAngle={Math.PI}
    // minAzimuthAngle={-Math.PI / 4}
    // minPolarAngle={0}
    />
  );
};
