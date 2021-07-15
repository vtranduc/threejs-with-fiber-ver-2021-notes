import { MutableRefObject } from 'react'

export interface CharacterStructure<Action extends string> {
  path: string
  groups: JSX.IntrinsicElements['group'][]
  actions: Record<Action, ActionSettings>
  bone: string
  skinnedMeshes: {
    node: string
    material: string
  }[]
}

interface ActionSettings {
  repeat: boolean
}

export interface CharacterProps {
  characterRef: MutableRefObject<THREE.Group | undefined>
  groups: JSX.IntrinsicElements['group'][]
  bone: THREE.Bone
  skinnedMeshes: CharacterSkinnedMesh[]
}

interface CharacterSkinnedMesh {
  geometry: THREE.BufferGeometry
  material: THREE.Material | THREE.Material[]
  skeleton: THREE.Skeleton
  morphTargetDictionary?: { [key: string]: number }
  morphTargetInfluences?: number[]
  name: string
}

export enum ArrowCode {
  A = 'KeyA',
  W = 'KeyW',
  S = 'KeyS',
  D = 'KeyD',
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
}

export enum Compass {
  N = 'N',
  E = 'E',
  S = 'S',
  W = 'W',
  NE = 'NE',
  NW = 'NW',
  SE = 'SE',
  SW = 'SW',
}
