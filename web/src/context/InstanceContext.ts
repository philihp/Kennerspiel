'use client'

import { control, GameState, GameStatePlaying, initialState, reducer } from 'hathora-et-labora-game'
import { createContext, createElement, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { REALTIME_LISTEN_TYPES, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, User } from '@supabase/supabase-js'
import { Enums, Tables } from '@/supabase.types'
import { useSupabaseContext } from './SupabaseContext'
import { reject } from 'ramda'
import { Controls, GameStateSetup, GameStatusEnum, PlayerColor } from 'hathora-et-labora-game/dist/types'
import { match } from 'ts-pattern'
import { serverMove } from './actions'

const engineColorToEntrantColor = (c?: PlayerColor): Enums<'color'> | undefined =>
  match<PlayerColor | undefined, Enums<'color'> | undefined>(c)
    .with(PlayerColor.Red, () => 'red')
    .with(PlayerColor.Green, () => 'green')
    .with(PlayerColor.Blue, () => 'blue')
    .with(PlayerColor.White, () => 'white')
    .with(undefined, () => undefined)
    .exhaustive()

type InstanceContextType = {
  instance: Tables<'instance'>
  entrants: Tables<'entrant'>[]
  user?: User
  rawState?: GameState
  state?: GameStatePlaying
  partial: string[]
  controls?: Controls
  commands: string[]
  active: boolean
  addPartial: (command: string) => void
  clearPartial: () => void
  move: () => Promise<void>
  undo?: () => void
  redo?: () => void
}

type InstanceContextProviderProps = {
  user: User | null
  instance: Tables<'instance'>
  entrants: Tables<'entrant'>[]
  children: ReactNode | ReactNode[]
}

const InstanceContext = createContext<InstanceContextType>(
  {} as InstanceContextType
  // the "as InstanceContextType" here means it is possible instance might have an unchecked undefined
  // however since the InstanceContextProviderProps will always be setting this, it should be fine
)

export const InstanceContextProvider = ({
  children,
  user,
  instance: providedInstance,
  entrants: providedEntrants,
}: InstanceContextProviderProps) => {
  const { supabase } = useSupabaseContext()
  const [instance, setInstance] = useState<Tables<'instance'>>(providedInstance)
  const [entrants, setEntrants] = useState<Tables<'entrant'>[]>(providedEntrants)
  const [partial, setPartial] = useState<string[]>([])
  const [commands, setCommands] = useState<string[]>(providedInstance.commands)

  const instanceId = instance.id

  useEffect(() => {
    const channel = supabase
      ?.channel('schema-db-changes')
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          table: 'instance',
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
          schema: 'public',
          filter: `id=eq.${instanceId}`,
        },
        (payload) => {
          console.log('instance update', { payload })
          setInstance(payload.new as Tables<'instance'>)
          setCommands(payload.new.commands)
          // maybe setPartial([])
        }
      )
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          table: 'entrant',
          event: '*',
          schema: 'public',
          filter: `instance_id=eq.${instanceId}`,
        },
        (payload) => {
          switch (payload.eventType) {
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT:
              setEntrants([...entrants, payload.new as Tables<'entrant'>])
              break
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE:
              setEntrants([...reject<Tables<'entrant'>>((entrant) => entrant.id === payload.old.id)(entrants)])
              break
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE:
              setEntrants([
                ...reject<Tables<'entrant'>>((entrant) => entrant.id === payload.old.id)(entrants),
                payload.new as Tables<'entrant'>,
              ])
              break
          }
        }
      )
      .subscribe()
    return () => {
      channel?.unsubscribe()
    }
  }, [supabase, instanceId, entrants])

  const gameState = useMemo(() => {
    console.log('memoizzing', commands)
    return [...commands]
      .map((s) => s.split(' '))
      .reduce<
        GameState | undefined
      >(reducer as (state: GameState | undefined, [command, ...params]: string[]) => GameState | undefined, initialState)
  }, [commands])

  const controls = useMemo(() => {
    if (gameState?.status !== GameStatusEnum.PLAYING) return undefined
    return control(gameState as GameStatePlaying, partial)
  }, [gameState, partial])

  const addPartial = (command: string) => {
    setPartial([...partial, ...command.split(' ').filter((s) => s)])
  }
  const clearPartial = () => {
    setPartial([])
  }

  const move = async () => {
    const { error, commands: newCommands } = await serverMove(instance.id, [...commands, partial.join(' ')])
    if (error) return console.error(error)
    setCommands(newCommands ?? commands)
    setPartial([])
  }

  const undo =
    commands.length <= 2
      ? undefined
      : () => {
          setCommands(instance.commands.slice(0, Math.max(2, commands.length - 1)))
          setPartial([])
        }

  const redo =
    commands.length === instance.commands.length
      ? undefined
      : () => {
          setCommands(instance.commands.slice(0, commands.length + 1))
          setPartial([])
        }

  const activeColor = gameState?.players?.[(gameState as GameStatePlaying)?.frame?.activePlayerIndex]?.color
  const entrant = entrants.find((e) => e.color === engineColorToEntrantColor(activeColor))
  const active = !!user && entrant?.profile_id === user?.id

  return createElement(
    InstanceContext.Provider,
    {
      value: {
        user: user === null ? undefined : user,
        instance,
        entrants,
        rawState: gameState,
        state: gameState as GameStatePlaying,
        partial,
        controls,
        commands,
        active,
        addPartial,
        clearPartial,
        move,
        undo,
        redo,
      },
    },
    children
  )
}

export const useInstanceContext = () => useContext(InstanceContext)
