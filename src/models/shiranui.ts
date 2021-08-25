import { ActionOpts } from '../types'

export enum ShiranuiAction {
  Idle = 'mixamo.com',
}

export const shiranuiData = {
  path: 'models/shiranui/scene.gltf',
  actions: { [ShiranuiAction.Idle]: { repeat: true } } as ActionOpts<ShiranuiAction>,
}
