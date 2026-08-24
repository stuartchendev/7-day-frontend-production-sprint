import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MOCK_SEARCH_FAILURE_MESSAGE,
  MOCK_SEARCH_FAILURE_QUERY,
  MOCK_SEARCH_LATENCY_MS,
} from './mockSearchAdapter'
import { searchService } from './searchService'

describe('searchService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function completeSearch(query: string) {
    const search = searchService.search({ query })
    await vi.advanceTimersByTimeAsync(MOCK_SEARCH_LATENCY_MS)
    return search
  }

  it('matches article fields case-insensitively', async () => {
    const results = await completeSearch('PAYMENTS')

    expect(results.map(({ id }) => id)).toContain('payments-and-receipts')
  })

  it('matches keyword-only terms', async () => {
    const results = await completeSearch('FIRST-TIMER')

    expect(results.map(({ id }) => id)).toEqual(['beginner-friendly-workshops'])
  })

  it('resolves successfully with an empty list when nothing matches', async () => {
    await expect(completeSearch('glass blowing')).resolves.toEqual([])
  })

  it('rejects promptly with AbortError when intentionally aborted', async () => {
    const controller = new AbortController()
    const search = searchService.search({
      query: 'booking',
      signal: controller.signal,
    })
    const aborted = expect(search).rejects.toMatchObject({ name: 'AbortError' })

    controller.abort()

    await aborted
  })

  it('provides a deterministic real failure path', async () => {
    const search = searchService.search({ query: MOCK_SEARCH_FAILURE_QUERY })
    const failed = expect(search).rejects.toThrow(MOCK_SEARCH_FAILURE_MESSAGE)

    await vi.advanceTimersByTimeAsync(MOCK_SEARCH_LATENCY_MS)

    await failed
  })
})
