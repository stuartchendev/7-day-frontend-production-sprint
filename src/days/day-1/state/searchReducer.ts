import type { KnowledgeArticle } from '../types'

export type SearchStatus =
  | 'idle'
  | 'debouncing'
  | 'loading'
  | 'success'
  | 'error'

export type SearchState = {
  query: string
  status: SearchStatus
  results: KnowledgeArticle[]
  activeRequestId: string | null
  renderedRequestId: string | null
  error: string | null
}

export type SearchAction =
  | { type: 'QUERY_CHANGED'; query: string }
  | { type: 'REQUEST_STARTED'; requestId: string }
  | {
      type: 'REQUEST_SUCCEEDED'
      requestId: string
      results: KnowledgeArticle[]
    }
  | {
      type: 'REQUEST_FAILED'
      requestId: string
      message: string
    }
  | { type: 'RESET' }

export const initialSearchState: SearchState = {
  query: '',
  status: 'idle',
  results: [],
  activeRequestId: null,
  renderedRequestId: null,
  error: null,
}

export function searchReducer(
  state: SearchState,
  action: SearchAction,
): SearchState {
  switch (action.type) {
    case 'QUERY_CHANGED':
      return {
        ...state,
        query: action.query,
        status: action.query.trim().length < 2 ? 'idle' : 'debouncing',
        activeRequestId: null,
        error: null,
      }

    case 'REQUEST_STARTED':
      return {
        ...state,
        status: 'loading',
        activeRequestId: action.requestId,
        error: null,
      }

    case 'REQUEST_SUCCEEDED':
      if (action.requestId !== state.activeRequestId) {
        return state
      }

      return {
        ...state,
        status: 'success',
        results: action.results,
        activeRequestId: null,
        renderedRequestId: action.requestId,
        error: null,
      }

    case 'REQUEST_FAILED':
      if (action.requestId !== state.activeRequestId) {
        return state
      }

      return {
        ...state,
        status: 'error',
        activeRequestId: null,
        error: action.message,
      }

    case 'RESET':
      return initialSearchState
  }
}
