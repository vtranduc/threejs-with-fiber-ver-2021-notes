import React, {
  SetStateAction,
  useEffect,
  useState,
  Dispatch,
  useMemo,
  Suspense,
  useRef,
  useCallback,
} from "react";
import {
  Canvas,
  useFrame,
  extend,
  useThree,
  ReactThreeFiber,
  useLoader,
} from "@react-three/fiber";
import * as THREE from "three";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Shelter from "./fonts/Shelter_PersonalUseOnly_Regular.json";
import TWEEN from "@tweenjs/tween.js";
import {
  PerspectiveCamera,
  OrthographicCamera,
  useHelper,
} from "@react-three/drei";
import { hexToRgb, rgbToHex, atan, randomInRange, shuffleArray } from "./utils";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { ErrorBoundary } from "react-error-boundary";
import axios from "axios";
import {
  ViviAction,
  viviData,
  PurpleHeartAction,
  purpleHeartData,
  ShiranuiAction,
  shiranuiData,
} from "./models";
import {
  useCompass,
  useKeyDown,
  useKeyHandler,
  useGLTFAnimation,
  useShadow,
  useStateCallback,
  useMouseMove,
  useClickHandler,
} from "./customHooks";
import { ArrowCode } from "./types";
import { SCENE_CONSTANTS } from "./constants";
import { ShadowEnabler } from "./components";

extend({ OrbitControls, VertexNormalsHelper, Line_: THREE.Line });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >;
      vertexNormalsHelper: ReactThreeFiber.Object3DNode<
        VertexNormalsHelper,
        typeof VertexNormalsHelper
      >;
      line_: ReactThreeFiber.Object3DNode<THREE.Line, typeof THREE.Line>;
    }
  }
}

enum Geometry {
  Sphere = "SPHERE",
  Cube = "CUBE",
  Torus = "TORUS",
}

enum LightSensitiveMaterial {
  Lambert = "LAMBERT",
  Phong = "PHONG",
  Standard = "STANDARD",
}

enum AnimateSpotLight {
  Move = "MOVE",
  Distance = "DISTANCE",
  Angle = "ANGLE",
  Penumbra = "PENUMBRA",
  Decay = "DECAY",
}

enum AnimatePerspectiveCamera {
  Move = "MOVE",
  Fov = "FOV",
}

enum CtrlCode {
  Right = "ControlRight",
  Left = "ControlLeft",
}

enum ActionCode {
  Enter = "Enter",
  Backspace = "Backspace",
  Space = "Space",
}

enum CharaActionKey {
  J = "KeyJ",
  K = "KeyK",
  L = "KeyL",
  U = "KeyU",
  I = "KeyI",
  O = "KeyO",
  P = "KeyP",
  R = "KeyR",
  Semicolon = "Semicolon",
  Quote = "Quote",
}

enum Fade {
  In = "In",
  Out = "Out",
}

interface ScenePage {
  component: JSX.Element;
  title: string;
  details: string;
}

const diceUrl = "http://localhost:8000/dices";

function App() {
  const [showGrid, setShowGrid] = useState<boolean>(SCENE_CONSTANTS.showGrid);
  const [backgroundColor, setBackgroundColor] = useState<number>(
    SCENE_CONSTANTS.backgroundColor
  );
  const [isOrthographic, setIsOrthographic] = useState<boolean>(
    SCENE_CONSTANTS.isOrthographic
  );

  const sceneChapters: ScenePage[] = [
    {
      component: <SimpleAnimatedCube />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleSphere />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleTorus />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleCustomGeo />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleText />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleNormal geometry={Geometry.Cube} />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleNormal geometry={Geometry.Sphere} />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleNormal geometry={Geometry.Torus} />,
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimpleDepthMaterial setBackgroundColor={setBackgroundColor} />
      ),
      title: ``,
      details: ``,
    },
    {
      component: <SimpleLineMaterial />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleDashedLineMaterial />,
      title: ``,
      details: ``,
    },
    {
      component: <SimplePointsMaterial />,
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimpleLightSensitiveMaterial type={LightSensitiveMaterial.Lambert} />
      ),
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimpleLightSensitiveMaterial type={LightSensitiveMaterial.Phong} />
      ),
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimpleLightSensitiveMaterial type={LightSensitiveMaterial.Standard} />
      ),
      title: ``,
      details: ``,
    },
    {
      component: <SimpleAmbientLight />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleHemisphereLight />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleDirectionalLight setShowGrid={setShowGrid} />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleDirectionalLight setShowGrid={setShowGrid} lookAt />,
      title: ``,
      details: ``,
    },
    {
      component: <SimplePointLight setBackgroundColor={setBackgroundColor} />,
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimplePointLight setBackgroundColor={setBackgroundColor} ambient />
      ),
      title: ``,
      details: ``,
    },
    {
      component: <SimpleSpotLight setShowGrid={setShowGrid} />,
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimpleSpotLight
          setShowGrid={setShowGrid}
          animation={AnimateSpotLight.Move}
        />
      ),
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimpleSpotLight
          setShowGrid={setShowGrid}
          animation={AnimateSpotLight.Distance}
        />
      ),
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimpleSpotLight
          setShowGrid={setShowGrid}
          animation={AnimateSpotLight.Angle}
        />
      ),
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimpleSpotLight
          setShowGrid={setShowGrid}
          animation={AnimateSpotLight.Penumbra}
        />
      ),
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimpleSpotLight
          setShowGrid={setShowGrid}
          animation={AnimateSpotLight.Decay}
        />
      ),
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimplePerspectiveCamera animate={AnimatePerspectiveCamera.Fov} />
      ),
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimplePerspectiveCamera animate={AnimatePerspectiveCamera.Move} />
      ),
      title: ``,
      details: ``,
    },
    {
      component: (
        <SimpleOrthographicCamera
          {...{
            setBackgroundColor,
            setShowGrid,
            isOrthographic,
            setIsOrthographic,
          }}
        />
      ),
      title: ``,
      details: ``,
    },
    {
      component: <SimpleTexture />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleTextureWithMaterialIndex />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleOBJLoader />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleKeyboardEvent />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleShadow />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleBufferGeometryBox />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleBufferGeometrySphere />,
      title: ``,
      details: ``,
    },
    {
      component: <SimpleSaveAndLoad />,
      title: `Saving the dice as JSON`,
      details: `You can save the dices into JSON file.${"\n"}
      JSON file can be seen at\nhttp://localhost:8000/dices\n\n
      Some commands are available:\n\n
      Space: Change the number of dice\n
      ENTER or ctrl+S: Save the current object\n
      A: Move left\nW: Move Up\nS: Move down\nD: Move right\n
      ctrl+D: Delete all saved objects\n`,
    },
    {
      component: <SimpleGLTFAnimation />,
      title: `Play with fully animated characters!`,
      details: `You can play with 2 fully animated characters. (Another one is idling NPC)\n
      Vivi's commands:\n
      WASD: Move
      J: Pick up\n
      K: Pick floor\n
      L: Pick front\n
      ; (Semicolon): Switch pose\n
      Purple Heart's commands:\n
      I: Fight
      O: Kick
      P: Switch pose`,
    },
    {
      component: <SimpleRaycaster1 />,
      title: `Use Raycaster to trace the mouse intersection point on rotated plane`,
      details: `This demonstrates mouse movement can be traced on a plane twisted in any angle.\n
      Controls:\n
      WASD: Uses these keys to change rotation of the plane\n
      R: Resets the rotation of the plane\n
      Now, move the mouse over plane. A red ball's position is adjusted to intersection point on the plane\n`,
    },
    {
      component: <SimpleRaycaster2 />,
      title: `Use Raycaster to identify all boxes that have been clicked`,
      details: `Clicking will propagate through the sphere, highlighting all intersecting boxes.\n
      Note that opacity is set low for boxes that are not highlighted.\n
      Controls:\n
      Space: Shuffle the boxes within the sphere\n
      Click: Click in the sphere and highlight all the intersecting boxes!\n`,
    },
  ];

  const pages = sceneChapters.length;
  const [page, setPage] = useState<number>(pages - 1);

  function displayDetails() {
    return sceneChapters[page].details
      .split("\n")
      .map((text, i) => <p key={i}>{text}</p>);
  }

  return (
    <>
      <button onClick={() => setPage((page ? page : pages) - 1)}>
        Previous
      </button>
      <button onClick={() => setPage((page + 1) % pages)}>Next</button>
      <label>{page} </label>
      <label>{sceneChapters[page].title}</label>
      <SimpleScene {...{ showGrid, backgroundColor, isOrthographic }}>
        {sceneChapters[page].component}
      </SimpleScene>
      <div
        style={{
          top: SCENE_CONSTANTS.top + SCENE_CONSTANTS.height,
          position: "absolute",
        }}
      >
        {displayDetails()}
      </div>
    </>
  );
}

export default App;

function SimpleRaycaster2() {
  const { camera } = useThree();
  const r = useMemo(() => 3, []);
  const nBoxes = useMemo(() => 2000, []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const colors = useMemo(() => {
    return { normal: 0x66ccff, highlight: 0xff0000 };
  }, []);
  const opacities = useMemo(() => {
    return { normal: 0.2, highlight: 1 };
  }, []);
  const group = useRef<THREE.Group>(new THREE.Group());
  const boxes = useMemo(() => {
    const boxes = [];
    for (let i = 0; i < nBoxes; i++) {
      const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const material = new THREE.MeshPhongMaterial({
        color: colors.normal,
        shininess: 100,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacities.normal,
      });
      const box = new THREE.Mesh(geometry, material);
      box.castShadow = false;
      box.receiveShadow = false;
      boxes.push(box);
    }
    return boxes;
  }, [nBoxes, colors, opacities]);
  const shuffleBoxes = useCallback(() => {
    boxes.forEach((box) => box.position.set(...randomSphereCoord()));
    function randomSphereCoord() {
      const r1 = randomInRange(-r, r);
      const maxAbsR2 = Math.sqrt(Math.pow(r, 2) - Math.pow(r1, 2));
      const r2 = randomInRange(-maxAbsR2, maxAbsR2);
      const maxAbsR3 = Math.sqrt(
        Math.pow(r, 2) - Math.pow(r1, 2) - Math.pow(r2, 2)
      );
      const r3 = randomInRange(-maxAbsR3, maxAbsR3);
      return shuffleArray([r1, r2, r3]) as [number, number, number];
    }
  }, [boxes, r]);
  const castColor = useCallback(
    (coord: [number, number]) => {
      mouse.fromArray(coord);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster
        .intersectObjects(boxes)
        .map((clicked) => clicked.object.uuid);
      boxes.forEach((box) => {
        if (intersects.includes(box.uuid)) {
          box.material.color.set(colors.highlight);
          box.material.opacity = opacities.highlight;
          box.castShadow = true;
          box.receiveShadow = true;
        } else {
          box.material.color.set(colors.normal);
          box.material.opacity = opacities.normal;
          box.castShadow = false;
          box.receiveShadow = false;
        }
      });
    },

    [boxes, raycaster, camera, mouse, colors, opacities]
  );
  useClickHandler(castColor);
  useKeyHandler(ActionCode.Space, shuffleBoxes);
  useShadow();
  useEffect(() => {
    shuffleBoxes();
  }, [shuffleBoxes]);
  useEffect(() => {
    const boxGroup = group.current;
    boxes.forEach((box) => boxGroup.add(box));
    return () => {
      boxes.forEach((box) => boxGroup.remove(box));
    };
  }, [group, boxes]);
  return (
    <>
      <directionalLight position={[5, 10, 15]} castShadow />
      <group ref={group} />
      <mesh>
        <sphereGeometry args={[r, 30, 30]} />
        <meshBasicMaterial wireframe />
      </mesh>
    </>
  );
}

function SimpleRaycaster1() {
  const { camera } = useThree();
  const [fade, setFade] = useState<Fade | null>(null);
  const [inPlane, setInPlane] = useState<boolean>(false);
  const rotatingRate = useMemo(() => 0.05, []);
  const plane = useRef<THREE.Mesh>(new THREE.Mesh());
  const ball = useRef<THREE.Mesh>(new THREE.Mesh());
  const coord = useMouseMove();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: 0xff0000,
        transparent: true,
        shininess: 100,
        side: THREE.DoubleSide,
      }),
    []
  );

  const W = useKeyDown(ArrowCode.W);
  const S = useKeyDown(ArrowCode.S);
  const A = useKeyDown(ArrowCode.A);
  const D = useKeyDown(ArrowCode.D);

  const rotatePlane = useCallback(() => {
    let rotationX = 0;
    let rotationY = 0;
    if (W) {
      if (!S) rotationX = -rotatingRate;
    } else if (S) rotationX = rotatingRate;
    if (D) {
      if (!A) rotationY = -rotatingRate;
    } else if (A) rotationY = rotatingRate;
    plane.current.rotation.x += rotationX;
    plane.current.rotation.y += rotationY;
    return !!(rotationX || rotationY);
  }, [W, S, A, D, rotatingRate]);

  const toggleBall = useCallback(
    (on: boolean) => {
      if (on === inPlane) return;
      setInPlane(on);
      if (on) setFade(Fade.In);
      else setFade(Fade.Out);
    },
    [inPlane]
  );

  const resetPlane = useCallback(() => {
    plane.current.rotation.x = Math.PI / 2;
    plane.current.rotation.y = 0;
    toggleBall(false);
  }, [plane, toggleBall]);

  useKeyHandler(CharaActionKey.R, resetPlane);

  useShadow();

  useEffect(() => {
    plane.current.rotation.set(Math.PI / 2, 0, 0);
  }, [plane]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    switch (fade) {
      case Fade.In:
        const tweenIn = new TWEEN.Tween({
          opacity: material.opacity,
          shininess: material.shininess,
        })
          .to({ opacity: 1, shininess: 100 }, 300)
          .easing(TWEEN.Easing.Quintic.Out)
          .onUpdate(onTweenUpdate)
          .onComplete(() => {
            ball.current.castShadow = true;
            setFade(null);
          })
          .start();
        timer = setInterval(() => tweenIn.update(), 20);
        break;
      case Fade.Out:
        ball.current.castShadow = false;
        const tweenOut = new TWEEN.Tween({
          opacity: material.opacity,
          shininess: material.shininess,
        })
          .to({ opacity: 0, shininess: 0 }, 300)
          .easing(TWEEN.Easing.Quintic.Out)
          .onUpdate(onTweenUpdate)
          .onComplete(() => {
            ball.current.position.set(0, 0, 0);
            setFade(Fade.In);
          })
          .start();
        timer = setInterval(() => tweenOut.update(), 20);
        break;
      default:
    }

    function onTweenUpdate(vals: { opacity: number; shininess: number }) {
      material.opacity = vals.opacity;
      material.shininess = vals.shininess;
    }

    return () => {
      clearInterval(timer);
    };
  }, [fade, material, ball]);

  useEffect(() => {
    raycaster.setFromCamera(mouse.fromArray(coord), camera);
    const intersect = raycaster.intersectObject(plane.current)[0];
    toggleBall(!!intersect);
    if (intersect) ball.current.position.set(...intersect.point.toArray());
  }, [coord, raycaster, camera, mouse, plane, ball, toggleBall]);

  useFrame(() => {
    const rotated = rotatePlane();
    if (rotated) toggleBall(false);
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 10, 15]} castShadow />
      <mesh ref={plane} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshPhongMaterial
          color={0x66ccff}
          shininess={100}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ball} material={material} castShadow>
        <sphereGeometry args={[0.2, 30, 30]} />
      </mesh>
    </>
  );
}

function SimpleGLTFAnimation() {
  function Vivi() {
    const opts = useMemo(() => {
      return {
        idleActions: [
          ViviAction.CrossArm,
          ViviAction.PickUpIdle,
          ViviAction.Sit,
        ],
        walkAction: ViviAction.Walk,
        rotateY: Math.PI,
        transition: undefined,
        castShadow: true,
        height: 2,
      };
    }, []);

    const { compass } = useCompass();

    const { scene, ref, play, move, switchPose } = useGLTFAnimation<ViviAction>(
      viviData,
      opts
    );

    const moveCb = useCallback(() => move(compass), [move, compass]);
    const pickUpCb = useCallback(() => play(ViviAction.PickUpUp), [play]);
    const pickFloorCb = useCallback(() => play(ViviAction.PickFloor), [play]);
    const pickFrontCb = useCallback(() => play(ViviAction.PickFront), [play]);

    useStateCallback(compass, moveCb);
    useKeyHandler(CharaActionKey.J, pickUpCb);
    useKeyHandler(CharaActionKey.K, pickFloorCb);
    useKeyHandler(CharaActionKey.L, pickFrontCb);
    useKeyHandler(CharaActionKey.Semicolon, switchPose);

    return <primitive ref={ref} object={scene} />;
  }

  function PurpleHeart() {
    const opts = useMemo(() => {
      return {
        idleActions: [
          PurpleHeartAction.HipHop,
          PurpleHeartAction.BellyDance,
          PurpleHeartAction.SalsaDance,
          PurpleHeartAction.RoboticDance,
        ],
        height: 2,
        castShadow: true,
        position: new THREE.Vector3(-3, 0, -3),
      };
    }, []);
    const { scene, ref, play, switchPose } =
      useGLTFAnimation<PurpleHeartAction>(purpleHeartData, opts);
    const fightCb = useCallback(() => play(PurpleHeartAction.Fight), [play]);
    const kickCb = useCallback(() => play(PurpleHeartAction.Kick), [play]);
    useKeyHandler(CharaActionKey.I, fightCb);
    useKeyHandler(CharaActionKey.O, kickCb);
    useKeyHandler(CharaActionKey.P, switchPose);
    return <primitive ref={ref} object={scene} />;
  }

  function Shiranui() {
    const { scene, ref } = useGLTFAnimation(shiranuiData, {
      idleActions: [ShiranuiAction.Idle],
      height: 2,
      castShadow: true,
      position: new THREE.Vector3(3, 0, -3),
    });
    return <primitive ref={ref} object={scene} />;
  }

  return (
    <>
      <mesh receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshPhongMaterial
          color={0x66ccff}
          shininess={100}
          side={THREE.DoubleSide}
        />
      </mesh>
      <ShadowEnabler />
      <directionalLight intensity={0.5} castShadow position={[10, 10, 10]} />
      <directionalLight intensity={0.5} castShadow position={[-10, 10, 10]} />
      <Suspense fallback={null}>
        <Vivi />
        <PurpleHeart />
        <Shiranui />
      </Suspense>
    </>
  );
}

function SimpleSaveAndLoad() {
  function Dice() {
    const [ctrlDown, setCtrlDown] = useState<boolean>(false);
    const [roll, setRoll] = useState<number>(0);
    const [storedDices, setStoredDices] = useState<THREE.Mesh[]>([]);
    const [moveX, setMoveX] = useState<ArrowCode.A | ArrowCode.D | null>(null);
    const [moveZ, setMoveZ] = useState<ArrowCode.W | ArrowCode.S | null>(null);
    const step = useMemo(() => 0.02, []);
    const face1 = useLoader(THREE.TextureLoader, "models/dice/1.jpeg");
    const face2 = useLoader(THREE.TextureLoader, "models/dice/2.jpeg");
    const face3 = useLoader(THREE.TextureLoader, "models/dice/3.jpeg");
    const face4 = useLoader(THREE.TextureLoader, "models/dice/4.jpeg");
    const face5 = useLoader(THREE.TextureLoader, "models/dice/5.jpeg");
    const face6 = useLoader(THREE.TextureLoader, "models/dice/6.jpeg");
    const loader = useMemo(() => new THREE.ObjectLoader(), []);
    const dice = useMemo(() => {
      const geometry = new THREE.BoxGeometry();
      const materials = [face1, face2, face3, face4, face5, face6].map(
        (texture) =>
          new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 100,
            side: THREE.DoubleSide,
          })
      );
      return new THREE.Mesh(geometry, materials);
    }, [face1, face2, face3, face4, face5, face6]);

    const updateJSONObjects = useCallback(() => {
      axios
        .get(diceUrl)
        .then((res) =>
          res.data.map((json: any) => {
            const dice = loader.parse(json.object);
            (dice as THREE.Mesh).geometry.groups.forEach(
              (group) => (group.materialIndex = json.roll)
            );
            return dice;
          })
        )
        .then((res) => setStoredDices(res));
    }, [loader]);

    const onSave = useCallback(() => {
      axios.post(diceUrl, { object: dice.toJSON(), roll }).then(() => {
        updateJSONObjects();
      });
    }, [dice, updateJSONObjects, roll]);

    const onClear = useCallback(() => {
      axios
        .get(diceUrl)
        .then((res) => {
          const requests = res.data.map((dat: any) =>
            axios.delete(diceUrl + `/${dat.id}`)
          );
          return axios.all(requests);
        })
        .then(() => {
          updateJSONObjects();
        })
        .catch((err) => {
          console.log("Error has occured while deleting objects: ", err);
          updateJSONObjects();
        });
    }, [updateJSONObjects]);

    function displayStoredDices() {
      return storedDices.map((dice, i) => {
        (dice.material as THREE.MeshPhongMaterial[]).forEach(
          (material) => (material.opacity = 0.8)
        );
        return <primitive key={i} object={dice} />;
      });
    }

    useEffect(() => {
      updateJSONObjects();
    }, [updateJSONObjects]);

    useEffect(() => {
      dice.geometry.groups.forEach((group) => (group.materialIndex = roll));
    }, [roll, dice]);

    useEffect(() => {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      function onKeyDown(e: KeyboardEvent) {
        e.preventDefault();

        if (ctrlDown) {
          switch (e.code) {
            case ArrowCode.S as string:
              onSave();
              break;
            case ArrowCode.D as string:
              onClear();
              break;
            default:
          }
          return;
        }

        switch (arrowMap(e.code)) {
          case CtrlCode.Left as string:
          case CtrlCode.Right as string:
            setCtrlDown(true);
            break;
          case ArrowCode.A as string:
            setMoveX(ArrowCode.A);
            break;
          case ArrowCode.D as string:
            setMoveX(ArrowCode.D);
            break;
          case ArrowCode.S as string:
            setMoveZ(ArrowCode.S);
            break;
          case ArrowCode.W as string:
            setMoveZ(ArrowCode.W);
            break;
          case ActionCode.Enter as string:
            onSave();
            break;
          case ActionCode.Space as string:
            setRoll((prevRoll) => (prevRoll + 1) % 6);
            break;
          case ActionCode.Backspace as string:
            // Nothing to do now
            break;
          default:
        }
      }

      function onKeyUp(e: KeyboardEvent) {
        e.preventDefault();
        const code = arrowMap(e.code);
        if (code === (moveX as string)) setMoveX(null);
        else if (code === (moveZ as string)) setMoveZ(null);
        else if (
          code === (CtrlCode.Right as string) ||
          e.code === (CtrlCode.Left as string)
        )
          setCtrlDown(false);
      }

      function arrowMap(code: string) {
        switch (code) {
          case ArrowCode.Up as string:
            return ArrowCode.W;
          case ArrowCode.Down as string:
            return ArrowCode.S;
          case ArrowCode.Right as string:
            return ArrowCode.D;
          case ArrowCode.Left as string:
            return ArrowCode.A;
          default:
            return code;
        }
      }

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      };
    }, [ctrlDown, onClear, onSave, moveX, moveZ]);

    useFrame(() => {
      switch (moveX) {
        case ArrowCode.A:
          dice.position.x -= step;
          break;
        case ArrowCode.D:
          dice.position.x += step;
          break;
        default:
      }

      switch (moveZ) {
        case ArrowCode.S:
          dice.position.z += step;
          break;
        case ArrowCode.W:
          dice.position.z -= step;
          break;
        default:
      }
    });

    return (
      <>
        <primitive object={dice} />
        {displayStoredDices()}
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 5, 3]} />
      <Suspense fallback={null}>
        <Dice />
      </Suspense>
    </>
  );
}

function SimpleBufferGeometrySphere() {
  // Posponing. Reference on https://threejsfundamentals.org/threejs/lessons/threejs-custom-buffergeometry.html

  return null;
}

function SimpleBufferGeometryBox() {
  const target = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, 0, 0);
    return obj;
  }, []);

  function Dice() {
    const geometry = useMemo(() => {
      const vertices = [
        // front
        { pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 0] }, // 0
        { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 0] }, // 1
        { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 1] }, // 2

        // { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 1], },
        // { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 0], },
        { pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 1] }, // 3
        // right
        { pos: [1, -1, 1], norm: [1, 0, 0], uv: [0, 0] }, // 4
        { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 0] }, // 5

        // { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 1], },
        // { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 0], },
        { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 1] }, // 6
        { pos: [1, 1, -1], norm: [1, 0, 0], uv: [1, 1] }, // 7
        // back
        { pos: [1, -1, -1], norm: [0, 0, -1], uv: [0, 0] }, // 8
        { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 0] }, // 9

        // { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 1], },
        // { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 0], },
        { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 1] }, // 10
        { pos: [-1, 1, -1], norm: [0, 0, -1], uv: [1, 1] }, // 11
        // left
        { pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 0] }, // 12
        { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 0] }, // 13

        // { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 1], },
        // { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 0], },
        { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 1] }, // 14
        { pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 1] }, // 15
        // top
        { pos: [1, 1, -1], norm: [0, 1, 0], uv: [0, 0] }, // 16
        { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 0] }, // 17

        // { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 1], },
        // { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 0], },
        { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 1] }, // 18
        { pos: [-1, 1, 1], norm: [0, 1, 0], uv: [1, 1] }, // 19
        // bottom
        { pos: [1, -1, 1], norm: [0, -1, 0], uv: [0, 0] }, // 20
        { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 0] }, // 21

        // { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 1], },
        // { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 0], },
        { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 1] }, // 22
        { pos: [-1, -1, -1], norm: [0, -1, 0], uv: [1, 1] }, // 23
      ];

      const nVertices = vertices.length;
      const nPosComps = 3;
      const nNormComps = 3;
      const nUVComps = 2;

      const pos = new Float32Array(nVertices * nPosComps);
      const norm = new Float32Array(nVertices * nNormComps);
      const uv = new Float32Array(nVertices * nUVComps);

      vertices.forEach((vertex, i) => {
        pos.set(vertex.pos, i * nPosComps);
        norm.set(vertex.norm, i * nNormComps);
        uv.set(vertex.uv, i * nUVComps);
      });

      const geo = new THREE.BufferGeometry();

      geo.setAttribute("position", new THREE.BufferAttribute(pos, nPosComps));
      geo.setAttribute("normal", new THREE.BufferAttribute(norm, nNormComps));
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, nUVComps));

      geo.setIndex([
        0,
        1,
        2,
        2,
        1,
        3, // front
        4,
        5,
        6,
        6,
        5,
        7, // right
        8,
        9,
        10,
        10,
        9,
        11, // back
        12,
        13,
        14,
        14,
        13,
        15, // left
        16,
        17,
        18,
        18,
        17,
        19, // top
        20,
        21,
        22,
        22,
        21,
        23, // bottom
      ]);

      for (let i = 0; i < 6; i++) {
        geo.addGroup(i * 6, 6, i);
      }

      return geo;
    }, []);

    const face1 = useLoader(THREE.TextureLoader, "models/dice/1.jpeg");
    const face2 = useLoader(THREE.TextureLoader, "models/dice/2.jpeg");
    const face3 = useLoader(THREE.TextureLoader, "models/dice/3.jpeg");
    const face4 = useLoader(THREE.TextureLoader, "models/dice/4.jpeg");
    const face5 = useLoader(THREE.TextureLoader, "models/dice/5.jpeg");
    const face6 = useLoader(THREE.TextureLoader, "models/dice/6.jpeg");

    const material = useMemo(
      () => [
        new THREE.MeshPhongMaterial({ shininess: 100, map: face1 }),
        new THREE.MeshPhongMaterial({ shininess: 100, map: face2 }),
        new THREE.MeshPhongMaterial({ shininess: 100, map: face3 }),
        new THREE.MeshPhongMaterial({ shininess: 100, map: face4 }),
        new THREE.MeshPhongMaterial({ shininess: 100, map: face5 }),
        new THREE.MeshPhongMaterial({ shininess: 100, map: face6 }),
      ],
      [face1, face2, face3, face4, face5, face6]
    );

    return <mesh geometry={geometry} material={material} />;
  }

  return (
    <>
      <spotLight position={[2, 3, 5]} target={target} />
      <ambientLight intensity={0.1} />
      <Suspense fallback={null}>
        <Dice />
      </Suspense>
    </>
  );
}

function SimpleShadow() {
  const spotLight = useRef<THREE.SpotLight>();
  const { gl } = useThree();
  const material = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: 0xdff913,
        shininess: 100,
        side: THREE.DoubleSide,
      }),
    []
  );

  useHelper(spotLight, THREE.SpotLightHelper);

  useEffect(() => {
    const originalShadowMapType = gl.shadowMap.type;
    gl.shadowMap.type = THREE.PCFShadowMap;
    gl.shadowMap.enabled = true;
    return () => {
      gl.shadowMap.type = originalShadowMapType;
      gl.shadowMap.enabled = SCENE_CONSTANTS.shadows;
    };
  }, [gl]);

  return (
    <>
      <spotLight
        ref={spotLight}
        castShadow
        position={[0, 7.5, 5]}
        angle={Math.PI / 4}
        penumbra={0.05}
        decay={2}
        distance={200}
      />
      <mesh castShadow receiveShadow position={[2.5, 1, 0]} material={material}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
      </mesh>
      <mesh position={[-2, 1, 0]} material={material}>
        <boxGeometry args={[2.5, 3, 2]} />
      </mesh>
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[1000, 0.5, 1000]} />
        <meshPhongMaterial color={0x693421} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

function SimpleKeyboardEvent() {
  const cubeGroup = useRef<THREE.Group>(null);
  const cubeModel = useMemo(() => {
    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const material = new THREE.MeshPhongMaterial({
      shininess: 100,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(geometry, material);
  }, []);

  useEffect(() => {
    const currentCubes = cubeGroup.current;
    if (!currentCubes) return;
    for (let i = 1; i <= 10; i++) {
      const cube = cubeModel.clone();
      cube.position.x = randomInRange(-10, 10);
      cube.position.z = randomInRange(-10, 10);
      cube.material.color = new THREE.Color(Math.random() * 0xffffff);
      currentCubes.add(cube);
    }
    return () => {
      while (currentCubes.children.length)
        currentCubes.remove(currentCubes.children[0]);
    };
  }, [cubeGroup, cubeModel]);

  return <group ref={cubeGroup} />;
}

function SimpleOBJLoader() {
  const light = useRef<THREE.DirectionalLight>(new THREE.DirectionalLight());
  const { gl } = useThree();
  const frontLightTarget = useMemo(() => {
    const target = new THREE.Object3D();
    target.position.set(0, 3, 0);
    return target;
  }, []);

  useHelper(light, THREE.DirectionalLightHelper);

  useEffect(() => {
    gl.shadowMap.enabled = true;
    return () => {
      gl.shadowMap.enabled = SCENE_CONSTANTS.shadows;
    };
  }, [gl]);

  useFrame(() => {
    const r = 10;
    const theta =
      atan(light.current.position.x, light.current.position.z) + 0.01;
    light.current.position.x = r * Math.cos(theta);
    light.current.position.z = r * Math.sin(theta);
  });

  function Faerie() {
    const maxDim = 3;
    const obj = useLoader(
      OBJLoader,
      "models/sketch/final_v01.obj",
      undefined,
      onProgress
    );
    const boundingBox = useMemo(
      () => new THREE.Box3().setFromObject(obj),
      [obj]
    );
    const allTexture = useLoader(
      THREE.TextureLoader,
      "models/sketch/texture/all.png"
    );
    const bodyTexture = useLoader(
      THREE.TextureLoader,
      "models/sketch/texture/body.png"
    );
    const headTexture = useLoader(
      THREE.TextureLoader,
      "models/sketch/texture/head.png"
    );
    const materials = useMemo(() => {
      const skinColor = 0xfff3e6;
      const faceSkinColor = 0xffce99;
      return [
        new THREE.MeshPhysicalMaterial({
          map: headTexture,
          side: THREE.DoubleSide,
        }), // hair
        null, // Hair but no provided texture fits
        new THREE.MeshPhysicalMaterial({
          map: headTexture,
          side: THREE.FrontSide,
        }), // Eyes and face skin
        new THREE.MeshPhysicalMaterial({
          color: faceSkinColor,
          map: allTexture,
          side: THREE.BackSide,
        }), // Face skin (no eyes and glasses)
        new THREE.MeshPhysicalMaterial({
          map: bodyTexture,
          side: THREE.FrontSide,
        }), // Body including cloth and skirt
        new THREE.MeshPhysicalMaterial({
          map: bodyTexture,
          side: THREE.DoubleSide,
        }), // Cloth and skirt
        new THREE.MeshPhysicalMaterial({
          color: skinColor,
          map: allTexture,
          side: THREE.BackSide,
        }), // Body excluding cloth and skirt
        new THREE.MeshPhysicalMaterial({
          map: allTexture,
          side: THREE.FrontSide,
        }), // All surroundings
      ];
    }, [allTexture, bodyTexture, headTexture]);

    function onProgress(progressEvent: ProgressEvent<EventTarget>) {
      console.log(
        "Model load progress: ",
        Math.round((progressEvent.loaded / progressEvent.total) * 100),
        "%"
      );
    }

    useEffect(() => {
      adjustSizeAndCenter();
      applyFaerieMaterials();
      updateBoundingBox();

      function adjustSizeAndCenter() {
        const bbox = new THREE.Box3().setFromObject(obj);
        const size = bbox.getSize(new THREE.Vector3());
        const maxBoundingBoxDim = Math.max(...size.toArray());
        obj.scale.multiplyScalar(maxDim / maxBoundingBoxDim);
        bbox.setFromObject(obj);
        const shift = bbox.getCenter(new THREE.Vector3());
        obj.position.sub(shift);
        obj.position.y += bbox.getSize(new THREE.Vector3()).y / 2;
      }

      function applyFaerieMaterials() {
        obj.children.forEach((obj, i) => {
          if (obj instanceof THREE.Mesh && materials[i]) {
            obj.material = materials[i];
            obj.receiveShadow = true;
            obj.castShadow = true;
          }
        });
      }

      function updateBoundingBox() {
        boundingBox.setFromObject(obj);
      }
    }, [obj, boundingBox, materials]);

    return (
      <>
        <box3Helper args={[boundingBox]} />
        <mesh>
          <primitive object={obj} dispose={null} />
        </mesh>
      </>
    );
  }

  return (
    <>
      <directionalLight ref={light} position={[0, 10, 10]} castShadow />
      <directionalLight
        position={[0, 0, 5]}
        intensity={0.4}
        target={frontLightTarget}
      />
      <ambientLight intensity={0.1} />
      <Suspense fallback={<></>}>
        <Faerie />
      </Suspense>
    </>
  );
}

/**
 * 37 = left, 38 = up, 39 = right, 40 = down, 32 = space, 13 = enter
 * @returns
 */

interface Roll {
  time: number;
  roll: number;
}

function SimpleTextureWithMaterialIndex() {
  function Dice() {
    const dice = useRef<THREE.Mesh>();
    const [roll, setRoll] = useState<Roll | null>(null);

    const face1 = useLoader(THREE.TextureLoader, "models/dice/1.jpeg");
    const face2 = useLoader(THREE.TextureLoader, "models/dice/2.jpeg");
    const face3 = useLoader(THREE.TextureLoader, "models/dice/3.jpeg");
    const face4 = useLoader(THREE.TextureLoader, "models/dice/4.jpeg");
    const face5 = useLoader(THREE.TextureLoader, "models/dice/5.jpeg");
    const face6 = useLoader(THREE.TextureLoader, "models/dice/6.jpeg");

    const materials = useMemo(
      () => [
        new THREE.MeshPhongMaterial({ map: face1 }),
        new THREE.MeshPhongMaterial({ map: face2 }),
        new THREE.MeshPhongMaterial({ map: face3 }),
        new THREE.MeshPhongMaterial({ map: face4 }),
        new THREE.MeshPhongMaterial({ map: face5 }),
        new THREE.MeshPhongMaterial({ map: face6 }),
      ],
      [face1, face2, face3, face4, face5, face6]
    );

    useEffect(() => {
      if (!dice.current) return;
      dice.current.material = materials;
      dice.current.geometry.groups.forEach(
        (group) => (group.materialIndex = 2)
      );
    }, [dice, materials]);

    useEffect(() => {
      if (!roll || !dice.current) return;
      dice.current.geometry.groups.forEach(
        (group) => (group.materialIndex = roll.roll)
      );
    }, [dice, roll]);

    useFrame(({ clock }) => {
      if (!roll) setRoll({ time: clock.elapsedTime, roll: 0 });
      else if (clock.elapsedTime - roll.time >= 0.5)
        setRoll({ time: clock.elapsedTime, roll: (roll.roll + 1) % 6 });
    });

    return (
      <mesh ref={dice}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    );
  }

  return (
    <>
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <ambientLight intensity={0.5} />
      <Suspense fallback={null}>
        <Dice />
      </Suspense>
    </>
  );
}

function SimpleTexture() {
  function Dice() {
    const face1 = useLoader(THREE.TextureLoader, "models/dice/1.jpeg");
    const face2 = useLoader(THREE.TextureLoader, "models/dice/2.jpeg");
    const face3 = useLoader(THREE.TextureLoader, "models/dice/3.jpeg");
    const face4 = useLoader(THREE.TextureLoader, "models/dice/4.jpeg");
    const face5 = useLoader(THREE.TextureLoader, "models/dice/5.jpeg");
    const face6 = useLoader(THREE.TextureLoader, "models/dice/6.jpeg");
    return (
      <mesh rotation={[Math.PI / 4, Math.PI / 4, Math.PI / 4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={face1} attachArray="material" />
        <meshStandardMaterial map={face2} attachArray="material" />
        <meshStandardMaterial map={face3} attachArray="material" />
        <meshStandardMaterial map={face4} attachArray="material" />
        <meshStandardMaterial map={face5} attachArray="material" />
        <meshStandardMaterial map={face6} attachArray="material" />
      </mesh>
    );
  }
  return (
    <>
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <Suspense fallback={null}>
        <Dice />
      </Suspense>
    </>
  );
}

function SimpleOrthographicCamera({
  setBackgroundColor,
  setShowGrid,
  isOrthographic,
  setIsOrthographic,
}: {
  setBackgroundColor: Dispatch<SetStateAction<number>>;
  setShowGrid: Dispatch<SetStateAction<boolean>>;
  isOrthographic: boolean;
  setIsOrthographic: Dispatch<SetStateAction<boolean>>;
}) {
  const r = useMemo(() => 5, []);
  const xBase = useMemo(() => -20, []);
  const yBase = useMemo(() => -20, []);
  const modelSphere = useMemo(() => {
    const geometry = new THREE.SphereGeometry(r, 30, 30);
    const material = new THREE.MeshPhongMaterial({
      color: 0x0450fb,
      shininess: 100,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(geometry, material);
  }, [r]);
  const spheres = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [theta, setTheta] = useState<number>(0);
  useEffect(
    () => () => {
      setIsOrthographic(false);
    },
    [setIsOrthographic]
  );
  useEffect(
    () => () => {
      camera.position.set(...SCENE_CONSTANTS.cameraPosition.toArray());
    },
    [camera]
  );
  useEffect(() => {
    setShowGrid(false);
    return () => {
      setShowGrid(SCENE_CONSTANTS.showGrid);
    };
  }, [setShowGrid]);
  useEffect(() => {
    setBackgroundColor(0xffffff);
    return () => {
      setBackgroundColor(SCENE_CONSTANTS.backgroundColor);
    };
  }, [setBackgroundColor]);
  useEffect(() => {
    const currentSpheres = spheres.current;
    if (!currentSpheres) return;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const sphere = modelSphere.clone();
        sphere.position.set(
          xBase + j * 2 * (r + 0.5),
          yBase + i * r,
          -2 * r * i
        );
        currentSpheres.add(sphere);
      }
    }
    return () => {
      while (currentSpheres.children.length)
        currentSpheres.remove(currentSpheres.children[0]);
    };
  }, [modelSphere, r, xBase, yBase]);
  useFrame(() => {
    const r = 100;
    camera.position.x = r * Math.cos(theta);
    camera.position.z = r * Math.sin(theta);
    const addedTheta = theta + 0.01;
    if (addedTheta >= Math.PI * 2) setIsOrthographic(!isOrthographic);
    setTheta(addedTheta % (Math.PI * 2));
  });
  return (
    <>
      <directionalLight />
      <group ref={spheres} />
    </>
  );
}

function SimplePerspectiveCamera({
  animate,
}: {
  animate?: AnimatePerspectiveCamera;
}) {
  const light = useRef<THREE.SpotLight>();
  const [fovAdd, setFovAdd] = useState<number>(0.1);
  const [theta, setTheta] = useState<number>(0);
  useHelper(light, THREE.SpotLightHelper);
  const { camera } = useThree();
  const isPerspectiveCamera = useMemo(
    () => camera instanceof THREE.PerspectiveCamera,
    [camera]
  );
  useEffect(() => {
    if (animate === AnimatePerspectiveCamera.Move) {
      camera.position.set(0, 20, 20);
    }
    return () => {
      if (isPerspectiveCamera) {
        (camera as THREE.PerspectiveCamera).fov = SCENE_CONSTANTS.fov;
        camera.updateProjectionMatrix();
      }
      camera.position.set(...SCENE_CONSTANTS.cameraPosition.toArray());
    };
  }, [camera, animate, isPerspectiveCamera]);
  useFrame(() => {
    switch (animate) {
      case AnimatePerspectiveCamera.Fov:
        if (!isPerspectiveCamera) break;
        (camera as THREE.PerspectiveCamera).fov += fovAdd;
        camera.updateProjectionMatrix();
        addBackForth(
          (camera as THREE.PerspectiveCamera).fov,
          fovAdd,
          setFovAdd,
          10,
          100
        );
        break;
      case AnimatePerspectiveCamera.Move:
        const r = 10;
        camera.position.x = r * Math.cos(theta);
        camera.position.z = r * Math.sin(theta);
        setTheta(theta + 0.001);
        break;
      default:
    }
  });
  return (
    <group>
      <spotLight ref={light} args={[0xffffff, 1]} position={[0, 5, 7.5]} />
      <mesh position={[3, 0, -1]}>
        <cylinderGeometry args={[2.5, 2.5, 10, 32]} />
        <meshPhongMaterial
          {...{ color: 0x448844, shininess: 100, side: THREE.DoubleSide }}
        />
      </mesh>
      <mesh position={[-2.5, 2.5, 1]}>
        <sphereGeometry args={[2.5, 30, 30]} />
        <meshPhongMaterial
          {...{ color: 0x693421, shininess: 100, side: THREE.DoubleSide }}
        />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[1000, 0.5, 1000]} />
        <meshPhongMaterial
          {...{ color: 0xabcdef, shininess: 100, side: THREE.DoubleSide }}
        />
      </mesh>
    </group>
  );
}

function SimpleSpotLight({
  setShowGrid,
  animation,
}: {
  setShowGrid: Dispatch<SetStateAction<boolean>>;
  animation?: AnimateSpotLight;
}) {
  const light = useRef<THREE.SpotLight>(new THREE.SpotLight());
  const [posAdd, setPosAdd] = useState<number>(0.1);
  const [distanceAdd, setDistanceAdd] = useState<number>(-0.1);
  const [angleAdd, setAngleAdd] = useState<number>(0.001);
  const [penumbraAdd, setPenumbraAdd] = useState<number>(0.01);
  const [decayAdd, setDecayAdd] = useState<number>(0.02);
  const group = useRef<THREE.Group>();
  const target = useMemo(() => new THREE.Object3D(), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: 0xdff913,
        shininess: 100,
        side: THREE.DoubleSide,
      }),
    []
  );
  useHelper(light, THREE.SpotLightHelper);
  useEffect(() => {
    setShowGrid(true);
    return () => {
      setShowGrid(SCENE_CONSTANTS.showGrid);
    };
  }, [setShowGrid]);
  useEffect(() => {
    target.position.set(0, 0, 0);
    light.current.distance = 20;
    light.current.angle = Math.PI / 20;
    light.current.penumbra = 0.05;
    light.current.decay = 2;
  }, [animation, target, light]);
  useEffect(() => {
    const currentGroup = group.current;
    if (currentGroup) {
      currentGroup.add(target);
      return () => {
        currentGroup.remove(target);
      };
    }
  }, [group, target]);
  useEffect(() => {
    light.current.target = target;
  }, [light, target]);
  useFrame(() => {
    switch (animation) {
      case AnimateSpotLight.Move:
        target.position.x += posAdd;
        addBackForth(target.position.x, posAdd, setPosAdd, -5, 5);
        break;
      case AnimateSpotLight.Distance:
        light.current.distance += distanceAdd;
        addBackForth(
          light.current.distance,
          distanceAdd,
          setDistanceAdd,
          5,
          20
        );
        break;
      case AnimateSpotLight.Angle:
        light.current.angle += angleAdd;
        addBackForth(
          light.current.angle,
          angleAdd,
          setAngleAdd,
          0,
          Math.PI / 10
        );
        break;
      case AnimateSpotLight.Penumbra:
        light.current.penumbra += penumbraAdd;
        addBackForth(light.current.penumbra, penumbraAdd, setPenumbraAdd, 0, 1);
        break;
      case AnimateSpotLight.Decay:
        light.current.decay += decayAdd;
        addBackForth(light.current.decay, decayAdd, setDecayAdd, 0, 5);
        break;
      default:
    }
  });
  return (
    <group ref={group}>
      <spotLight
        ref={light}
        args={[0xffffff, 1]}
        position={[7.5, 10, 5]}
        angle={Math.PI / 20}
        penumbra={0.05}
        decay={2}
        distance={20}
      />
      <mesh position={[2.5, 0, 0]} material={material}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
      </mesh>
      <mesh position={[2.5, 5, 1.8]} material={material}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[1000, 1, 1000]} />
        <meshPhongMaterial {...{ color: 0x693421, side: THREE.DoubleSide }} />
      </mesh>
    </group>
  );
}

function addBackForth(
  val: number,
  add: number,
  dispatch: Dispatch<SetStateAction<number>>,
  low: number,
  high: number
) {
  if (val >= high) dispatch(-Math.abs(add));
  else if (val <= low) dispatch(Math.abs(add));
}

function SimplePointLight({
  setBackgroundColor,
  ambient,
}: {
  setBackgroundColor: Dispatch<SetStateAction<number>>;
  ambient?: boolean;
}) {
  const [theta, setTheta] = useState<number>(0);
  const pointLight = useRef<THREE.PointLight>(new THREE.PointLight());
  const pointLight2 = useRef<THREE.PointLight>(new THREE.PointLight());
  useHelper(pointLight, THREE.PointLightHelper);
  useHelper(pointLight2, THREE.PointLightHelper);
  useEffect(() => {
    setBackgroundColor(0x000000);
    return () => {
      setBackgroundColor(SCENE_CONSTANTS.backgroundColor);
    };
  }, [setBackgroundColor]);
  useEffect(() => {
    const r = 6;
    const r2x = 2;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    pointLight.current.position.x = x;
    pointLight.current.position.z = z;
    pointLight2.current.position.y = x * r2x;
    pointLight2.current.position.z = z * r2x;
  }, [theta]);
  useFrame(() => setTheta((theta + 0.01) % (2 * Math.PI)));
  return (
    <group>
      <pointLight
        ref={pointLight}
        args={[0xffffff, 2, 20, 2]}
        position={[0, 2.5, 0]}
      />
      <pointLight
        ref={pointLight2}
        args={[0xffffff, 2, 20, 2]}
        position={[0, 2.5, 0]}
      />
      {ambient && <ambientLight args={[0xeeeeee, 1]} intensity={0.2} />}
      <mesh rotation={[0.6, 0.6, 0]}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshPhongMaterial
          color={0xdff913}
          shininess={100}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[10, 0, 0]} rotation={[0.6, 0.6, 0]}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshPhongMaterial
          color={0xdff913}
          shininess={100}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function SimpleDirectionalLight({
  setShowGrid,
  lookAt = false,
}: {
  setShowGrid: Dispatch<SetStateAction<boolean>>;
  lookAt?: boolean;
}) {
  const [theta, setTheta] = useState<number>(0);
  const [showHelper, setShowHelper] = useState<boolean>(true);
  const [towardsCone, setTowardsCone] = useState<boolean>(true);
  const sphere = useRef<THREE.Mesh>(new THREE.Mesh());
  const light = useRef<THREE.DirectionalLight>(new THREE.DirectionalLight());
  const plainLight = useRef<THREE.DirectionalLight>(
    new THREE.DirectionalLight()
  );
  const group = useRef<THREE.Group>(new THREE.Group());
  const boxPos = useMemo(() => new THREE.Vector3(-3, -2.5, -5), []);
  const conePos = useMemo(() => new THREE.Vector3(3.5, -2.5, 0), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: 0x0f1d89,
        side: THREE.DoubleSide,
        shininess: 100,
      }),
    []
  );
  const lookAtTween = useMemo(
    () =>
      new TWEEN.Tween(towardsCone ? boxPos.toArray() : conePos.toArray())
        .to(towardsCone ? conePos.toArray() : boxPos.toArray())
        .onUpdate((pos) => light.current.target.position.set(...pos))
        .onComplete(() => setTowardsCone(!towardsCone))
        .start(),
    [towardsCone, boxPos, conePos]
  );

  useHelper(light, THREE.DirectionalLightHelper);

  useEffect(() => {
    setShowGrid(false);
    return () => {
      setShowGrid(SCENE_CONSTANTS.showGrid);
    };
  }, [setShowGrid]);

  useEffect(() => {
    const currentGroup = group.current;
    const currentLight = light.current;
    currentGroup.add(currentLight.target);
    return () => {
      currentGroup.remove(currentLight.target);
    };
  }, [group, light]);

  useEffect(() => {
    if (light.current) {
      if (lookAt) light.current.target.position.set(...boxPos.toArray());
      else light.current.target.position.set(0, 0, 0);
    }
  }, [lookAt, light, boxPos]);

  useFrame(() => {
    if (lookAt) {
      lookAtTween.update();
    } else {
      let nextTheta = theta + 0.01;
      if (nextTheta >= 2 * Math.PI) {
        setShowHelper(!showHelper);
        nextTheta = nextTheta % (2 * Math.PI);
      }
      setTheta(nextTheta);
      updateRotation();
    }
  });

  function updateRotation() {
    const r = 5;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    if (light.current) {
      light.current.position.x = x;
      light.current.position.z = z;
    }
    if (plainLight.current) {
      plainLight.current.position.x = x;
      plainLight.current.position.z = z;
    }
    sphere.current.position.x = x;
    sphere.current.position.z = z;
  }

  return (
    <group ref={group}>
      {lookAt || showHelper ? (
        <directionalLight
          ref={light}
          args={[0xffffff]}
          position={[2.5, 2, 5]}
        />
      ) : (
        <directionalLight
          ref={plainLight}
          args={[0xffffff]}
          position={[2.5, 2, 5]}
        />
      )}
      <mesh ref={sphere} position={[2.5, 2, 5]}>
        <sphereGeometry args={[0.5, 30, 30]} />
        <meshBasicMaterial color={0xffd700} />
      </mesh>
      <mesh material={material} position={boxPos}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
      </mesh>
      <mesh material={material} position={[3.5, -2.5, 0]}>
        <coneGeometry args={[1.5, 2, 20, 1, true]} />
      </mesh>
      <mesh position={[0, -50, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[500, 500, 50, 50]} />
        <meshPhongMaterial
          side={THREE.DoubleSide}
          color={0x693421}
          shininess={100}
        />
      </mesh>
    </group>
  );
}

function SimpleHemisphereLight() {
  const startTop = 0xffffff;
  const endTop = 0x00ff00;
  const startBottom = 0x000000;
  const endBottom = 0x0000ff;
  const light = useRef<THREE.HemisphereLight>(new THREE.HemisphereLight());
  const [colorForward, setColorForward] = useState<boolean>(true);
  const colorTween = useMemo(
    () =>
      new TWEEN.Tween([
        hexToRgb(colorForward ? startTop : endTop),
        hexToRgb(colorForward ? startBottom : endBottom),
      ])
        .to(
          [
            hexToRgb(colorForward ? endTop : startTop),
            hexToRgb(colorForward ? endBottom : startBottom),
          ],
          2000
        )
        .onComplete(() => setColorForward(!colorForward))
        .onUpdate((rgbs) => {
          light.current.color.set(rgbToHex(rgbs[0].r, rgbs[0].g, rgbs[0].b));
          light.current.groundColor.set(
            rgbToHex(rgbs[1].r, rgbs[1].g, rgbs[1].b)
          );
        })
        .start(),
    [colorForward]
  );
  useFrame(() => colorTween.update());
  return (
    <group>
      <hemisphereLight
        ref={light}
        args={[startTop, startBottom]}
        intensity={0.7}
      />
      <mesh position={[2.5, 0, 0]}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshPhongMaterial
          side={THREE.DoubleSide}
          color={0xdff913}
          shininess={100}
        />
      </mesh>
      <mesh position={[-2.5, 2.5, -2.5]}>
        <sphereGeometry args={[2.5, 30, 30]} />
        <meshPhongMaterial
          side={THREE.DoubleSide}
          color={0x55cdaa}
          shininess={100}
        />
      </mesh>
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[2000, 1, 2000]} />
        <meshPhongMaterial side={THREE.DoubleSide} color={0x693421} />
      </mesh>
    </group>
  );
}

function SimpleAmbientLight() {
  function AnimatedAmbientLight() {
    const startColor = 0xffffff;
    const endColor = 0x00ff00;
    const [colorForward, setColorForward] = useState<boolean>(true);
    const [intensityAdd, setIntensityAdd] = useState<number>(0.08);
    const light = useRef<THREE.AmbientLight>(new THREE.AmbientLight());
    const colorTween = useMemo(
      () =>
        new TWEEN.Tween(hexToRgb(colorForward ? startColor : endColor))
          .to(hexToRgb(colorForward ? endColor : startColor), 10000)
          .onUpdate(({ r, g, b }) =>
            light.current.color.setHex(rgbToHex(r, g, b))
          )
          .onComplete(() => setColorForward(!colorForward))
          .start(),
      [colorForward]
    );
    useFrame(() => {
      light.current.intensity += intensityAdd;
      if (light.current.intensity >= 8)
        setIntensityAdd(-Math.abs(intensityAdd));
      else if (light.current.intensity <= 1)
        setIntensityAdd(Math.abs(intensityAdd));
      colorTween.update();
    });
    return <ambientLight ref={light} />;
  }

  return (
    <group>
      <AnimatedAmbientLight />
      <mesh position={[-3, -2.5, -3]}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshPhongMaterial
          side={THREE.DoubleSide}
          color={0x0f1d89}
          shininess={100}
        />
      </mesh>
      <mesh position={[3.5, -2.5, 0]}>
        <coneGeometry args={[1.5, 2, 20, 1, true]} />
        <meshPhongMaterial
          side={THREE.DoubleSide}
          color={0x0f1d89}
          shininess={100}
        />
      </mesh>
      <mesh position={[0, -100, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[500, 500, 25, 25]} />
        <meshPhongMaterial
          side={THREE.DoubleSide}
          color={0x693421}
          shininess={100}
        />
      </mesh>
    </group>
  );
}

function SimpleLightSensitiveMaterial({
  type,
}: {
  type: LightSensitiveMaterial;
}) {
  const box = useRef<THREE.Mesh>(new THREE.Mesh());
  const sphere = useRef<THREE.Mesh>(new THREE.Mesh());
  const cone = useRef<THREE.Mesh>(new THREE.Mesh());
  const [add, setAdd] = useState<number>(0);
  const material = useMemo(() => {
    switch (type) {
      case LightSensitiveMaterial.Lambert:
        return new THREE.MeshLambertMaterial({
          side: THREE.DoubleSide,
          color: 0x7fc5f9,
          emissive: 0x25673d,
          emissiveIntensity: 0.5,
        });
      case LightSensitiveMaterial.Phong:
        return new THREE.MeshPhongMaterial({
          side: THREE.DoubleSide,
          color: 0x7fc5f9,
          emissive: 0x25673d,
          emissiveIntensity: 0.5,
          shininess: 100,
          specular: 0x9d0a00,
        });
      case LightSensitiveMaterial.Standard:
      default:
        return new THREE.MeshStandardMaterial({
          side: THREE.DoubleSide,
          color: 0x7fc5f9,
          emissive: 0x25673d,
          emissiveIntensity: 0,
          metalness: 1,
          roughness: 0.2,
        });
    }
  }, [type]);
  useEffect(() => {
    setAdd(type === LightSensitiveMaterial.Phong ? 0.6 : 0.006);
  }, [type]);
  useFrame(() => {
    [box, sphere, cone].forEach((mesh) => (mesh.current.rotation.x += 0.0085));
    switch (type) {
      case LightSensitiveMaterial.Lambert:
        material.emissiveIntensity += add;
        if (material.emissiveIntensity >= 1) setAdd(-Math.abs(add));
        else if (material.emissiveIntensity <= 0) setAdd(Math.abs(add));
        break;
      case LightSensitiveMaterial.Phong:
        (material as THREE.MeshPhongMaterial).shininess += add;
        if ((material as THREE.MeshPhongMaterial).shininess >= 100)
          setAdd(-Math.abs(add));
        else if ((material as THREE.MeshPhongMaterial).shininess <= 0)
          setAdd(Math.abs(add));
        break;
      case LightSensitiveMaterial.Standard:
        (material as THREE.MeshStandardMaterial).roughness += add;
        if ((material as THREE.MeshStandardMaterial).roughness >= 1)
          setAdd(-Math.abs(add));
        else if ((material as THREE.MeshStandardMaterial).roughness <= 0)
          setAdd(Math.abs(add));
        break;
      default:
    }
  });
  return (
    <group>
      <directionalLight args={[0xffffff]} />
      <mesh ref={box} position={[-3, 0, 0]} material={material}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
      </mesh>
      <mesh ref={sphere} position={[0, 0, 0]} material={material}>
        <sphereGeometry args={[1.5, 15, 15]} />
      </mesh>
      <mesh ref={cone} position={[3.5, 0, 0]} material={material}>
        <coneGeometry args={[1.5, 2, 10, 1, true]} />
      </mesh>
    </group>
  );
}

function SimplePointsMaterial() {
  const randInt = (from: number, to: number) =>
    Math.random() * (to - from) + from;
  const points = useRef<THREE.Points>(new THREE.Points());
  const geometry = useMemo(() => {
    const nPoints = 5000;
    let vertices = [];
    for (let i = 0; i < nPoints * 3; i++) vertices.push(randInt(-25, 25));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.computeBoundingSphere();
    return geometry;
  }, []);
  useEffect(() => {
    points.current.geometry = geometry;
  }, [points, geometry]);
  useFrame(() => (points.current.rotation.y += 0.001));
  return (
    <points ref={points}>
      <pointsMaterial color={0xffffff} size={0.5} />
    </points>
  );
}

function SimpleDashedLineMaterial() {
  const ref = useRef<THREE.Line>(new THREE.Line());
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
  useFrame(() => (ref.current.rotation.z += 0.005));
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

function SimpleLineMaterial() {
  const cylinderGeo = new THREE.CylinderGeometry(1.5, 1, 2);
  const cylinderPos = new THREE.Vector3(-2.5, 0, -5);

  const sphereGeo = new THREE.SphereGeometry(1.5, 15, 15);
  const spherePos = new THREE.Vector3(2.5, 0, 0);

  function LineObject({
    geo,
    pos,
  }: {
    geo: THREE.CylinderGeometry | THREE.SphereGeometry;
    pos: THREE.Vector3;
  }) {
    const line = useRef<THREE.Line>(new THREE.Line());
    useFrame(() => (line.current.rotation.y += 0.01));
    return (
      <line_ ref={line} geometry={geo} position={pos}>
        <lineBasicMaterial color={"blue"} linewidth={1} />
      </line_>
    );
  }

  return (
    <group>
      <LineObject geo={cylinderGeo} pos={cylinderPos} />
      <LineObject geo={sphereGeo} pos={spherePos} />
    </group>
  );
}

function SimpleDepthMaterial({
  setBackgroundColor,
}: {
  setBackgroundColor: Dispatch<SetStateAction<number>>;
}) {
  const material = new THREE.MeshDepthMaterial();

  useEffect(() => {
    setBackgroundColor(0xffffff);
    return () => setBackgroundColor(SCENE_CONSTANTS.backgroundColor);
  }, [setBackgroundColor]);

  function SimpleBoxDepth() {
    const [add, setAdd] = useState<number>(0.03);
    const ref = useRef<THREE.Mesh>(new THREE.Mesh());
    useEffect(() => {
      ref.current.material = material;
    }, [ref]);
    useFrame(() => {
      if (ref.current.position.z > 3) setAdd(-Math.abs(add));
      else if (ref.current.position.z < -8) setAdd(Math.abs(add));
      ref.current.position.z += add;
    });
    return (
      <mesh ref={ref} position={[-2.5, 0, -5]}>
        <boxGeometry args={[1.5, 1, 2]} />
      </mesh>
    );
  }

  function SimpleSphereDepth() {
    const [add, setAdd] = useState<number>(-0.03);
    const ref = useRef<THREE.Mesh>(new THREE.Mesh());
    useEffect(() => {
      ref.current.material = material;
    }, [ref]);
    useFrame(() => {
      if (ref.current.position.z > 3) setAdd(-Math.abs(add));
      else if (ref.current.position.z < -8) setAdd(Math.abs(add));
      ref.current.position.z += add;
    });
    return (
      <mesh ref={ref} position={[2.5, 0, 0]}>
        <sphereGeometry args={[1.5, 30, 30]} />
      </mesh>
    );
  }

  return (
    <group>
      <SimpleBoxDepth />
      <SimpleSphereDepth />
    </group>
  );
}

function SimpleNormal({ geometry }: { geometry?: Geometry }) {
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh());
  useFrame(() => (mesh.current.rotation.x += 0.01));
  useEffect(() => {
    if (mesh.current) {
      mesh.current.rotation.x = 0;
      const vNormals = new VertexNormalsHelper(mesh.current, 0.3, 0xbabbbb);
      while (mesh.current.children.length)
        mesh.current.remove(mesh.current.children[0]);
      mesh.current.add(vNormals);
      const wireframe = new THREE.WireframeGeometry(mesh.current.geometry);
      const frame = new THREE.LineSegments(wireframe);
      mesh.current.add(frame);
    }
  }, [mesh, geometry]);
  function getGeo() {
    switch (geometry) {
      case Geometry.Sphere:
        return <sphereGeometry args={[1, 10, 10]} />;
      case Geometry.Torus:
        return <torusGeometry args={[1, 0.3, 10, 12]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }
  return (
    <mesh ref={mesh}>
      {getGeo()}
      <meshNormalMaterial />
    </mesh>
  );
}

function SimpleText() {
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh());
  const loader = new THREE.FontLoader();
  const font = loader.parse(Shelter);
  const opts: THREE.TextGeometryParameters = {
    font,
    size: 1,
    height: 0.1,
  };
  useEffect(() => {
    mesh.current.position.x = -1;
  }, [mesh]);
  useFrame(() => (mesh.current.rotation.y += 0.006));
  return (
    <mesh ref={mesh}>
      <textGeometry args={["Hello\nWorld", opts]} />
      <meshBasicMaterial color={0x034b59} />
    </mesh>
  );
}

function SimpleCustomGeo() {
  const v0Limit = 3;
  const [add, setAdd] = useState<number>(0.05);
  const [v0Comp, setV0Comp] = useState<number>(0);
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh());
  const geometry = useRef<THREE.BufferGeometry>(null);
  useEffect(() => {
    if (geometry.current) {
      const v0 = [1.5, v0Comp, 0];
      const v1 = [0, 2.5, 0];
      const v2 = [0, 0, 1];
      const v3 = [0.5, 1, -1];
      const vertices = new Float32Array([
        ...v0,
        ...v1,
        ...v2,
        ...v1,
        ...v2,
        ...v3,
        ...v0,
        ...v2,
        ...v3,
      ]);
      geometry.current.setAttribute(
        "position",
        new THREE.BufferAttribute(vertices, 3)
      );
    }
  }, [geometry, v0Comp]);
  useFrame(() => {
    mesh.current.rotation.y += 0.01;
    setV0Comp((oldV0Compt) => {
      if (oldV0Compt > v0Limit) setAdd(-Math.abs(add));
      else if (oldV0Compt < -v0Limit) setAdd(Math.abs(add));
      return oldV0Compt + add;
    });
  });
  return (
    <mesh ref={mesh}>
      <bufferGeometry ref={geometry} />
      <meshBasicMaterial color={0xffffff} side={THREE.DoubleSide} wireframe />
    </mesh>
  );
}

function SimpleTorus() {
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh());
  useFrame(() => (mesh.current.rotation.y += 0.01));
  return (
    <mesh ref={mesh}>
      <torusGeometry args={[1, 0.5, 10, 30, Math.PI]} />
      <meshBasicMaterial color={0xffffff} wireframe />
    </mesh>
  );
}

function SimpleSphere() {
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh());
  useFrame(() => {
    mesh.current.rotation.y += 0.01;
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.5, 10, 10, 0, Math.PI, 0, Math.PI / 2]} />
      <meshBasicMaterial color={0x00a1cb} wireframe />
    </mesh>
  );
}

function SimpleAnimatedCube() {
  let ADD = 0.05;
  const mesh = useRef<THREE.Mesh>(new THREE.Mesh());
  const material = useRef<THREE.MeshBasicMaterial>(
    new THREE.MeshBasicMaterial()
  );
  useFrame(() => {
    mesh.current.position.x += ADD;
    if (mesh.current.position.x >= 2 || mesh.current.position.x <= -2) {
      ADD *= -1;
      material.current.color.setHex(Math.random() * 0xffffff);
    }
  });
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial ref={material} color={0x00a1cb} />
    </mesh>
  );
}

function SimpleScene({
  children,
  showGrid,
  backgroundColor,
  isOrthographic,
}: {
  children?: React.ReactChild | React.ReactChild[] | null;
  showGrid: boolean;
  backgroundColor: number;
  isOrthographic: boolean;
}) {
  const perspectiveCamera = useRef<THREE.PerspectiveCamera>();
  const gridProperties = { size: 10, divisions: 50 };
  useEffect(() => {
    if (perspectiveCamera.current) {
      perspectiveCamera.current.lookAt(SCENE_CONSTANTS.cameraLookAt);
    }
  }, [perspectiveCamera]);
  return (
    <div
      style={{
        width: SCENE_CONSTANTS.width,
        height: SCENE_CONSTANTS.height,
        position: "absolute",
        top: SCENE_CONSTANTS.top,
        left: SCENE_CONSTANTS.left,
      }}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas shadows={SCENE_CONSTANTS.shadows}>
          <PerspectiveCamera
            ref={perspectiveCamera}
            args={[
              SCENE_CONSTANTS.fov,
              SCENE_CONSTANTS.width / SCENE_CONSTANTS.height,
              1,
              1000,
            ]}
            position={SCENE_CONSTANTS.cameraPosition.toArray()}
            makeDefault={!isOrthographic}
          />
          <OrthographicCamera
            args={[-300, 300, 400, -400, 1, 1000]}
            zoom={5}
            makeDefault={isOrthographic}
          />
          <CameraControls />
          {showGrid && (
            <gridHelper
              args={[gridProperties.size, gridProperties.divisions]}
            />
          )}
          <color attach="background" args={[backgroundColor]} />
          {children}
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <p>
        Suggestion: Select different page then try again? Maybe other pages are
        fine
      </p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

type IncludeDummy<T> = T | Dummy;

class Dummy {
  public update() {}
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
}
