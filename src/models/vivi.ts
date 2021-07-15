import { CharacterStructure } from '../types'

export enum ViviAction {
  Static = 'Armature|Armature|mixamo.com|Layer0',
  PickFloor = 'Armature|Pickup_floor',
  PickFront = 'Armature|pickup_front',
  PickUpUp = 'Armature|pickup_up',
  PickUpIdle = 'Armature|pickUp_Up_idle',
  Sit = 'Armature|Sitting_1',
  CrossArm = 'Armature|stand_crossArm',
  StandIdle = 'Armature|Stand_Idle',
  Walk = 'Armature|Walk_normal',
  Redundant1 = 'Face.001|pickup_up',
  Redundant2 = 'Face.001|sitting_1',
  Redundant3 = 'Body.001|Armature|mixamo.com|Layer0',
  Redundant4 = 'Body.001|sitting_1',
  Redundant5 = 'Armature|sitting_1',
  Redundant6 = 'Face.001|Armature|mixamo.com|Layer0',
}

const path = 'models/vivi/scene.gltf'

const skinnedMeshes = [
  {
    node: '0',
    material: 'F00_000_00_EyeWhite_00_EYE',
  },
  {
    node: '1',
    material: 'F00_000_00_FaceEyeline_00_FACE',
  },
  {
    node: '2',
    material: 'F00_000_00_FaceEyelash_00_FACE',
  },
  {
    node: '3',
    material: 'F00_000_00_EyeIris_00_EYE',
  },
  {
    node: '4',
    material: 'F00_000_00_EyeHighlight_00_EYE',
  },
  {
    node: '5',
    material: 'F00_000_00_Face_00_SKIN',
  },
  {
    node: '6',
    material: 'F00_000_00_EyeExtra_01_EYE',
  },
  {
    node: '7',
    material: 'F00_000_00_EyeExtra_01_EYE.001',
  },
  {
    node: '8',
    material: 'Material',
  },
  {
    node: '9',
    material: 'Teeth',
  },
  {
    node: 'Body001_F00_001_01_Body_00_SKIN_0',
    material: 'F00_001_01_Body_00_SKIN',
  },
  {
    node: 'Body001_F00_001_01_Bottoms_01_CLOTH_0',
    material: 'F00_001_01_Bottoms_01_CLOTH',
  },
  {
    node: 'Body001_F00_001_02_Tops_01_CLOTH_0',
    material: 'F00_001_02_Tops_01_CLOTH',
  },
  {
    node: 'Hair001001_F00_000_Hair_00_HAIR_01_0',
    material: 'F00_000_Hair_00_HAIR_01',
  },
  {
    node: 'Hair001001_F00_000_Hair_00_HAIR_02_0',
    material: 'F00_000_Hair_00_HAIR_02',
  },
]

const groups: JSX.IntrinsicElements['group'][] = [
  {},
  { rotation: [-Math.PI / 2, 0, 0] },
  { scale: 0.1 },
  { rotation: [Math.PI / 2, 0, 0] },
  { name: 'Armature', position: [-17.42, 0, 0], rotation: [0, 0, 0] },
]

const bone = '_rootJoint'

const repetitiveActions = [ViviAction.Walk, ViviAction.StandIdle, ViviAction.PickUpIdle]

const actions = Object.values(ViviAction).reduce((acc, act) => {
  return { ...acc, [act]: { repeat: repetitiveActions.includes(act) } }
}, {}) as Record<ViviAction, { repeat: boolean }>

export const viviStructure: CharacterStructure<ViviAction> = {
  path,
  groups,
  actions,
  bone,
  skinnedMeshes,
}
