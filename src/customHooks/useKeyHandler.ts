import { useEffect } from 'react'
import { useKeyDown } from './index'

export function useKeyHandler(key: string, onPressDown: () => void) {
  const keyDown = useKeyDown(key)

  useEffect(() => {
    if (keyDown) onPressDown()
  }, [keyDown, onPressDown])
}
