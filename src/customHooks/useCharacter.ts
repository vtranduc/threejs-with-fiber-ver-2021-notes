import { useRef, useEffect, useMemo, MutableRefObject, useState } from 'react'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { CharacterStructure } from '../types'
import { adjustHeight, adjustBaseCenterPos, mapCompassRotation, mapCompassVector3 } from '../utils'
import { CharacterProps, Compass } from '../types'

interface CharacterUse<Action extends string> {
  ref: MutableRefObject<THREE.Group | undefined>
  play: (action: Action) => void
  stop: (action: Action) => void
  move: (compass: Compass | null) => void
  rotateY: (compass: Compass) => void
  props: CharacterProps
}

type ActionAnimation<Action extends string> = Record<Action, THREE.AnimationAction>

type GLTFExtended = GLTF & {
  nodes: { [node: string]: THREE.SkinnedMesh | THREE.Bone }
  materials: { [node: string]: THREE.Material | THREE.Material[] }
}

interface UseCharacterOption {
  height?: number
  euler?: THREE.Euler
  position?: THREE.Vector3
}

interface ResetRefState {
  euler: THREE.Euler
}

type CompassMap = Record<Compass, { rotationY: number; velocity: THREE.Vector3 }>

export function useCharacter<Action extends string>(
  character: CharacterStructure<Action>,
  opts?: UseCharacterOption,
  onAnimationFinished?: (act: Action) => void
): CharacterUse<Action> {
  const group = useRef<THREE.Group>(new THREE.Group())
  const { nodes, materials, animations } = useGLTF(character.path) as GLTFExtended
  const skinnedMeshes = useMemo(
    () =>
      character.skinnedMeshes.map((meshData) => {
        return {
          geometry: (nodes[meshData.node] as THREE.SkinnedMesh).geometry,
          material: materials[meshData.material],
          skeleton: (nodes[meshData.node] as THREE.SkinnedMesh).skeleton,
          morphTargetDictionary: (nodes[meshData.node] as THREE.SkinnedMesh).morphTargetDictionary,
          morphTargetInfluences: (nodes[meshData.node] as THREE.SkinnedMesh).morphTargetInfluences,
          name: meshData.node,
        }
      }),
    [character.skinnedMeshes, nodes, materials]
  )
  const bone = nodes[character.bone] as THREE.Bone
  const animationControl = useAnimations(animations, group)
  const actions = animationControl.actions as ActionAnimation<Action>
  const mixer = animationControl.mixer
  const [resetState, setResetState] = useState<ResetRefState>({
    euler: new THREE.Euler(),
  })
  const compassMap: CompassMap = useMemo(
    () =>
      (Object.values(Compass) as Compass[]).reduce((acc: Partial<CompassMap>, dir) => {
        return {
          ...acc,
          [dir]: {
            rotationY: mapCompassRotation(dir),
            velocity: mapCompassVector3(dir).multiplyScalar(0.01),
          },
        }
      }, {}) as CompassMap,
    []
  )

  useEffect(() => {
    mixer.addEventListener('finished', onAnimationFinished_)
    function onAnimationFinished_(e: THREE.Event) {
      if (onAnimationFinished) onAnimationFinished(e.action._clip.name)
    }
    return () => {
      mixer.removeEventListener('finished', onAnimationFinished_)
    }
  }, [mixer, onAnimationFinished])

  useEffect(() => {
    ;(Object.keys(actions) as (keyof ActionAnimation<Action>)[]).forEach((act) => {
      if (character.actions[act].repeat) {
        actions[act].setLoop(THREE.LoopPingPong, Infinity)
      } else {
        actions[act].clampWhenFinished = true
        actions[act].setLoop(THREE.LoopOnce, 0)
      }
    })
  }, [actions, character.actions, group])

  // Remember in threejs, always adjust in order of scale, rotation (in order of x, y,z ), then position

  useEffect(() => {
    if (opts) {
      if (opts.euler)
        group.current.setRotationFromEuler(
          new THREE.Euler().setFromVector3(
            new THREE.Vector3(
              opts.euler.x + group.current.rotation.x,
              opts.euler.y + group.current.rotation.y,
              opts.euler.z + group.current.rotation.z
            )
          )
        )
      if (opts.height) adjustHeight(group.current, opts.height)
    }
    adjustBaseCenterPos(group.current, opts && opts.position)
    setResetState({
      euler: group.current.rotation.clone(),
    })
  }, [opts, group])

  function play(action: Action) {
    actions[action].play()
  }

  function stop(action: Action) {
    actions[action].stop()
  }

  function rotateY(compass: Compass) {
    group.current.rotation.y = resetState.euler.y + compassMap[compass].rotationY
  }

  function move(compass: Compass | null) {
    if (compass) {
      group.current.position.add(compassMap[compass].velocity)
    }
  }

  return {
    ref: group,
    play,
    stop,
    move,
    rotateY,
    props: { characterRef: group, groups: character.groups, bone, skinnedMeshes },
  }
}
