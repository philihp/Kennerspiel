import { GameStatePlaying, Tableau } from '../../types'
import { druidsHouse } from '../druidsHouse'

describe('buildings/druidsHouse', () => {
  describe('druidsHouse', () => {
    const p0 = {
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
      malt: 0,
      coal: 0,
      book: 1,
      ceramic: 0,
      whiskey: 0,
      straw: 0,
      meat: 0,
      ornament: 0,
      bread: 0,
      wine: 0,
      beer: 0,
      reliquary: 0,
    } as Tableau
    const s0 = {
      frame: {
        activePlayerIndex: 0,
      },
      players: [{ ...p0 }],
    } as GameStatePlaying

    it('works as normal', () => {
      const s1 = druidsHouse('Bo', 'WoWoWoWoWoPtPtPt')(s0)! as GameStatePlaying
      expect(s1.players[0]).toMatchObject({
        book: 0,
        wood: 5,
        peat: 3,
      })
    })

    it('works noop undefined input', () => {
      const s1 = druidsHouse()(s0)! as GameStatePlaying
      expect(s1).toBe(s0)
    })

    it('works noop empty string input', () => {
      const s1 = druidsHouse('', '')(s0)! as GameStatePlaying
      expect(s1).toBe(s0)
    })

    it('does not allow eight of an output', () => {
      const s1 = druidsHouse('Bo', 'GnGnGnGnGnGnGnGn')(s0)! as GameStatePlaying
      expect(s1).toBeUndefined()
    })

    it('does not allow four and four', () => {
      const s1 = druidsHouse('Bo', 'WoWoWoWoClClClCl')(s0)! as GameStatePlaying
      expect(s1).toBeUndefined()
    })

    it('does not allow five of one, but none of another', () => {
      const s1 = druidsHouse('Bo', 'PnPnPnPnPn')(s0)! as GameStatePlaying
      expect(s1).toBeUndefined()
    })

    it('does not allow non-basic goods', () => {
      const s1 = druidsHouse('Bo', 'PnPnPnPnPnRqRqRq')(s0)! as GameStatePlaying
      expect(s1).toBeUndefined()
    })
  })
})
