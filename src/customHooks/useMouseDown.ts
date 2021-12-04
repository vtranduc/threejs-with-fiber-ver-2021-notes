import { useEffect } from "react";
import { getSceneMouseCoord } from "../utils";

export function useMouseDown(onMouseDown: (coord: [number, number]) => void) {
  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown, false);
    function handleMouseDown(e: MouseEvent) {
      onMouseDown(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("mousedown", handleMouseDown, false);
    };
  }, [onMouseDown]);
}

export function useMouseDownConditionally(
  onMouseDown: (coord: [number, number]) => void,
  ready: boolean
) {
  useEffect(() => {
    if (!ready) return;
    window.addEventListener("mousedown", handleMouseDown, false);
    function handleMouseDown(e: MouseEvent) {
      onMouseDown(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("mousedown", handleMouseDown, false);
    };
  }, [onMouseDown, ready]);
}
