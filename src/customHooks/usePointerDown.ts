import { useEffect } from "react";
import { getSceneMouseCoord } from "../utils";

export function usePointerDown(
  onPointerDown: (coord: [number, number]) => void
) {
  useEffect(() => {
    window.addEventListener("pointerdown", handlePointerDown, false);
    function handlePointerDown(e: MouseEvent) {
      onPointerDown(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, false);
    };
  }, [onPointerDown]);
}

export function usePointerDownConditionally(
  onPointerDown: (coord: [number, number]) => void,
  ready: boolean
) {
  useEffect(() => {
    if (!ready) return;
    window.addEventListener("pointerdown", handlePointerDown, false);
    function handlePointerDown(e: MouseEvent) {
      onPointerDown(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, false);
    };
  }, [onPointerDown, ready]);
}
