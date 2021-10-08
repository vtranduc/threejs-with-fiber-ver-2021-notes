import { useEffect, useState } from "react";
import { getSceneMouseCoord } from "../utils";

export function useMouseDown(
  onMouseDown: (coord: [number, number]) => void,
  onMouseUp: (coord: [number, number]) => void
) {
  const [isDown, setIsDown] = useState<boolean>(false);

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);

    function handleMouseDown(e: MouseEvent) {
      setIsDown(true);
      onMouseDown(getSceneMouseCoord(e));
    }

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [onMouseDown]);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);

    function handleMouseUp(e: MouseEvent) {
      setIsDown(false);
      onMouseUp(getSceneMouseCoord(e));
    }

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onMouseUp]);

  return isDown;
}
