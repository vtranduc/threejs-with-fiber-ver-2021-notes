import { useCallback } from "react";
import { useKeyDown, useStateCallback, useKeyDownConditionally } from "./index";

export function useKeyHandler(key: string, onPressDown: () => void) {
  const keyDown = useKeyDown(key);
  const callback = useCallback(() => {
    if (keyDown) onPressDown();
  }, [keyDown, onPressDown]);
  useStateCallback(keyDown, callback);
}

export function useKeyHandlerConditionally(
  key: string,
  onPressDown: () => void,
  ready: boolean
) {
  const keyDown = useKeyDownConditionally(key, ready);
  const callback = useCallback(() => {
    if (keyDown) onPressDown();
  }, [keyDown, onPressDown]);
  useStateCallback(keyDown, callback);
}
