import { useRef, useEffect } from 'react'

export function usePrevious<State>(value: State) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
