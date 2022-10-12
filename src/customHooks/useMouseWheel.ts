import { useEffect } from "react";
import { getSceneMouseCoordFromClient } from "../utils";

export function useMouseWheel(onMouseWheel: (mouse: [number, number]) => void) {
  useEffect(() => {
    const mouseWheelHandler = (e: Event) => {
      const x = (e as any).clientX as number;
      const y = (e as any).clientY as number;
      onMouseWheel(getSceneMouseCoordFromClient([x, y]));
    };
    document.addEventListener("mousewheel", mouseWheelHandler, false);
    return () => {
      document.addEventListener("mousewheel", mouseWheelHandler, false);
    };
  }, [onMouseWheel]);
}

export function useMouseWheelConditionally(
  onMouseWheel: (mouse: [number, number]) => void,
  ready: boolean
) {
  useEffect(() => {
    if (!ready) return;
    const mouseWheelHandler = (e: Event) => {
      const x = (e as any).clientX as number;
      const y = (e as any).clientY as number;
      onMouseWheel(getSceneMouseCoordFromClient([x, y]));
    };
    document.addEventListener("mousewheel", mouseWheelHandler, false);
    return () => {
      document.addEventListener("mousewheel", mouseWheelHandler, false);
    };
  }, [onMouseWheel, ready]);
}
