import { useCallback } from "react";
import { useKeyDown, useStateCallback } from "./index";

export function useKeyHandler(key: string, onPressDown: () => void) {
  const keyDown = useKeyDown(key);
  const callback = useCallback(() => {
    if (keyDown) onPressDown();
  }, [keyDown, onPressDown]);
  useStateCallback(keyDown, callback);
}
