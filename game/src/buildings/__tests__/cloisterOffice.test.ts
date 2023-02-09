import { reducer, initialState } from '../../reducer'
import {
  Clergy,
  GameStatePlaying,
  GameStatusEnum,
  NextUseClergy,
  PlayerColor,
  SettlementRound,
  Tableau,
  Tile,
} from '../../types'
import { cloisterOffice } from '../cloisterOffice'

describe('buildings/cloisterOffice', () => {
  describe('use', () => {
    const p0: Tableau = {
      color: PlayerColor.Blue,
      clergy: ['LB1B', 'LB2B', 'PRIB'] as Clergy[],
      settlements: [],
      landscape: [
        [['W'], ['C'], [], [], [], [], [], [], []],
        [['W'], ['C'], ['P', 'LPE'], ['P', 'LFO'], ['P', 'LFO'], ['P'], ['P'], [], []],
        [[], [], ['P'], ['P', 'LFO'], ['P', 'LFO'], ['P'], ['P'], [], []],
      ] as Tile[][],
      wonders: 0,
      landscapeOffset: 1,
      peat: 0,
      penny: 0,
      clay: 0,
      wood: 0,
      grain: 0,
      sheep: 0,
      stone: 0,
      flour: 0,
      grape: 0,
      nickel: 0,
      hops: 0,
      coal: 0,
      book: 0,
      pottery: 0,
      whiskey: 0,
      straw: 0,
      meat: 0,
      ornament: 0,
      bread: 0,
      wine: 0,
      beer: 0,
      reliquary: 0,
    }
    const s0: GameStatePlaying = {
      ...initialState,
      status: GameStatusEnum.PLAYING,
      config: {
        country: 'france',
        players: 3,
        length: 'long',
      },
      rondel: {
        pointingBefore: 5,
        joker: 3,
        coin: 2,
      },
      wonders: 0,
      players: [
        {
          ...p0,
          color: PlayerColor.Blue,
          landscape: [
            [['W'], ['C'], [], [], [], [], [], [], []],
            [['W'], ['C'], ['P', 'LPE'], ['P', 'LFO'], ['P', 'LFO'], ['P'], ['H', 'LB1'], [], []],
            [[], [], ['P'], ['P', 'LFO'], ['P', 'LB2'], ['P'], ['P', 'LB3'], [], []],
          ] as Tile[][],
          landscapeOffset: 1,
        },
        {
          ...p0,
          color: PlayerColor.Red,
          landscape: [
            [['W'], ['C'], [], [], [], [], [], [], []],
            [['W'], ['C'], ['P', 'LPE'], ['P', 'LFO'], ['P', 'LFO'], ['P'], ['H', 'LR1'], [], []],
            [[], [], ['P'], ['P', 'LFO'], ['P', 'LR2'], ['P'], ['P', 'LR3'], [], []],
          ] as Tile[][],
          landscapeOffset: 1,
        },
        {
          ...p0,
          color: PlayerColor.White,
          landscape: [
            [['W'], ['C'], [], [], [], [], [], [], []],
            [['W'], ['C'], ['P', 'LPE'], ['P', 'LFO'], ['P', 'LFO'], ['P'], ['H', 'LW1'], [], []],
            [[], [], ['P'], ['P', 'LFO'], ['P', 'LW2'], ['P'], ['P', 'LW3'], [], []],
          ] as Tile[][],
          landscapeOffset: 1,
        },
      ],
      buildings: [],
      plotPurchasePrices: [1, 1, 1, 1, 1, 1],
      districtPurchasePrices: [],
      frame: {
        next: 1,
        startingPlayer: 1,
        settlementRound: SettlementRound.S,
        workContractCost: 1,
        currentPlayerIndex: 0,
        activePlayerIndex: 0,
        neutralBuildingPhase: false,
        bonusRoundPlacement: false,
        mainActionUsed: false,
        bonusActions: [],
        canBuyLandscape: true,
        unusableBuildings: [],
        usableBuildings: [],
        nextUse: NextUseClergy.Any,
      },
    }

    it('retains undefined state', () => {
      const s0: GameStatePlaying | undefined = undefined
      const s1 = cloisterOffice()(s0)
      expect(s1).toBeUndefined()
    })
    it('can get pennies with the coin token', () => {
      const s1 = cloisterOffice()(s0)!
      expect(s1.players[0].penny).toBe(4)
      expect(s1.rondel).toMatchObject({
        pointingBefore: 5,
        joker: 3,
        coin: 5,
      })
    })
    it('can get pennies with the joker', () => {
      const s1 = cloisterOffice('Jo')(s0)!
      expect(s1.players[0].penny).toBe(3)
      expect(s1.rondel).toMatchObject({
        pointingBefore: 5,
        joker: 5,
        coin: 2,
      })
    })
    it('if coin is not there, do nothing', () => {
      const s1: GameStatePlaying = {
        ...s0,
        rondel: {
          ...s0.rondel,
          pointingBefore: 5,
          joker: 3,
          coin: undefined,
        },
      }
      const s2 = cloisterOffice()(s1)!
      expect(s2.players[0].penny).toBe(0)
      expect(s1.rondel).toMatchObject({
        pointingBefore: 5,
        joker: 3,
        coin: undefined,
      })
    })
  })
})
