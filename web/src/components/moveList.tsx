import { addIndex, collectBy, find, flatten, map, range } from 'ramda'
import React from 'react'
import { useInstanceContext } from '@/context/InstanceContext'
import { Flower, PlayerColor } from 'hathora-et-labora-game/dist/types'
import { Tables } from '@/supabase.types'
import { Frame } from './frame'

const resetStyle = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  textIndent: 0,
  listStyleType: 'none',
}

type ColorStyle = {
  backgroundColor?: string
  borderColor?: string
}

const sameColor = (playerColor?: PlayerColor) => (entrant: Tables<'entrant'>) => {
  switch (playerColor) {
    case PlayerColor.Blue:
      return entrant.color === 'blue'
    case PlayerColor.Red:
      return entrant.color === 'red'
    case PlayerColor.Green:
      return entrant.color === 'green'
    case PlayerColor.White:
      return entrant.color === 'white'
    default:
      return false
  }
}

const colorToStyle = (c?: string): ColorStyle => {
  switch (c) {
    case 'B':
      return { borderColor: '#80b1d3' } // , borderColor: '#5f849e' }
    case 'R':
      return { borderColor: '#fb8072' } // , borderColor: '#ad574d' }
    case 'G':
      return { borderColor: '#b3de69' } // , borderColor: '#87a74f' }
    case 'W':
      return { borderColor: '#d9d9d9' } // , borderColor: '#b1b1b1' }
    default:
      return {}
  }
}

export const MoveList = () => {
  const { controls, state, instance, entrants } = useInstanceContext()
  if (controls === undefined) return <>Missing Controls</>

  const moves = instance.commands.slice(2)

  const handleUndo = () => {
    console.log('undo')
  }
  const handleRedo = () => {
    console.log('redo')
  }

  const flow = collectBy((f) => `${f.round}`, controls?.flow ?? [])

  return (
    <div>
      {/* {EngineColor[state?.users?.find((u) => u.id === state?.me?.id)?.color ?? -1]}
      <br /> */}
      <div style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
        {map(
          (i) => {
            const active = i === state?.frame?.activePlayerIndex
            const current = i === state?.frame?.currentPlayerIndex
            const player = state?.players?.[i]
            const score = controls?.score?.[i]
            const user = find(sameColor(player?.color), entrants ?? [])
            return (
              <div key={`player:${i}`} style={{ display: 'flex', gap: 4, alignItems: 'center', flexDirection: 'row' }}>
                <div style={{ minWidth: 20 }}>
                  {current && '🏵️'}
                  {!current && active && '⌚️'}
                </div>
                <div
                  title={user?.id}
                  style={{
                    ...colorToStyle(user?.color),
                    height: 32,
                    width: 32,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderStyle: 'solid',
                  }}
                >
                  {' '}
                </div>
                <div style={{}}>
                  {score?.total} points
                  {score?.settlements?.length !== 0 && (
                    <div style={{ fontSize: 'x-small' }}>Settlements: {score?.settlements?.join(', ')}</div>
                  )}
                </div>
              </div>
            )
          },
          range(0, controls?.score?.length ?? 0)
        )}
      </div>

      <hr />

      {controls === undefined && (
        <div>Waiting on {[state?.players?.[state?.frame?.activePlayerIndex ?? -1]?.color ?? -1]}...</div>
      )}
      {controls !== undefined && (
        <>
          <button type="button" onClick={handleUndo}>
            &#x25C0; Undo
          </button>
          <button type="button" onClick={handleRedo}>
            Redo &#x25B6;
          </button>
        </>
      )}

      <hr />

      <ul style={resetStyle}>
        {moves.map((m, i) => (
          <li key={`${i}:${m}`} style={{ fontFamily: 'monospace' }}>
            {m}
          </li>
        ))}
        {addIndex(map<Flower, React.JSX.Element>)(
          (frame: Flower, n: number) => (
            <Frame key={n} frame={frame} />
          ),
          flatten(flow)
        )}
      </ul>
    </div>
  )
}
