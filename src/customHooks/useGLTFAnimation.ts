import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { Compass, ActionOpts } from "../types";
import { useFrame } from "@react-three/fiber";
import { mapCompassRotation, mapCompassVector3, adjustHeight } from "../utils";
import { usePrevious } from "./index";
import TWEEN from "@tweenjs/tween.js";

interface GTLFAnimationOption<Action> {
  idleActions?: Action[];
  walkAction?: Action;
  castShadow?: boolean;
  receiveShadow?: boolean;
  unitsPerSecond?: number;
  rotateY?: number;
  transition?: number;
  height?: number;
  position?: THREE.Vector3;
}

type ActionAnimation<Action extends string> = Record<
  Action,
  THREE.AnimationAction | null
>;

type CompassMap = Record<
  Compass,
  { rotationY: number; velocity: THREE.Vector3 }
>;

export function useGLTFAnimation<Action extends string>(
  { path, actions: actionOpts }: { path: string; actions: ActionOpts<Action> },
  opts: GTLFAnimationOption<Action> = {}
) {
  const ref = useRef<THREE.Object3D>(new THREE.Object3D());
  const { scene, animations } = useGLTF(path);
  const animationControl = useAnimations(animations, ref);
  const actions = animationControl.actions as ActionAnimation<Action>;
  const [action, setAction] = useState<Action | null>(null);
  const previousAction = usePrevious<Action | null>(action);
  const [compass, setCompass] = useState<Compass | null>(null);
  const [rotatingTo, setRotatingTo] = useState<number | null>(null);
  const [idleAction, setIdleAction] = useState<Action | null>(
    (opts.idleActions && opts.idleActions[0]) || null
  );
  const [idleTimer, setIdleTimer] = useState<ReturnType<typeof setTimeout>>(
    setTimeout(() => {}, 0)
  );
  const startingY = useMemo(() => opts.rotateY || 0, [opts.rotateY]);
  const transition = useMemo(() => opts.transition || 0.5, [opts.transition]);
  const walkAction = useMemo(() => opts.walkAction || null, [opts.walkAction]);
  const compassMap = useMemo(
    () =>
      Object.fromEntries(
        Object.values(Compass).map((dir) => [
          dir,
          {
            rotationY: mapCompassRotation(dir),
            velocity: mapCompassVector3(dir).multiplyScalar(
              opts.unitsPerSecond || 1
            ),
          },
        ])
      ) as CompassMap,
    [opts.unitsPerSecond]
  );

  // Set up

  useEffect(() => {
    ref.current.rotation.y = startingY;
  }, [ref, startingY]);

  useEffect(() => {
    scene.traverse((child) => {
      child.castShadow = !!opts.castShadow;
      child.receiveShadow = !!opts.receiveShadow;
    });
  }, [scene, opts.castShadow, opts.receiveShadow]);

  useEffect(() => {
    if (opts.idleActions) setAction(opts.idleActions[0] || null);
  }, [opts.idleActions]);

  useEffect(() => {
    if (opts.height) adjustHeight(ref.current, opts.height);
  }, [ref, opts.height]);

  useEffect(() => {
    (Object.keys(actionOpts) as Action[]).forEach((action) => {
      const opts = actionOpts[action];
      const animationAction = actions[action];
      if (!animationAction) return;
      if (opts.repeat) animationAction.setLoop(THREE.LoopPingPong, Infinity);
      else {
        animationAction.setLoop(THREE.LoopOnce, 0);
        animationAction.clampWhenFinished = true;
      }
    });
  }, [actionOpts, actions]);

  useEffect(() => {
    if (opts.position) ref.current.position.set(...opts.position.toArray());
  }, [opts.position]);

  // Rotate character

  useEffect(() => {
    if (compass) setRotatingTo(compassMap[compass].rotationY + startingY);
  }, [compass, compassMap, startingY]);

  const tween = useMemo(() => {
    if (rotatingTo === null) return null;
    const twoPi = 2 * Math.PI;
    const rate = 0.008;
    const moddedStart = ref.current.rotation.y % twoPi;
    const moddedEnd = rotatingTo % twoPi;
    const rotation =
      moddedEnd >= moddedStart
        ? moddedEnd - moddedStart
        : twoPi - moddedStart + moddedEnd;
    let to = moddedStart + rotation;
    if (rotation > Math.PI) to -= twoPi;
    const time = Math.abs(to - moddedStart) / rate;
    return new TWEEN.Tween({ y: ref.current.rotation.y })
      .to({ y: to }, time)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate((rotation) => {
        ref.current.rotation.y = rotation.y;
      })
      .onComplete(() => {
        ref.current.rotation.y = rotatingTo % twoPi;
        setRotatingTo(null);
      })
      .start();
  }, [rotatingTo, ref]);

  // Animate character

  useEffect(() => {
    if (action === previousAction) return;
    clearTimeout(idleTimer);
    if (previousAction) actions[previousAction]?.fadeOut(transition);
    const animationAction = action && actions[action];
    if (animationAction) {
      animationAction.reset().fadeIn(transition).play();
      if (!actionOpts[action as Action].repeat) {
        const fadeOutPoint =
          (animationAction.getClip().duration - transition) * 1000;
        if (fadeOutPoint > 0) {
          const timer = setTimeout(() => setAction(idleAction), fadeOutPoint);
          setIdleTimer(timer);
        } else setAction(idleAction);
      }
    }
  }, [
    action,
    previousAction,
    actions,
    transition,
    actionOpts,
    idleAction,
    idleTimer,
  ]);

  // User controls

  const play = useCallback(
    (action: Action) => {
      setAction(action);
      if (compass && action !== walkAction) setCompass(null);
    },
    [compass, walkAction]
  );

  const stop = useCallback(() => {
    setAction(idleAction);
  }, [idleAction]);

  const move = useCallback(
    (compass: Compass | null) => {
      setAction(compass ? walkAction : idleAction);
      setCompass(compass);
    },
    [walkAction, idleAction]
  );

  const pose = useCallback(
    (action_: Action | null) => {
      if (action === idleAction) setAction(action_);
      setIdleAction(action_);
    },
    [action, idleAction]
  );

  const switchPose = useCallback(() => {
    if (!opts.idleActions || !opts.idleActions.length) return;
    const index = opts.idleActions.findIndex((action) => action === idleAction);
    if (index === undefined) pose(opts.idleActions[0]);
    else pose(opts.idleActions[(index + 1) % opts.idleActions.length]);
  }, [idleAction, opts.idleActions, pose]);

  // World space animation

  useFrame((_, delta) => {
    moveRef(delta);
    if (tween) tween.update();
  });

  const getDisplacement = useCallback(
    (interval: number) =>
      compass && compassMap[compass].velocity.clone().multiplyScalar(interval),
    [compass, compassMap]
  );

  const moveRef = useCallback(
    (interval: number) => {
      const displacement = getDisplacement(interval);
      if (displacement) ref.current.position.add(displacement);
    },
    [ref, getDisplacement]
  );

  return { scene, ref, play, stop, move, pose, switchPose };
}
