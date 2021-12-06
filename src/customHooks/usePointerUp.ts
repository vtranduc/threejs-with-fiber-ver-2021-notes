import { useEffect } from "react";
import { getSceneMouseCoord } from "../utils";

export function usePointerUp(onPointerUp: (coord: [number, number]) => void) {
  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp, false);
    function handlePointerUp(e: MouseEvent) {
      onPointerUp(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("pointerup", handlePointerUp, false);
    };
  }, [onPointerUp]);
}

export function usePointerUpConditionally(
  onPointerUp: (coord: [number, number]) => void,
  ready: boolean
) {
  useEffect(() => {
    if (!ready) return;
    window.addEventListener("pointerup", handlePointerUp, false);
    function handlePointerUp(e: MouseEvent) {
      onPointerUp(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("pointerup", handlePointerUp, false);
    };
  }, [onPointerUp, ready]);
}
