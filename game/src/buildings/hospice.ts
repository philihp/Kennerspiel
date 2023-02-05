import { pipe } from 'ramda'
import { GameStatePlaying, NextUseClergy } from '../types'

const allowUseAnyUnbuiltBuilding = (state: GameStatePlaying | undefined): GameStatePlaying | undefined => {
  if (state === undefined) return undefined
  return {
    ...state,
    turn: {
      ...state.turn,
      usableBuildings: state.buildings,
      nextUse: NextUseClergy.Free,
    },
  }
}

export const hospice = () =>
  pipe(
    //
    allowUseAnyUnbuiltBuilding
  )
