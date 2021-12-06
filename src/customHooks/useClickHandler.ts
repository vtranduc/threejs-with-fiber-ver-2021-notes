import { useEffect } from "react";
import { getSceneMouseCoord } from "../utils";

export function useClickHandler(onClick: (mouse: [number, number]) => void) {
  useEffect(() => {
    window.addEventListener("click", handleClick);
    function handleClick(e: MouseEvent) {
      onClick(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [onClick]);
}

export function useClickHandlerConditionally(
  onClick: (mouse: [number, number]) => void,
  ready: boolean
) {
  useEffect(() => {
    if (!ready) return;
    window.addEventListener("click", handleClick);
    function handleClick(e: MouseEvent) {
      onClick(getSceneMouseCoord(e));
    }
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [onClick, ready]);
}
