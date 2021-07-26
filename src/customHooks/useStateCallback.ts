import { useEffect } from 'react'
import { usePrevious } from './index'

export function useStateCallback(state: any, callback: () => void) {
  const previousState = usePrevious(state)
  useEffect(() => {
    if (state !== previousState) callback()
  }, [state, callback, previousState])
}
