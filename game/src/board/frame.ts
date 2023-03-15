import { findIndex, map, pipe, reduce, remove } from 'ramda'
import { match } from 'ts-pattern'
import { nextFrame4Long } from './frame/nextFrame4Long'
import { nextFrame3Long } from './frame/nextFrame3Long'
import { nextFrameSolo } from './frame/nextFrameSolo'
import { nextFrame3Short } from './frame/nextFrame3Short'
import { nextFrame4Short } from './frame/nextFrame4Short'
import { nextFrame2Long } from './frame/nextFrame2Long'
import { nextFrame2Short } from './frame/nextFrame2Short'
import {
  BuildingEnum,
  Frame,
  FrameFlow,
  GameCommandEnum,
  GameStatePlaying,
  NextUseClergy,
  StateReducer,
  Tile,
} from '../types'
import { findBuildingWithoutOffset, occupiedBuildingsForPlayers } from './landscape'

export const withFrame =
  (func: (frame: Frame) => Frame | undefined): StateReducer =>
  (state) => {
    if (state === undefined) return state
    const frame = func(state.frame)
    if (frame === undefined) return undefined
    return {
      ...state,
      frame,
    }
  }

export const addBonusAction = (command: GameCommandEnum) =>
  withFrame((frame) => ({
    ...frame,
    bonusActions: [...frame.bonusActions, command],
  }))

const runProgression =
  (withFlow: FrameFlow): StateReducer =>
  (state) => {
    const nextFrameIndex = state?.frame.next
    if (nextFrameIndex === undefined) return undefined
    const { upkeep = [], ...frameUpdates } = withFlow[nextFrameIndex] ?? {}
    return pipe(
      // first, with all of the properties on the new frame, overlay them on the current frame
      withFrame((frame) => {
        const newFrame = {
          ...frame,
          activePlayerIndex: frameUpdates.currentPlayerIndex ?? frame?.activePlayerIndex,
          mainActionUsed: false,
          bonusActions: [],
          canBuyLandscape: true,
          unusableBuildings: [],
          usableBuildings: [],
          nextUse: NextUseClergy.Any,
          ...frameUpdates,
        } as Frame
        return newFrame
      }),
      // and then if there are any upkeep reducer functions on the frame, run them
      (state) => {
        return upkeep.reduce((accum: GameStatePlaying | undefined, f) => f(accum), state)
      }
    )(state)
  }

export const nextFrame: StateReducer = (state) =>
  match(state)
    .with({ config: { players: 3, length: 'long' } }, runProgression(nextFrame3Long))
    .with({ config: { players: 4, length: 'long' } }, runProgression(nextFrame4Long))
    .with({ config: { players: 3, length: 'short' } }, runProgression(nextFrame3Short))
    .with({ config: { players: 4, length: 'short' } }, runProgression(nextFrame4Short))
    .with({ config: { players: 2, length: 'long' } }, runProgression(nextFrame2Long))
    .with({ config: { players: 2, length: 'short' } }, runProgression(nextFrame2Short))
    .with({ config: { players: 1 } }, runProgression(nextFrameSolo))
    .with(undefined, () => undefined)
    .exhaustive()

export const revertActivePlayerToCurrent: StateReducer = withFrame((frame) => ({
  ...frame,
  activePlayerIndex: frame.currentPlayerIndex,
}))

const consumeCommandFromBonus =
  (command: GameCommandEnum) =>
  (frame: Frame | undefined): Frame | undefined => {
    if (frame === undefined) return undefined
    const bonusIndex = findIndex((a) => a === command)(frame.bonusActions)
    if (bonusIndex !== -1) {
      const bonusActions = remove(bonusIndex, 1, frame.bonusActions) as GameCommandEnum[]
      return {
        ...frame,
        bonusActions,
      }
    }
    return undefined
  }

export const onlyViaBonusActions = (command: GameCommandEnum) => withFrame(consumeCommandFromBonus(command))

export const oncePerFrame = (command: GameCommandEnum): StateReducer =>
  withFrame((frame) => {
    // first try to remove the proposed command from bonusActions
    const bonusFrame = consumeCommandFromBonus(command)(frame)
    if (bonusFrame !== undefined) return bonusFrame

    // then if it couldn't be, consume the main action, if available
    if (frame.mainActionUsed === false) return { ...frame, mainActionUsed: true }
    return undefined
  })

export const setFrameToAllowFreeUsage = (building: BuildingEnum[]): StateReducer =>
  withFrame((frame) => ({
    ...frame,
    usableBuildings: building,
    nextUse: NextUseClergy.Free,
  }))

export const disableFurtherUsage = (building: BuildingEnum): StateReducer =>
  withFrame(
    (frame) =>
      frame && {
        ...frame,
        unusableBuildings: [building],
      }
  )

const whichIndexHasBuilding =
  (building: BuildingEnum) =>
  (landscapes: Tile[][][]): [number, number, number] | undefined => {
    for (let i = 0; i < landscapes.length; i++) {
      const location = findBuildingWithoutOffset(building)(landscapes[i])
      if (location) return [i, ...location]
    }
    return undefined
  }

const ADJACENT = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

export const allowFreeUsageToNeighborsOf =
  (building: BuildingEnum): StateReducer =>
  (state) => {
    if (state === undefined) return state
    const location = whichIndexHasBuilding(building)(state.players.map((p) => p.landscape))
    if (location === undefined) return state
    const [player, row, col] = location
    return setFrameToAllowFreeUsage(
      reduce(
        (accum, curr: [number, number, number]) => {
          const [p, r, c] = curr
          const landStack = state.players[p].landscape?.[r]?.[c]
          if (landStack === undefined) return accum
          const [_, building, clergy] = landStack
          if (building === undefined) return accum
          if (clergy !== undefined) return accum
          accum.push(building)
          return accum
        },
        [] as BuildingEnum[],
        map(([rowMod, colMod]) => [player, row + rowMod, col + colMod], ADJACENT) as [number, number, number][]
      )
    )(state)
  }

export const allOccupiedBuildingsUsable: StateReducer = (state) => {
  if (state === undefined) return state
  return setFrameToAllowFreeUsage(occupiedBuildingsForPlayers(state.players))(state)
}
