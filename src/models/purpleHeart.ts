import { ActionOpts } from '../types'

export enum PurpleHeartAction {
  Fight = 'solaFighting',
  Kick = 'solakicking',
  HipHop = 'solahiphop',
  BellyDance = 'solaBellyDance',
  SalsaDance = 'solasalsadancing',
  RoboticDance = 'solaRoboticDance',
}

const path = 'models/purple_heart/scene.gltf'

export const purpleHeartData = {
  path,
  actions: Object.fromEntries(
    Object.values(PurpleHeartAction).map((action) => [action, { repeat: true }])
  ) as ActionOpts<PurpleHeartAction>,
}
