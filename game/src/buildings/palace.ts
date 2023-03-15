import { identity, pipe } from 'ramda'
import { allOccupiedBuildingsUsable } from '../board/frame'
import { payCost, withActivePlayer } from '../board/player'
import { parseResourceParam } from '../board/resource'

export const palace = (input = '') => {
  const { wine = 0 } = parseResourceParam(input)
  if (wine === 0) return identity
  return pipe(
    //
    withActivePlayer(payCost({ wine })),
    allOccupiedBuildingsUsable
  )
}
