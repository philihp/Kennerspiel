import { GameState, GameStatusEnum, Rondel, Tile } from '../types'
import { clergyForColor, setPlayer } from './player'

export const preMove = (state: GameState): GameState | undefined => {
  let newState = state
  if (state.status !== GameStatusEnum.PLAYING) return undefined
  if (state.players === undefined) return undefined
  if (state.moveInRound === undefined) return undefined
  if (state.rondel === undefined) return undefined
  if (state.config === undefined) return undefined

  // TODO: isExtraRound
  // TODO: isSettling

  if (state.moveInRound === 1) {
    // board.preRound()

    // 1 - reset clergymen
    state.players.forEach((player, i) => {
      if (player.clergy.length === 0) {
        // clergy are all placed
        const clergy = clergyForColor(player.color)
        const landscape = player.landscape.map((landRow) =>
          landRow.map((landStack) => {
            if (landStack.length >= 3 && landStack?.[2] !== undefined && clergy.includes(landStack[2]))
              return [...landStack.slice(0, 2), ...landStack.slice(3)] as Tile
            return landStack
          })
        )
        newState = setPlayer(
          newState,
          {
            ...player,
            clergy,
            landscape,
          },
          i
        )
      }
    })

    // 2 - push arm
    const { rondel } = state
    const next = rondel.pointingBefore + (1 % 13)
    const bumper = (from?: number) => {
      if (from === next) {
        if (state.config?.players === 1) return undefined
        return (from + 1) % 13
      }
      return from
    }
    const newRondel: Rondel = {
      ...rondel,
      pointingBefore: next,
      grain: bumper(rondel.grain),
      sheep: bumper(rondel.sheep),
      clay: bumper(rondel.clay),
      coin: bumper(rondel.coin),
      wood: bumper(rondel.wood),
      joker: bumper(rondel.joker),
      peat: bumper(rondel.peat),
      grape: bumper(rondel.grape),
      stone: bumper(rondel.stone),
    }
    newState.rondel = newRondel

    // mode.preRound();

    // 3 - check to see if grapes/stone should become active
    // if(round == mode.grapeActiveOnRound()) getWheel().getGrape().setActive(true);
    // if(round == mode.stoneActiveOnRound()) getWheel().getStone().setActive(true);
    // if(round == mode.jokerActiveOnRound()) getWheel().getJoker().setActive(true);
  }

  return newState
}

export const postMove = (state: GameState): GameState | undefined => {
  if (state.config === undefined) return undefined
  if (state.players === undefined) return undefined
  if (state.moveInRound === undefined) return undefined
  if (state.round === undefined) return undefined
  if (state.startingPlayer === undefined) return undefined

  let { round, settling, extraRound, activePlayerIndex, moveInRound, startingPlayer } = state
  activePlayerIndex = (activePlayerIndex + 1) % state.players.length
  moveInRound += 1

  if (extraRound && moveInRound === state.players.length + 1) {
    // board.postExtraRound()
    extraRound = false
    settling = true
    moveInRound = 1
  }

  if (moveInRound === state.players.length + 1 || settling) {
    // board.postSettlement()
    settling = false
    // TODO: layout unbuilt buildings
    // TODO: layout unbuilt settlements
    // TODO: push arm, set gameover after settlement E

    round++
    moveInRound = 1
  } else if (!settling && moveInRound === state.players.length) {
    // board.postRound()
    moveInRound = 1

    // if(isExtraRound(board.getRound())) {
    // if (false) {
    //   round += 1
    //   extraRound = true
    // }
    // // else if(board.isRoundBeforeSettlement(board.getRound())) {
    // else if (false) {
    //   settling = true
    // } else {
    round++
    // }

    // 5 -- pass starting player
    startingPlayer = (startingPlayer + 1) % state.players.length
  }

  return {
    ...state,
    round,
    settling,
    extraRound,
    activePlayerIndex,
    moveInRound,
    startingPlayer,
  }
}
