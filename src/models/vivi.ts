import { ActionOpts } from '../types'

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

const repetitiveActions = [
  ViviAction.Walk,
  ViviAction.StandIdle,
  ViviAction.PickUpIdle,
  ViviAction.CrossArm,
  ViviAction.Sit,
]

export const viviData = {
  path,
  actions: Object.fromEntries(
    Object.values(ViviAction).map((action) => [
      action,
      { repeat: repetitiveActions.includes(action) },
    ])
  ) as ActionOpts<ViviAction>,
}
