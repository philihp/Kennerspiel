import { Clergy, GameState, GameStatePlaying, PlayerColor, Tableau } from '../types'

export const clergyForColor = (color: PlayerColor): Clergy[] => {
  switch (color) {
    case PlayerColor.Red:
      return [Clergy.LayBrother1R, Clergy.LayBrother2R, Clergy.PriorR]
    case PlayerColor.Green:
      return [Clergy.LayBrother1G, Clergy.LayBrother2G, Clergy.PriorG]
    case PlayerColor.Blue:
      return [Clergy.LayBrother1B, Clergy.LayBrother2B, Clergy.PriorB]
    case PlayerColor.White:
      return [Clergy.LayBrother1W, Clergy.LayBrother2W, Clergy.PriorW]
    default:
      return []
  }
}

export const getPlayer = (
  { players, activePlayerIndex }: GameStatePlaying,
  playerIndex?: number
): Tableau | undefined => players[playerIndex ?? activePlayerIndex]

export const setPlayer = (state: GameStatePlaying, player: Tableau, playerIndex?: number): GameStatePlaying => {
  if (state.players === undefined) return state
  const i = playerIndex || state.activePlayerIndex
  return {
    ...state,
    players: [...state.players.slice(0, i), player, ...state.players.slice(i + 1)],
  }
}
