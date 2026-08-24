import { useCallback, useEffect, useReducer } from 'react'
import type { SearchEvent } from './searchEvents'

export const SIGNAL_STEP_MS = 900

type SignalQueueState = {
  currentEvent: SearchEvent | null
  pendingEvents: SearchEvent[]
}

type SignalQueueAction =
  | { type: 'ENQUEUE'; event: SearchEvent }
  | { type: 'ADVANCE' }

const initialSignalQueueState: SignalQueueState = {
  currentEvent: null,
  pendingEvents: [],
}

function signalQueueReducer(
  state: SignalQueueState,
  action: SignalQueueAction,
): SignalQueueState {
  switch (action.type) {
    case 'ENQUEUE':
      if (state.currentEvent === null) {
        return {
          ...state,
          currentEvent: action.event,
        }
      }

      return {
        ...state,
        pendingEvents: [...state.pendingEvents, action.event],
      }

    case 'ADVANCE': {
      const [nextEvent = null, ...remainingEvents] = state.pendingEvents
      return {
        currentEvent: nextEvent,
        pendingEvents: remainingEvents,
      }
    }
  }
}

export function useSignalPresentationQueue() {
  const [state, dispatch] = useReducer(
    signalQueueReducer,
    initialSignalQueueState,
  )

  const enqueueEvent = useCallback((event: SearchEvent) => {
    dispatch({ type: 'ENQUEUE', event })
  }, [])

  useEffect(() => {
    if (state.currentEvent === null) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'ADVANCE' })
    }, SIGNAL_STEP_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [state.currentEvent])

  return {
    currentEvent: state.currentEvent,
    enqueueEvent,
  }
}
