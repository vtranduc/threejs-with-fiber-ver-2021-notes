import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { Compass, ActionOpts } from '../types'
import { useFrame } from '@react-three/fiber'
import { mapCompassRotation, mapCompassVector3 } from '../utils'
import { usePrevious } from './index'

interface GTLFAnimationOption<Action> {
  idleAction?: Action
  walkAction?: Action
  castShadow?: boolean
  receiveShadow?: boolean
  unitsPerSecond?: number
  rotateY?: number
  transition?: number
}

type ActionAnimation<Action extends string> = Record<Action, THREE.AnimationAction | null>

type CompassMap = Record<Compass, { rotationY: number; velocity: THREE.Vector3 }>

export function useGLTFAnimation<Action extends string>(
  { path, actions: actionOpts }: { path: string; actions: ActionOpts<Action> },
  opts: GTLFAnimationOption<Action> = {}
) {
  const ref = useRef<THREE.Object3D>(new THREE.Object3D())
  const { scene, animations } = useGLTF(path)
  const animationControl = useAnimations(animations, ref)
  const actions = animationControl.actions as ActionAnimation<Action>
  const [action, setAction] = useState<Action | null>(null)
  const previousAction = usePrevious<Action | null>(action)
  const [compass, setCompass] = useState<Compass | null>(null)
  const [idleAction, setIdleAction] = useState<Action | null>(opts.idleAction || null)
  const [idleTimer, setTimer] = useState<ReturnType<typeof setTimeout>>(setTimeout(() => {}, 0))
  const startingY = useMemo(() => opts.rotateY || 0, [opts.rotateY])
  const transition = useMemo(() => opts.transition || 0.5, [opts.transition])
  const walkAction = useMemo(() => opts.walkAction || null, [opts.walkAction])
  const compassMap = useMemo(
    () =>
      Object.fromEntries(
        Object.values(Compass).map((dir) => [
          dir,
          {
            rotationY: mapCompassRotation(dir),
            velocity: mapCompassVector3(dir).multiplyScalar(opts.unitsPerSecond || 1),
          },
        ])
      ) as CompassMap,
    [opts.unitsPerSecond]
  )

  // Set up

  useEffect(() => {
    ref.current.rotation.y = startingY
  }, [ref, startingY])

  useEffect(() => {
    scene.traverse((child) => {
      child.castShadow = !!opts.castShadow
      child.receiveShadow = !!opts.receiveShadow
    })
  }, [scene, opts.castShadow, opts.receiveShadow])

  useEffect(() => {
    if (opts.idleAction) setAction(opts.idleAction)
  }, [opts.idleAction])

  useEffect(() => {
    ;(Object.keys(actionOpts) as Action[]).forEach((action) => {
      const opts = actionOpts[action]
      const animationAction = actions[action]
      if (!animationAction) return
      if (opts.repeat) animationAction.setLoop(THREE.LoopPingPong, Infinity)
      else {
        animationAction.setLoop(THREE.LoopOnce, 0)
        animationAction.clampWhenFinished = true
      }
    })
  }, [actionOpts, actions])

  // Rotate character

  useEffect(() => {
    if (compass) ref.current.rotation.y = compassMap[compass].rotationY + startingY
  }, [compass, ref, compassMap, startingY])

  // Animate character

  useEffect(() => {
    if (action === previousAction) return
    clearTimeout(idleTimer)
    let timer: ReturnType<typeof setTimeout>
    if (previousAction) actions[previousAction]?.fadeOut(transition)
    const animationAction = action && actions[action]
    if (animationAction) {
      animationAction.reset().fadeIn(transition).play()
      if (!actionOpts[action as Action].repeat) {
        const fadeOutPoint = (animationAction.getClip().duration - transition) * 1000
        if (fadeOutPoint > 0) {
          timer = setTimeout(() => setAction(idleAction), fadeOutPoint)
          setTimer(timer)
        } else setAction(idleAction)
      }
    }
  }, [action, previousAction, actions, transition, actionOpts, idleAction, idleTimer])

  // User controls

  const play = useCallback(
    (action: Action) => {
      setAction(action)
      if (compass && action !== walkAction) setCompass(null)
    },
    [compass, walkAction]
  )

  const stop = useCallback(() => {
    setAction(idleAction)
  }, [idleAction])

  const move = useCallback(
    (compass: Compass | null) => {
      setAction(compass ? walkAction : idleAction)
      setCompass(compass)
    },
    [walkAction, idleAction]
  )

  const pose = useCallback(
    (action_: Action | null) => {
      if (action === idleAction) setAction(action_)
      setIdleAction(action_)
    },
    [action, idleAction]
  )

  // World space animation

  useFrame((_, delta) => {
    moveRef(delta)
  })

  const getDisplacement = useCallback(
    (interval: number) => compass && compassMap[compass].velocity.clone().multiplyScalar(interval),
    [compass, compassMap]
  )

  const moveRef = useCallback(
    (interval: number) => {
      const displacement = getDisplacement(interval)
      if (displacement) ref.current.position.add(displacement)
    },
    [ref, getDisplacement]
  )

  return { scene, ref, play, stop, move, pose }
}
