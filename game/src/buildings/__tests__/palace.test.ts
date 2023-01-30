import { initialState } from '../../reducer'
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
import { palace } from '../palace'

describe('buildings/palace', () => {
  describe('palace', () => {
    const p0: Tableau = {
      color: PlayerColor.Blue,
      clergy: ['PRIB'] as Clergy[],
      settlements: [],
      landscape: [
        [[], [], ['P', 'LPE'], ['P', 'LFO'], ['P', 'LFO'], ['P'], ['H', 'LB1'], [], []],
        [['W'], ['C'], ['P', 'LPE'], ['P', 'LFO'], ['P', 'LB2'], ['P'], ['P', 'LB3', 'LB2B'], [], []],
        [['W'], ['C', 'G26', 'LB1B'], [], [], [], [], []],
      ] as Tile[][],
      landscapeOffset: 0,
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
      wine: 1,
      beer: 0,
      reliquary: 0,
    }
    const p1: Tableau = {
      color: PlayerColor.Red,
      clergy: ['LB2R'] as Clergy[],
      settlements: [],
      landscape: [
        [[], [], [], [], [], [], [], ['H'], ['M', 'G28', 'PRIR']],
        [[], [], ['P', 'LPE'], ['P', 'LFO'], ['P', 'LFO'], ['P'], ['H', 'LR1'], ['H', 'F27'], ['.']],
        [[], [], ['P', 'LPE'], ['P', 'LFO'], ['P', 'LR2'], ['P'], ['P', 'LR3', 'LB1R'], [], []],
      ] as Tile[][],
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
    const p2: Tableau = {
      color: PlayerColor.Green,
      clergy: ['LB1G', 'LG2G'] as Clergy[],
      settlements: [],
      landscape: [
        [[], [], ['P', 'LPE'], ['P', 'LFO'], ['P', 'G19', 'PRIG'], ['H'], ['H'], [], []],
        [[], [], ['P', 'LPE'], ['P', 'LFO'], ['P', 'LFO'], ['P'], ['H', 'LG1'], [], []],
        [[], [], ['P', 'LPE'], ['P', 'LFO'], ['P', 'LG2'], ['P'], ['P', 'LG3'], [], []],
      ] as Tile[][],
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
      activePlayerIndex: 0,
      config: {
        country: 'france',
        players: 3,
        length: 'long',
      },
      rondel: {
        pointingBefore: 3,
        grape: 1,
        joker: 2,
      },
      players: [p0, p1, p2],
      settling: false,
      extraRound: false,
      moveInRound: 1,
      round: 1,
      startingPlayer: 1,
      settlementRound: SettlementRound.S,
      buildings: [],
      nextUse: NextUseClergy.Any,
      canBuyLandscape: true,
      plotPurchasePrices: [1, 1, 1, 1, 1, 1],
      districtPurchasePrices: [],
      neutralBuildingPhase: false,
    }

    it('can take grapes', () => {
      const s1 = palace('Wn')(s0)! as GameStatePlaying
      expect(s1.players[0]).toMatchObject({
        wine: 0,
      })
      expect(s1.nextUse).toBe('free')
      expect(s1.usableBuildings?.sort()).toStrictEqual(['LB3', 'G26', 'LR3', 'G28', 'G19'].sort())
    })
  })
})
