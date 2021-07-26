import { useKeyDown, useStateCallback } from './index'

export function useKeyHandler(key: string, onPressDown: () => void) {
  const keyDown = useKeyDown(key)
  useStateCallback(keyDown, () => {
    if (keyDown) onPressDown()
  })
}
