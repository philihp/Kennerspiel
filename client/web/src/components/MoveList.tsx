import { useHathoraContext } from '../context/GameContext'

const resetStyle = {
  fontFamily: 'monospace',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  textIndent: 0,
  listStyleType: 'none',
}

export const MoveList = () => {
  const { state, control } = useHathoraContext()
  return (
    <div>
      <button type="button" onClick={() => control('')}>
        Reset Control
      </button>
      <ul style={resetStyle}>
        {state?.moves.map((m, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`${i}:${m}`} style={resetStyle}>
            {m}
          </li>
        ))}
      </ul>
    </div>
  )
}
