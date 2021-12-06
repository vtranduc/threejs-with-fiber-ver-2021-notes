import { useEffect } from "react";
import { getSceneMouseCoord } from "../utils";

export function usePointerMove(
  onPointerMove: (mouse: [number, number]) => void
) {
  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, false);
    function handlePointerMove(e: MouseEvent) {
      onPointerMove(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove, false);
    };
  }, [onPointerMove]);
}

export function usePointerMoveConditionally(
  onPointerMove: (mouse: [number, number]) => void,
  ready: boolean
) {
  useEffect(() => {
    if (!ready) return;
    window.addEventListener("pointermove", handlePointerMove, false);
    function handlePointerMove(e: MouseEvent) {
      onPointerMove(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove, false);
    };
  }, [onPointerMove, ready]);
}
