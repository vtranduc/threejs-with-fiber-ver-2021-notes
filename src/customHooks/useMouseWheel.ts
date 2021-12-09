import { useEffect } from "react";

export function useMouseWheel(onMouseWheel: () => void) {
  useEffect(() => {
    const mouseWheelHandler = () => onMouseWheel();
    document.addEventListener("mousewheel", mouseWheelHandler, false);
    return () => {
      document.addEventListener("mousewheel", mouseWheelHandler, false);
    };
  }, [onMouseWheel]);
}

export function useMouseWheelConditionally(
  onMouseWheel: () => void,
  ready: boolean
) {
  useEffect(() => {
    if (!ready) return;
    const mouseWheelHandler = () => onMouseWheel();
    document.addEventListener("mousewheel", mouseWheelHandler, false);
    return () => {
      document.addEventListener("mousewheel", mouseWheelHandler, false);
    };
  }, [onMouseWheel, ready]);
}
