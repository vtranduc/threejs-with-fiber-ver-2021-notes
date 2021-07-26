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

export type ActionOpts<Action extends string> = Record<Action, { repeat: boolean }>
