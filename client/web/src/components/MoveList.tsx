import { collectBy } from 'ramda'
import { useHathoraContext } from '../context/GameContext'
import { Picker } from './Picker'
import { EngineColor } from '../../../../api/types'

const resetStyle = {
  fontFamily: 'monospace',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  textIndent: 0,
  listStyleType: 'none',
}

const colorToChar = (color?: EngineColor): string => {
  switch (color) {
    case EngineColor.Red:
      return 'R'
    case EngineColor.Blue:
      return 'B'
    case EngineColor.Green:
      return 'G'
    case EngineColor.White:
      return 'W'
    default:
      return ''
  }
}

type ColorStyle = {
  backgroundColor?: string
  borderColor?: string
}

const colorToStyle = (c?: EngineColor): ColorStyle => {
  switch (c) {
    case EngineColor.Blue:
      return { borderColor: '#80b1d3' } // , borderColor: '#5f849e' }
    case EngineColor.Red:
      return { borderColor: '#fb8072' } // , borderColor: '#ad574d' }
    case EngineColor.Green:
      return { borderColor: '#b3de69' } // , borderColor: '#87a74f' }
    case EngineColor.White:
      return { borderColor: '#d9d9d9' } // , borderColor: '#b1b1b1' }
    default:
      return {}
  }
}

export const MoveList = () => {
  const { state, user } = useHathoraContext()

  const flow = collectBy((f) => `${f.round}`, state?.flow ?? [])
  return (
    <div style={{ paddingTop: 20 }}>
      {EngineColor[state?.users?.find((u) => u.id === state?.me?.id)?.color ?? -1]}
      <br />
      <img
        alt={user?.name}
        src={user?.picture}
        height="64"
        width="64"
        style={{ ...colorToStyle(state?.me?.color), borderRadius: 32, borderWidth: 6, borderStyle: 'solid' }}
      />

      <ul style={resetStyle}>
        {state?.moves.map((m, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`${i}:${m}`} style={resetStyle}>
            {m}
          </li>
        ))}

        <li style={{ fontWeight: 'bold' }}>
          <hr />
          {state?.control?.partial}
          <Picker />
          <hr />
        </li>

        {flow.map((roundFrames) =>
          roundFrames.map((frame) => (
            <li>
              {frame.settle && `Settle ${frame.player}`}
              {!frame.settle && frame.bonus && `Bonus ${colorToChar(frame.player)}`}
              {!frame.settle && !frame.bonus && `Round ${frame.round} ${colorToChar(frame.player)}`}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
