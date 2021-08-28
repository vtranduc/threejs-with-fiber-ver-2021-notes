import { useEffect, useState } from "react";
import { SCENE_CONSTANTS } from "../constants";

export function useMouseMove() {
  const [coord, setCoord] = useState<[number, number]>([NaN, NaN]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove, false);

    function onMouseMove(e: MouseEvent) {
      setCoord([
        ((e.clientX - SCENE_CONSTANTS.left) / SCENE_CONSTANTS.width) * 2 - 1,
        -((e.clientY - SCENE_CONSTANTS.top) / SCENE_CONSTANTS.height) * 2 + 1,
      ]);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove, false);
    };
  }, []);

  return coord;
}
