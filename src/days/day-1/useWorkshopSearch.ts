import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { SearchEvent } from './observability/searchEvents'
import type { SearchRequest } from './search/searchAdapter'
import { searchService } from './search/searchService'
import {
  initialSearchState,
  searchReducer,
  type SearchAction,
  type SearchState,
} from './state/searchReducer'
import type { KnowledgeArticle } from './types'

export const SEARCH_DEBOUNCE_MS = 250

export type WorkshopSearchService = {
  search(request: SearchRequest): Promise<KnowledgeArticle[]>
}

type UseWorkshopSearchOptions = {
  onEvent?: (event: SearchEvent) => void
  service?: WorkshopSearchService
}

type ActiveRequest = {
  controller: AbortController
  requestId: string
  startedAt: number
}

type ResponseObservation = {
  sequence: number
  requestId: string
  accepted: boolean
  elapsedMs: number
  timestamp: number
}

type OrchestrationState = {
  searchState: SearchState
  responseObservation: ResponseObservation | null
  responseSequence: number
}

type OrchestrationAction = {
  searchAction: SearchAction
  response?: Omit<ResponseObservation, 'sequence' | 'accepted'>
}

const initialOrchestrationState: OrchestrationState = {
  searchState: initialSearchState,
  responseObservation: null,
  responseSequence: 0,
}

function orchestrationReducer(
  state: OrchestrationState,
  action: OrchestrationAction,
): OrchestrationState {
  const nextSearchState = searchReducer(state.searchState, action.searchAction)

  if (action.response) {
    const responseSequence = state.responseSequence + 1
    return {
      searchState: nextSearchState,
      responseSequence,
      responseObservation: {
        ...action.response,
        sequence: responseSequence,
        accepted: nextSearchState !== state.searchState,
      },
    }
  }

  if (nextSearchState === state.searchState) {
    return state
  }

  return {
    ...state,
    searchState: nextSearchState,
  }
}

function isAbortError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Search failed. Please try again.'
}

export function useWorkshopSearch({
  onEvent,
  service = searchService,
}: UseWorkshopSearchOptions = {}) {
  const [orchestrationState, dispatch] = useReducer(
    orchestrationReducer,
    initialOrchestrationState,
  )
  const activeRequestRef = useRef<ActiveRequest | null>(null)
  const requestSequenceRef = useRef(0)
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const state = orchestrationState.searchState

  const abortActiveRequest = useCallback((emitEvent = true) => {
    const activeRequest = activeRequestRef.current

    if (activeRequest === null) {
      return
    }

    activeRequestRef.current = null
    activeRequest.controller.abort()

    if (emitEvent) {
      onEventRef.current?.({
        type: 'REQUEST_ABORTED',
        requestId: activeRequest.requestId,
        timestamp: Date.now(),
      })
    }
  }, [])

  const changeQuery = useCallback(
    (query: string) => {
      abortActiveRequest()
      dispatch({
        searchAction: { type: 'QUERY_CHANGED', query },
      })
    },
    [abortActiveRequest],
  )

  useEffect(() => {
    const observation = orchestrationState.responseObservation

    if (observation === null) {
      return
    }

    onEventRef.current?.({
      type: observation.accepted ? 'RESPONSE_ACCEPTED' : 'RESPONSE_IGNORED',
      requestId: observation.requestId,
      elapsedMs: observation.elapsedMs,
      timestamp: observation.timestamp,
    })
  }, [orchestrationState.responseObservation])

  useEffect(() => {
    if (state.status !== 'debouncing') {
      return
    }

    const query = state.query.trim()
    const timeoutId = window.setTimeout(() => {
      const controller = new AbortController()
      const requestId = `search-${++requestSequenceRef.current}`
      const startedAt = performance.now()

      activeRequestRef.current = {
        controller,
        requestId,
        startedAt,
      }
      dispatch({
        searchAction: { type: 'REQUEST_STARTED', requestId },
      })
      onEventRef.current?.({
        type: 'REQUEST_STARTED',
        requestId,
        timestamp: Date.now(),
      })

      void service
        .search({ query, signal: controller.signal })
        .then((results) => {
          const elapsedMs = Math.max(0, performance.now() - startedAt)
          dispatch({
            searchAction: {
              type: 'REQUEST_SUCCEEDED',
              requestId,
              results,
            },
            response: {
              requestId,
              elapsedMs,
              timestamp: Date.now(),
            },
          })
        })
        .catch((error: unknown) => {
          if (isAbortError(error)) {
            return
          }

          dispatch({
            searchAction: {
              type: 'REQUEST_FAILED',
              requestId,
              message: getErrorMessage(error),
            },
          })
        })
        .finally(() => {
          if (activeRequestRef.current?.requestId === requestId) {
            activeRequestRef.current = null
          }
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [service, state.query, state.status])

  useEffect(
    () => () => {
      abortActiveRequest(false)
    },
    [abortActiveRequest],
  )

  return { state, changeQuery }
}
