import { useCallback, useEffect, useReducer, useRef } from 'react'
import { searchService } from './search/searchService'
import {
  initialSearchState,
  searchReducer,
} from './state/searchReducer'

export const SEARCH_DEBOUNCE_MS = 250

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

export function useWorkshopSearch() {
  const [state, dispatch] = useReducer(searchReducer, initialSearchState)
  const activeControllerRef = useRef<AbortController | null>(null)
  const requestSequenceRef = useRef(0)

  const changeQuery = useCallback((query: string) => {
    activeControllerRef.current?.abort()
    activeControllerRef.current = null
    dispatch({ type: 'QUERY_CHANGED', query })
  }, [])

  useEffect(() => {
    if (state.status !== 'debouncing') {
      return
    }

    const query = state.query.trim()
    const timeoutId = window.setTimeout(() => {
      const controller = new AbortController()
      const requestId = `search-${++requestSequenceRef.current}`

      activeControllerRef.current = controller
      dispatch({ type: 'REQUEST_STARTED', requestId })

      void searchService
        .search({ query, signal: controller.signal })
        .then((results) => {
          dispatch({ type: 'REQUEST_SUCCEEDED', requestId, results })
        })
        .catch((error: unknown) => {
          if (isAbortError(error)) {
            return
          }

          dispatch({
            type: 'REQUEST_FAILED',
            requestId,
            message: getErrorMessage(error),
          })
        })
        .finally(() => {
          if (activeControllerRef.current === controller) {
            activeControllerRef.current = null
          }
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [state.query, state.status])

  useEffect(
    () => () => {
      activeControllerRef.current?.abort()
    },
    [],
  )

  return { state, changeQuery }
}
