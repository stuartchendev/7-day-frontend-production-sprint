import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SearchEvent } from './observability/searchEvents'
import {
  SEARCH_DEBOUNCE_MS,
  useWorkshopSearch,
  type WorkshopSearchService,
} from './useWorkshopSearch'
import type { KnowledgeArticle } from './types'

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

function createArticle(id: string): KnowledgeArticle {
  return {
    id,
    title: `Article ${id}`,
    summary: `Summary ${id}`,
    category: 'Booking',
    keywords: [id],
  }
}

async function advanceDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS)
  })
}

describe('useWorkshopSearch lifecycle events', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('emits request start and accepted response events', async () => {
    const response = createDeferred<KnowledgeArticle[]>()
    const events: SearchEvent[] = []
    const service: WorkshopSearchService = {
      search: vi.fn(() => response.promise),
    }
    const { result } = renderHook(() =>
      useWorkshopSearch({
        service,
        onEvent: (event) => events.push(event),
      }),
    )

    act(() => {
      result.current.changeQuery('booking')
    })
    await advanceDebounce()

    expect(events.map(({ type }) => type)).toEqual(['REQUEST_STARTED'])

    await act(async () => {
      response.resolve([createArticle('accepted')])
      await response.promise
      await Promise.resolve()
    })

    expect(events.map(({ type }) => type)).toEqual([
      'REQUEST_STARTED',
      'RESPONSE_ACCEPTED',
    ])
    expect(result.current.state.renderedRequestId).toBe('search-1')
  })

  it('emits abort and ignored events without changing render ownership', async () => {
    const response = createDeferred<KnowledgeArticle[]>()
    const events: SearchEvent[] = []
    const service: WorkshopSearchService = {
      search: vi.fn(() => response.promise),
    }
    const { result } = renderHook(() =>
      useWorkshopSearch({
        service,
        onEvent: (event) => events.push(event),
      }),
    )

    act(() => {
      result.current.changeQuery('booking')
    })
    await advanceDebounce()

    act(() => {
      result.current.changeQuery('payments')
    })

    expect(events.map(({ type }) => type)).toEqual([
      'REQUEST_STARTED',
      'REQUEST_ABORTED',
    ])

    await act(async () => {
      response.resolve([createArticle('stale')])
      await response.promise
      await Promise.resolve()
    })

    expect(events.map(({ type }) => type)).toEqual([
      'REQUEST_STARTED',
      'REQUEST_ABORTED',
      'RESPONSE_IGNORED',
    ])
    expect(result.current.state.results).toEqual([])
    expect(result.current.state.renderedRequestId).toBeNull()
  })
})
