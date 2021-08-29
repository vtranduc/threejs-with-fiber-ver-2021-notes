import { useEffect, useState } from "react";
import { getSceneMouseCoord } from "../utils";

export function useMouseMove() {
  const [coord, setCoord] = useState<[number, number]>([NaN, NaN]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove, false);

    function onMouseMove(e: MouseEvent) {
      setCoord(getSceneMouseCoord(e));
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove, false);
    };
  }, []);

  return coord;
}
