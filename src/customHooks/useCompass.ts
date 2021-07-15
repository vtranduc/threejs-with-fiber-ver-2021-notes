import { useEffect, useState } from 'react'
import { useKeyDown } from './index'
import { ArrowCode, Compass } from '../types'

export function useCompass() {
  const [compass, setCompass] = useState<Compass | null>(null)
  const [eastWest, setEastWest] = useState<Compass.E | Compass.W | null>(null)
  const [northSouth, setNorthSouth] = useState<Compass.N | Compass.S | null>(null)

  const W = useKeyDown(ArrowCode.W)
  const A = useKeyDown(ArrowCode.A)
  const S = useKeyDown(ArrowCode.S)
  const D = useKeyDown(ArrowCode.D)

  useEffect(() => {
    switch (eastWest) {
      case Compass.E:
        switch (northSouth) {
          case Compass.N:
            setCompass(Compass.NE)
            break
          case Compass.S:
            setCompass(Compass.SE)
            break
          default:
            setCompass(Compass.E)
        }
        break
      case Compass.W:
        switch (northSouth) {
          case Compass.N:
            setCompass(Compass.NW)
            break
          case Compass.S:
            setCompass(Compass.SW)
            break
          default:
            setCompass(Compass.W)
        }
        break
      default:
        switch (northSouth) {
          case Compass.N:
            setCompass(Compass.N)
            break
          case Compass.S:
            setCompass(Compass.S)
            break
          default:
            setCompass(null)
        }
    }
  }, [eastWest, northSouth])

  useEffect(() => {
    setEastWest(A ? (D ? null : Compass.W) : D ? Compass.E : null)
  }, [A, D])

  useEffect(() => {
    setNorthSouth(S ? (W ? null : Compass.S) : W ? Compass.N : null)
  }, [W, S])

  return { compass }
}
