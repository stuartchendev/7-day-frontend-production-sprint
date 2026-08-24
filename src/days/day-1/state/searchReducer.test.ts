import { describe, expect, it } from 'vitest'
import type { KnowledgeArticle } from '../types'
import {
  initialSearchState,
  searchReducer,
  type SearchState,
} from './searchReducer'

function createArticle(id: string): KnowledgeArticle {
  return {
    id,
    title: `Article ${id}`,
    summary: `Summary ${id}`,
    category: 'Booking',
    keywords: [id],
  }
}

function createState(overrides: Partial<SearchState> = {}): SearchState {
  return {
    ...initialSearchState,
    ...overrides,
  }
}

describe('searchReducer', () => {
  it('enters debouncing for a valid query without clearing rendered results', () => {
    const results = [createArticle('previous')]
    const state = createState({
      query: 'old query',
      status: 'loading',
      results,
      activeRequestId: 'request-old',
      renderedRequestId: 'request-rendered',
    })

    const nextState = searchReducer(state, {
      type: 'QUERY_CHANGED',
      query: '  clay  ',
    })

    expect(nextState).toMatchObject({
      query: '  clay  ',
      status: 'debouncing',
      activeRequestId: null,
      renderedRequestId: 'request-rendered',
    })
    expect(nextState.results).toBe(results)
  })

  it('returns to idle for a query shorter than two trimmed characters', () => {
    const state = createState({ status: 'debouncing' })

    expect(
      searchReducer(state, { type: 'QUERY_CHANGED', query: ' a ' }),
    ).toMatchObject({
      query: ' a ',
      status: 'idle',
      activeRequestId: null,
    })
  })

  it('establishes the active request owner when a request starts', () => {
    const results = [createArticle('previous')]
    const state = createState({
      status: 'error',
      results,
      renderedRequestId: 'request-rendered',
      error: 'Previous failure',
    })

    const nextState = searchReducer(state, {
      type: 'REQUEST_STARTED',
      requestId: 'request-current',
    })

    expect(nextState).toMatchObject({
      status: 'loading',
      activeRequestId: 'request-current',
      renderedRequestId: 'request-rendered',
      error: null,
    })
    expect(nextState.results).toBe(results)
  })

  it('ignores a stale success without changing state or render ownership', () => {
    const state = createState({
      status: 'loading',
      results: [createArticle('current')],
      activeRequestId: 'request-current',
      renderedRequestId: 'request-rendered',
    })

    const nextState = searchReducer(state, {
      type: 'REQUEST_SUCCEEDED',
      requestId: 'request-stale',
      results: [createArticle('stale')],
    })

    expect(nextState).toBe(state)
  })

  it('accepts the current owner success and updates render ownership', () => {
    const results = [createArticle('next')]
    const state = createState({
      status: 'loading',
      results: [createArticle('previous')],
      activeRequestId: 'request-current',
      renderedRequestId: 'request-previous',
      error: 'Previous failure',
    })

    const nextState = searchReducer(state, {
      type: 'REQUEST_SUCCEEDED',
      requestId: 'request-current',
      results,
    })

    expect(nextState).toMatchObject({
      status: 'success',
      results,
      activeRequestId: null,
      renderedRequestId: 'request-current',
      error: null,
    })
  })

  it('ignores a stale failure without changing the current state', () => {
    const state = createState({
      status: 'loading',
      activeRequestId: 'request-current',
    })

    const nextState = searchReducer(state, {
      type: 'REQUEST_FAILED',
      requestId: 'request-stale',
      message: 'Stale failure',
    })

    expect(nextState).toBe(state)
  })

  it('accepts the current owner failure and enters error', () => {
    const results = [createArticle('previous')]
    const state = createState({
      status: 'loading',
      results,
      activeRequestId: 'request-current',
      renderedRequestId: 'request-rendered',
    })

    const nextState = searchReducer(state, {
      type: 'REQUEST_FAILED',
      requestId: 'request-current',
      message: 'Search failed',
    })

    expect(nextState).toMatchObject({
      status: 'error',
      activeRequestId: null,
      renderedRequestId: 'request-rendered',
      error: 'Search failed',
    })
    expect(nextState.results).toBe(results)
  })

  it('restores the initial search state', () => {
    const state = createState({
      query: 'clay',
      status: 'success',
      results: [createArticle('result')],
      renderedRequestId: 'request-current',
    })

    expect(searchReducer(state, { type: 'RESET' })).toBe(initialSearchState)
  })
})
