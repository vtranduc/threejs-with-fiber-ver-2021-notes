import { useEffect, useState } from "react";

export function useKeyDown(code: string) {
  const [isDown, setIsDown] = useState<boolean>(false);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function handleKeyDown(e: KeyboardEvent) {
      e.preventDefault();
      if (e.code === code) setIsDown(true);
    }

    function handleKeyUp(e: KeyboardEvent) {
      e.preventDefault();
      if (e.code === code) setIsDown(false);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [code]);

  return isDown;
}

export function useKeyDownConditionally(code: string, ready: boolean) {
  const [isDown, setIsDown] = useState<boolean>(false);

  useEffect(() => {
    if (!ready) return;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function handleKeyDown(e: KeyboardEvent) {
      e.preventDefault();
      if (e.code === code) setIsDown(true);
    }

    function handleKeyUp(e: KeyboardEvent) {
      e.preventDefault();
      if (e.code === code) setIsDown(false);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [code, ready]);

  return isDown;
}
