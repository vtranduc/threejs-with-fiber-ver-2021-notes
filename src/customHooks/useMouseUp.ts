import { useEffect } from "react";
import { getSceneMouseCoord } from "../utils";

export function useMouseUp(onMouseUp: (coord: [number, number]) => void) {
  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp, false);
    function handleMouseUp(e: MouseEvent) {
      onMouseUp(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("mouseup", handleMouseUp, false);
    };
  }, [onMouseUp]);
}

export function useMouseUpConditionally(
  onMouseUp: (coord: [number, number]) => void,
  ready: boolean
) {
  useEffect(() => {
    if (!ready) return;
    window.addEventListener("mouseup", handleMouseUp, false);
    function handleMouseUp(e: MouseEvent) {
      onMouseUp(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("mouseup", handleMouseUp, false);
    };
  }, [onMouseUp, ready]);
}
