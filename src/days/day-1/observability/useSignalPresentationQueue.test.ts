import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SearchEvent } from './searchEvents'
import {
  SIGNAL_STEP_MS,
  useSignalPresentationQueue,
} from './useSignalPresentationQueue'

const startedEvent: SearchEvent = {
  type: 'REQUEST_STARTED',
  requestId: 'search-1',
  timestamp: 100,
}

const acceptedEvent: SearchEvent = {
  type: 'RESPONSE_ACCEPTED',
  requestId: 'search-1',
  elapsedMs: 320,
  timestamp: 420,
}

describe('useSignalPresentationQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('presents lifecycle events in enqueue order for a readable step', async () => {
    const { result } = renderHook(() => useSignalPresentationQueue())

    act(() => {
      result.current.enqueueEvent(startedEvent)
      result.current.enqueueEvent(acceptedEvent)
    })

    expect(result.current.currentEvent).toBe(startedEvent)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SIGNAL_STEP_MS)
    })

    expect(result.current.currentEvent).toBe(acceptedEvent)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SIGNAL_STEP_MS)
    })

    expect(result.current.currentEvent).toBeNull()
  })
})
