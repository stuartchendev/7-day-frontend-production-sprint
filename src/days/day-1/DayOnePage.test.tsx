import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MOCK_SEARCH_FAILURE_MESSAGE,
  MOCK_SEARCH_FAILURE_QUERY,
  MOCK_SEARCH_LATENCY_MS,
} from './search/mockSearchAdapter'
import { DayOnePage } from './DayOnePage'
import { SEARCH_DEBOUNCE_MS } from './useWorkshopSearch'

async function advanceTime(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds)
  })
}

describe('DayOnePage search orchestration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function setup() {
    render(<DayOnePage />)
    return screen.getByRole('searchbox', { name: 'Search articles' })
  }

  function changeQuery(input: HTMLElement, query: string) {
    fireEvent.change(input, { target: { value: query } })
  }

  async function completePendingSearch() {
    await advanceTime(SEARCH_DEBOUNCE_MS)
    await advanceTime(MOCK_SEARCH_LATENCY_MS)
  }

  it('keeps the latest rapid query result and treats abort as normal control flow', async () => {
    const input = setup()

    changeQuery(input, 'booking')
    await advanceTime(SEARCH_DEBOUNCE_MS)
    expect(screen.getByText('Searching the knowledge base…')).toBeInTheDocument()

    changeQuery(input, 'payments')
    await completePendingSearch()

    expect(
      screen.getByRole('heading', { name: 'Payments, deposits, and receipts' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Booking a workshop session' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await advanceTime(MOCK_SEARCH_LATENCY_MS)
    expect(
      screen.getByRole('heading', { name: 'Payments, deposits, and receipts' }),
    ).toBeInTheDocument()
  })

  it('keeps rendered results visible while a newer search updates', async () => {
    const input = setup()

    changeQuery(input, 'payments')
    await completePendingSearch()
    expect(
      screen.getByRole('heading', { name: 'Payments, deposits, and receipts' }),
    ).toBeInTheDocument()

    changeQuery(input, 'beginner')

    expect(screen.getByText('Updating results…')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Payments, deposits, and receipts' }),
    ).toBeInTheDocument()

    await completePendingSearch()
    expect(
      screen.getByRole('heading', {
        name: 'Are workshops suitable for beginners?',
      }),
    ).toBeInTheDocument()
  })

  it('renders a real current-request failure', async () => {
    const input = setup()

    changeQuery(input, MOCK_SEARCH_FAILURE_QUERY)
    await completePendingSearch()

    expect(screen.getByRole('alert')).toHaveTextContent(MOCK_SEARCH_FAILURE_MESSAGE)
  })

  it('renders a successful empty result state', async () => {
    const input = setup()

    changeQuery(input, 'glass blowing')
    await completePendingSearch()

    expect(
      screen.getByText('No articles found for “glass blowing”.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
