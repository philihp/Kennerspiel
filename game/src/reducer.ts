import { match, P } from 'ts-pattern'
import { build } from './commands/build'
import { commit } from './commands/commit'
import { config } from './commands/config'
import { convert } from './commands/convert'
import { cutPeat } from './commands/cutPeat'
import { fellTrees } from './commands/fellTrees'
import { start } from './commands/start'
import { use } from './commands/use'
import {
  BuildingEnum,
  GameCommandEnum,
  GameConfigCountry,
  GameConfigLength,
  GameConfigPlayers,
  GameState,
  GameStatePlaying,
  GameStateSetup,
  GameStatusEnum,
  PlayerColor,
  Reducer,
} from './types'
import { parseResourceParam } from './board/resource'
import { withPrior } from './commands/withPrior'
import { buyPlot } from './commands/buyPlot'
import { buyDistrict } from './commands/buyDistrict'

export const initialState: GameStateSetup = {
  randGen: 0n,
  status: GameStatusEnum.SETUP,
}

const PColor = P.union(PlayerColor.Blue, PlayerColor.White, PlayerColor.Red, PlayerColor.Green)
const PPlot = P.union('MOUNTAIN', 'COAST')
const PDistrict = P.union('HILLS', 'PLAINS')

export const reducer: Reducer = (state, action) => {
  return match<string[], GameState | undefined>(action) // .
    .with(
      [GameCommandEnum.CONFIG, P.union('1', '2', '3', '4'), P.union('ireland', 'france'), P.union('short', 'long')],
      ([_, players, country, length]) =>
        config(state as GameStateSetup, {
          players: Number.parseInt(players, 10) as GameConfigPlayers,
          length: length as GameConfigLength,
          country: country as GameConfigCountry,
        })
    )
    .with(
      [GameCommandEnum.START, P.string, PColor],
      [GameCommandEnum.START, P.string, PColor, PColor],
      [GameCommandEnum.START, P.string, PColor, PColor, PColor],
      [GameCommandEnum.START, P.string, PColor, PColor, PColor, PColor],
      ([_, unparsedSeed, ...colors]) =>
        start(state as GameStateSetup, {
          seed: Number.parseInt(unparsedSeed, 10),
          colors: colors as PlayerColor[],
        })
    )
    .with(
      [GameCommandEnum.CUT_PEAT, P.string, P.string],
      [GameCommandEnum.CUT_PEAT, 'Jo', P.string, P.string],
      ([_, col, row, useJoker]) =>
        cutPeat({
          col: Number.parseInt(col, 10),
          row: Number.parseInt(row, 10),
          useJoker: useJoker === 'Jo',
        })(state as GameStatePlaying)
    )
    .with(
      [GameCommandEnum.FELL_TREES, P.string, P.string],
      [GameCommandEnum.FELL_TREES, P.string, P.string, 'Jo'],
      ([_, col, row, useJoker]) =>
        fellTrees({
          col: Number.parseInt(col, 10),
          row: Number.parseInt(row ?? '', 10),
          useJoker: useJoker === 'Jo',
        })(state as GameStatePlaying)
    )
    .with([GameCommandEnum.BUILD, P.string, P.string, P.string], ([_, building, col, row]) =>
      build({
        building: building as BuildingEnum,
        col: Number.parseInt(col, 10),
        row: Number.parseInt(row, 10),
      })(state as GameStatePlaying)
    )
    .with([GameCommandEnum.WITH_PRIOR], () => withPrior(state as GameStatePlaying))
    .with(
      [GameCommandEnum.USE, P.string],
      [GameCommandEnum.USE, P.string, P.string],
      [GameCommandEnum.USE, P.string, P.string, P.string],
      [GameCommandEnum.USE, P.string, P.string, P.string, P.string],
      [GameCommandEnum.USE, P.string, P.string, P.string, P.string, P.string],
      [GameCommandEnum.USE, P.string, P.string, P.string, P.string, P.string, P.string],
      [GameCommandEnum.USE, P.string, P.string, P.string, P.string, P.string, P.string, P.string],
      [GameCommandEnum.USE, P.string, P.string, P.string, P.string, P.string, P.string, P.string, P.string],
      [GameCommandEnum.USE, P.string, P.string, P.string, P.string, P.string, P.string, P.string, P.string, P.string],
      ([_command, building, ...params]) => {
        return use(building as BuildingEnum, params)(state as GameStatePlaying)
      }
    )
    .with([GameCommandEnum.BUY_PLOT, P._, PPlot], ([_, y, side]) =>
      buyPlot({
        y: Number.parseInt(y, 10),
        side: side as 'MOUNTAIN' | 'COAST',
      })(state as GameStatePlaying)
    )
    .with([GameCommandEnum.BUY_DISTRICT, P._, PDistrict], ([_, y, side]) =>
      buyDistrict({
        y: Number.parseInt(y, 10),
        side: side as 'HILLS' | 'PLAINS',
      })(state as GameStatePlaying)
    )
    .with([GameCommandEnum.CONVERT, P.select('resources')], ({ resources }) =>
      convert(parseResourceParam(resources))(state as GameStatePlaying)
    )
    .with([GameCommandEnum.COMMIT], () => commit(state as GameStatePlaying))
    .otherwise((command) => {
      throw new Error(`Unable to parse [${command.join(',')}]`)
    })
}
