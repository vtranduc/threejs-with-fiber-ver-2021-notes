import { useCallback, useEffect, useState } from "react";
import { getSceneMouseCoord } from "../utils";
import { useMouseDown } from "./index";

export function useDrag() {
  const [start, setStart] = useState<[number, number] | null>(null);
  const [coord, setCoord] = useState<[number, number] | null>(null);

  const onMouseDown = useCallback((coord) => {
    setStart(coord);
    setCoord(coord);
  }, []);

  const onMouseUp = useCallback(() => {
    setStart(null);
    setCoord(null);
  }, []);

  const isDragging = useMouseDown(onMouseDown, onMouseUp);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", onMouseMove);

    function onMouseMove(e: MouseEvent) {
      setCoord(getSceneMouseCoord(e));
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isDragging]);

  return { start, coord };
}
