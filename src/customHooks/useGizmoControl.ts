import { useEffect, useMemo, useState, useCallback } from "react";
import { TransformControl } from "../utils";
import {
  useClickHandlerConditionally,
  useKeyHandlerConditionally,
  useMouseMove,
  useMouseMoveHandlerConditionally,
  useKeyDownConditionally,
  useMouseDownConditionally,
  useMouseUpConditionally,
} from "./index";
import { GizmoMode } from "../types";
import {
  Canvas,
  useFrame,
  extend,
  useThree,
  ReactThreeFiber,
  useLoader,
} from "@react-three/fiber";
import * as THREE from "three";
import { ArrowCode, Compass } from "../types";

export function useGizmoControl(
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
) {
  const [loaded, setLoaded] = useState<boolean>(false);

  const [mode, setMode] = useState<GizmoMode>(GizmoMode.Rotate);

  const control = useMemo(() => {
    const control = new TransformControl(camera);
    control.build().then(() => setLoaded(true));
    return control;
  }, [camera]);

  const onMouseDown = useCallback(
    (coord: [number, number]) => {
      // console.log("MOUSE DOWN!");
      control.onMouseDown(coord);
    },
    [control]
  );

  const onMouseUp = useCallback(
    (coord: [number, number]) => {
      control.onMouseUp(coord);
    },
    [control]
  );

  const mouseMoveHandler = useCallback(
    (mouse: [number, number]) => {
      control.onMouseMove(mouse);
    },
    [control]
  );

  const changeMode = useCallback(() => {
    const modeList = [GizmoMode.Translate, GizmoMode.Rotate, GizmoMode.Scale];
    setMode(
      modeList[
        (modeList.findIndex((item) => item === mode) + 1) % modeList.length
      ]
    );
  }, [mode]);

  useMouseDownConditionally(onMouseDown, loaded);
  useMouseUpConditionally(onMouseUp, loaded);
  useMouseMoveHandlerConditionally(mouseMoveHandler, loaded);
  useKeyHandlerConditionally("Enter", changeMode, loaded);

  useEffect(() => {
    control.changeMode(mode);
  }, [mode, control]);

  const euler = useMemo(() => new THREE.Euler(), []);

  const W = useKeyDownConditionally(ArrowCode.W, loaded);
  const A = useKeyDownConditionally(ArrowCode.A, loaded);
  const S = useKeyDownConditionally(ArrowCode.S, loaded);
  const D = useKeyDownConditionally(ArrowCode.D, loaded);

  useFrame(() => {
    if (D && !A) {
      euler.copy(control.controlRotation);
      euler.y += 0.05;
      control.setRotation(euler);
    } else if (A) {
      euler.copy(control.controlRotation);
      euler.y -= 0.05;
      control.setRotation(euler);
    }

    if (W && !S) {
      euler.copy(control.controlRotation);
      euler.x -= 0.05;
      control.setRotation(euler);
    } else if (S) {
      euler.copy(control.controlRotation);
      euler.x += 0.05;
      control.setRotation(euler);
    }
  });

  return { control };
}
