import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setOrbitControlEnabled } from "../reducers";
import { TransformControl } from "../utils";
import {
  useKeyHandlerConditionally,
  usePointerMoveConditionally,
  useKeyDownConditionally,
  usePointerDownConditionally,
  usePointerUpConditionally,
  useMouseWheelConditionally,
} from "./index";
import { GizmoMode } from "../types";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ArrowCode } from "../types";

const hotkeys = {
  alignXYZ: "KeyK",
  alignToTarget: "KeyL",
  modeChange: "Enter",
};

export function useGizmoControl() {
  const { camera } = useThree();
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [mode, setMode] = useState<GizmoMode>(GizmoMode.Scale);
  const euler = useMemo(() => new THREE.Euler(), []);
  const vector = useMemo(() => new THREE.Vector3(), []);
  const control = useMemo(() => {
    const control = new TransformControl(camera);
    control.build().then(() => setLoaded(true));
    return control;
  }, [camera]);

  const onMouseDown = useCallback(
    (coord: [number, number]) => {
      control.onMouseDown(coord);
      if (control.isTransforming) dispatch(setOrbitControlEnabled(false));
    },
    [control, dispatch]
  );

  const onMouseUp = useCallback(
    (coord: [number, number]) => {
      if (!control.isTransforming) return;
      control.onMouseUp(coord);
      dispatch(setOrbitControlEnabled(true));
    },
    [control, dispatch]
  );

  const mouseMoveHandler = useCallback(
    (mouse: [number, number]) => control.onMouseMove(mouse),
    [control]
  );

  const updateScaleFactor = useCallback(() => {
    const scaleFactor = 8;
    const scale =
      vector.subVectors(camera.position, control.scene.position).length() /
      scaleFactor;
    control.setScaleFactor(scale);
  }, [vector, control, camera]);

  const setTarget = useCallback(
    (object: THREE.Object3D | null) =>
      object ? control.setTarget(object) : control.unsetTarget(),
    [control]
  );

  const alignXYZ = useCallback(() => {
    control.rotateToAlignXYZ();
  }, [control]);

  const alignToTarget = useCallback(() => {
    control.rotateByTarget();
  }, [control]);

  const changeMode = useCallback(() => {
    const modeList = [GizmoMode.Translate, GizmoMode.Rotate, GizmoMode.Scale];
    setMode(
      modeList[
        (modeList.findIndex((item) => item === mode) + 1) % modeList.length
      ]
    );
  }, [mode]);

  useEffect(() => {
    control.changeMode(mode);
  }, [mode, control]);

  useEffect(() => {
    updateScaleFactor();
  }, [updateScaleFactor]);

  useMouseWheelConditionally(updateScaleFactor, loaded);
  usePointerDownConditionally(onMouseDown, loaded);
  usePointerUpConditionally(onMouseUp, loaded);
  usePointerMoveConditionally(mouseMoveHandler, loaded);
  useKeyHandlerConditionally(hotkeys.modeChange, changeMode, loaded);
  useKeyHandlerConditionally(hotkeys.alignXYZ, alignXYZ, loaded);
  useKeyHandlerConditionally(hotkeys.alignToTarget, alignToTarget, loaded);

  const W = useKeyDownConditionally(ArrowCode.W, loaded);
  const A = useKeyDownConditionally(ArrowCode.A, loaded);
  const S = useKeyDownConditionally(ArrowCode.S, loaded);
  const D = useKeyDownConditionally(ArrowCode.D, loaded);
  const E = useKeyDownConditionally(ArrowCode.E, loaded);
  const Q = useKeyDownConditionally(ArrowCode.Q, loaded);

  useFrame(() => {
    if (D && !A) {
      control.getRotation(euler);
      euler.y += 0.05;
      control.setRotation(euler);
    } else if (A) {
      control.getRotation(euler);
      euler.y -= 0.05;
      control.setRotation(euler);
    }

    if (W && !S) {
      control.getRotation(euler);
      euler.x -= 0.05;
      control.setRotation(euler);
    } else if (S) {
      control.getRotation(euler);
      euler.x += 0.05;
      control.setRotation(euler);
    }

    if (Q && !E) {
      control.getRotation(euler);
      euler.z -= 0.05;
      control.setRotation(euler);
    } else if (E) {
      control.getRotation(euler);
      euler.z += 0.05;
      control.setRotation(euler);
    }
  });

  return { setTarget, scene: control.scene, uuid: control.targetUuid };
}
