import { reducer, initialState } from '../../reducer'
import { GameStatePlaying } from '../../types'

describe('buildings/market', () => {
  describe('use', () => {
    it('goes through a happy path', () => {
      const s0 = initialState
      const s1 = reducer(s0, ['CONFIG', '1', 'france', 'short'])!
      const s2 = reducer(s1, ['START', '42', 'R'])! as GameStatePlaying
      s2.players[0] = {
        ...s2.players[0],
        stone: 2,
        straw: 1,
        clay: 1,
        peat: 1,
        penny: 1,
      }
      const s3 = reducer(s2, ['BUILD', 'F08', '3', '1'])! as GameStatePlaying
      expect(s3.players[0].landscape[1][3]).toStrictEqual(['P', 'F08'])
      const s4 = reducer(s3, ['USE', 'F08', 'SwClPtPn'])! as GameStatePlaying
      expect(s4).toBeDefined()
      expect(s4.players[0]).toMatchObject({
        straw: 0,
        clay: 0,
        peat: 0,
        bread: 1,
        nickel: 1,
        penny: 2,
      })
    })
  })
})
