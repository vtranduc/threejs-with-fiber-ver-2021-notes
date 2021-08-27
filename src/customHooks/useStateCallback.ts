import { useEffect } from "react";
import { usePrevious } from "./index";

/**
 * Will call the callback function if a change in state is detected. Note that,
 * useEffect will use callback as dependency, so be sure to use React.useCallback
 * as necessary, otherwise useEffect may unnecessarily trigger its function
 * every render.
 * @param state whose change will trigger callback
 * @param callback that gets triggered when state changes
 */

export function useStateCallback(state: any, callback: () => void) {
  const previousState = usePrevious(state);
  useEffect(() => {
    if (state !== previousState) callback();
  }, [state, callback, previousState]);
}
