import { match, P } from 'ts-pattern'
import { GameCommandConfigParams, GameState, GameStatusEnum, PostMoveHandler, SettlementRound } from '../types'
import { roundBuildings } from './buildings'
import { postRound } from './postRound'
import { pushArm } from './rondel'
import { roundSettlements } from './settlements'

export const postMove = (config: GameCommandConfigParams): PostMoveHandler => {
  return match<GameCommandConfigParams, PostMoveHandler>(config) // .
    .with({ players: 1, country: 'ireland' }, () => (state: GameState) => {
      // TODO postMove ireland solo
      // https://github.com/philihp/weblabora/blob/737717fd59c1301da6584a6874a20420eba4e71e/src/main/java/com/philihp/weblabora/model/BoardModeOneIreland.java#L113
      return state
    })
    .with({ players: 1, country: 'france' }, () => (state: GameState) => {
      // TODO postMove france solo
      // https://github.com/philihp/weblabora/blob/737717fd59c1301da6584a6874a20420eba4e71e/src/main/java/com/philihp/weblabora/model/BoardModeOneFrance.java#L121
      return state
    })
    .with({ players: 2, length: 'long' }, () => (state: GameState) => {
      if (state.players === undefined) return undefined
      if (state.moveInRound === undefined) return undefined
      if (state.round === undefined) return undefined
      if (state.config === undefined) return undefined
      if (state.rondel === undefined) return undefined

      let { rondel, status, players, buildings, round, settling, moveInRound, activePlayerIndex } = state
      let newState = state

      if (moveInRound === 2 || settling) {
        activePlayerIndex = (activePlayerIndex + 1) % state.players.length
      }
      moveInRound++

      if (settling && moveInRound === 3) {
        // board.postSettlement()
        settling = false
        buildings = roundBuildings(state.config, state.settlementRound)
        players = players.map((player) => ({
          ...player,
          settlements: roundSettlements(player.color, state.settlementRound),
        }))
        if (state.settlementRound === SettlementRound.E) {
          status = GameStatusEnum.FINISHED
          rondel = pushArm(rondel, state.config.players)
        }

        round++
        moveInRound = 1
      } else if (!settling && moveInRound === 4) {
        const postRoundState = postRound(state.config)(newState)
        if (postRoundState === undefined) return undefined
        newState = postRoundState
      }

      return {
        ...newState,
        rondel,
        status,
        settling,
        moveInRound,
        activePlayerIndex,
        round,
        players,
      }
    })
    .with({ players: 2, length: 'short' }, (config) => (state: GameState) => {
      if (state.players === undefined) return undefined
      if (state.moveInRound === undefined) return undefined
      if (state.config === undefined) return undefined
      if (state.round === undefined) return undefined
      if (state.rondel === undefined) return undefined
      if (state.startingPlayer === undefined) return undefined

      let { rondel, buildings, players, round, moveInRound, activePlayerIndex, settling, status } = state
      let newState = state
      const { settlementRound } = state
      moveInRound++

      if (settling) {
        activePlayerIndex = (activePlayerIndex + 1) % state.players.length
        if (moveInRound > 2) {
          // board.postSettlement()
          settling = false
          buildings = roundBuildings(state.config, state.settlementRound)
          players = players.map((player) => ({
            ...player,
            settlements: roundSettlements(player.color, state.settlementRound),
          }))
          if (state.settlementRound === SettlementRound.E) {
            status = GameStatusEnum.FINISHED
            rondel = pushArm(rondel, state.config.players)
          }
          round++
          moveInRound = 1
        }
      } else if (moveInRound > 2) {
        activePlayerIndex = (activePlayerIndex + 1) % state.players.length
        const postRoundState = postRound(state.config)(newState)
        if (postRoundState === undefined) return undefined
        newState = postRoundState
      }

      return {
        ...newState,
        rondel,
        buildings,
        players,
        round,
        moveInRound,
        activePlayerIndex,
        settlementRound,
        settling,
      }
    })
    .with({ players: P.union(3, 4) }, () => (state: GameState) => {
      if (state.config === undefined) return undefined
      if (state.players === undefined) return undefined
      if (state.moveInRound === undefined) return undefined
      if (state.round === undefined) return undefined
      if (state.rondel === undefined) return undefined
      if (state.startingPlayer === undefined) return undefined

      let newState = state
      let { rondel, status, players, buildings, round, settling, extraRound, activePlayerIndex, moveInRound } = state
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
        buildings = roundBuildings(state.config, state.settlementRound)
        players = players.map((player) => ({
          ...player,
          settlements: roundSettlements(player.color, state.settlementRound),
        }))
        if (state.settlementRound === SettlementRound.E) {
          status = GameStatusEnum.FINISHED
          rondel = pushArm(rondel, state.config.players)
        }
        round++
        moveInRound = 1
      } else if (!settling && moveInRound === state.players.length) {
        const postRoundState = postRound(state.config)(state)
        if (postRoundState === undefined) return undefined
        newState = postRoundState
      }

      return {
        ...newState,
        rondel,
        status,
        players,
        buildings,
        round,
        settling,
        extraRound,
        activePlayerIndex,
        moveInRound,
      }
    })
    .otherwise(() => () => undefined)
}
