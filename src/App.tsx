import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, extend, useThree, ReactThreeFiber } from "@react-three/fiber";
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import gentilis from './fonts/gentilis_bold.typeface.json'
import Shelter from './fonts/Shelter_PersonalUseOnly_Regular.json'

extend({ OrbitControls });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
    }
  }
}

const SCENE_CONSTANTS = {
  width: 800,
  height: 500,
  backgroundColor: 0xababab
}

function App() {
  const pages = 5
  const [page, setPage] = useState<number>(4)

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
      default:
        return null
    }
  }

  return (
    <>
      <button onClick={() => setPage((page ? page : pages) - 1)}>Previous</button>
      <button onClick={() => setPage((page + 1) % pages)}>Next</button>
      <SimpleScene >
        {displayPage()}
      </SimpleScene>
    </>
  );
}

export default App;

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
  const v0Limit = 6
  const [add, setAdd] = useState<number>(0.05)
  const [v0Comp, setV0Comp] = useState<number>(0)
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh())
  const geometry = useRef<THREE.BufferGeometry>(null)
  useEffect(() => {
    if (geometry.current) {
      const v0 = [3, v0Comp, 0]
      const v1 = [0, 5, 0]
      const v2 = [0, 0, 2]
      const v3 = [1, 2, -2]
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

function SimpleScene({ children }: {
  children?: React.ReactChild
  | React.ReactChild[] | null;
}) {
  const camera2 = getCamera()
  const gridProperties = { size: 10, divisions: 50 }
  return (
    <div style={{ width: SCENE_CONSTANTS.width, height: SCENE_CONSTANTS.height }}>
      <Canvas camera={camera2}>
        <CameraControls />
        <gridHelper args={[gridProperties.size, gridProperties.divisions]} />
        <color attach="background" args={[SCENE_CONSTANTS.backgroundColor]} />
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
