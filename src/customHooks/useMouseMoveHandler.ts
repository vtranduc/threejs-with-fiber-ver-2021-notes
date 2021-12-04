import { useEffect } from "react";
import { getSceneMouseCoord } from "../utils";

export function useMouseMoveHandler(
  callback: (mouse: [number, number]) => void
) {
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove, false);
    function onMouseMove(e: MouseEvent) {
      callback(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove, false);
    };
  }, [callback]);
}

export function useMouseMoveHandlerConditionally(
  callback: (mouse: [number, number]) => void,
  ready: boolean
) {
  useEffect(() => {
    if (!ready) return;
    window.addEventListener("mousemove", onMouseMove, false);
    function onMouseMove(e: MouseEvent) {
      callback(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove, false);
    };
  }, [callback, ready]);
}
