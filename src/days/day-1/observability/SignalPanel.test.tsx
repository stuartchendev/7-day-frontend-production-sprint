import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { SearchState } from '../state/searchReducer'
import { SignalPanel } from './SignalPanel'
import type { SearchEvent } from './searchEvents'

const loadingState: SearchState = {
  query: 'payments',
  status: 'loading',
  results: [],
  activeRequestId: 'search-4',
  renderedRequestId: 'search-3',
  error: null,
}

function renderPanel(
  state: SearchState = loadingState,
  currentEvent: SearchEvent | null = null,
) {
  return render(<SignalPanel state={state} currentEvent={currentEvent} />)
}

describe('SignalPanel lifecycle schematic', () => {
  it('shows the in-flight request separately from the current render owner', () => {
    const { container } = renderPanel()

    expect(screen.getByRole('group', { name: 'Request stage' })).toHaveAttribute(
      'data-state',
      'active',
    )
    expect(
      screen.getByRole('group', { name: 'Render owner stage' }),
    ).toHaveAttribute('data-state', 'owner')
    expect(screen.getByText('search-4')).toBeInTheDocument()
    expect(screen.getByText('search-3')).toBeInTheDocument()
    expect(container.querySelector('[data-presented="true"]')).toBeNull()
  })

  it('assigns request-path motion only to a presented request event', () => {
    renderPanel(loadingState, {
      type: 'REQUEST_STARTED',
      requestId: 'search-4',
      timestamp: 420,
    })

    expect(screen.getByRole('group', { name: 'Request stage' })).toHaveAttribute(
      'data-presented',
      'true',
    )
  })

  it.each([
    ['RESPONSE_ACCEPTED', 'Accepted branch', 'accepted'],
    ['RESPONSE_IGNORED', 'Ignored branch', 'ignored'],
  ] as const)('maps %s onto its response-gate branch', (type, branch, state) => {
    renderPanel(loadingState, {
      type,
      requestId: 'search-4',
      elapsedMs: 320,
      timestamp: 420,
    })

    expect(screen.getByRole('group', { name: branch })).toHaveAttribute(
      'data-state',
      state,
    )
    expect(screen.getByRole('group', { name: branch })).toHaveAttribute(
      'data-presented',
      'true',
    )
    expect(
      screen.getByRole('group', { name: 'Response gate stage' }),
    ).toHaveAttribute('data-presented', 'true')
  })

  it('represents intentional abort as a cancelled request path', () => {
    renderPanel(loadingState, {
      type: 'REQUEST_ABORTED',
      requestId: 'search-4',
      timestamp: 420,
    })

    expect(screen.getByLabelText('Abort path')).toHaveAttribute(
      'data-state',
      'aborted',
    )
    expect(screen.getByLabelText('Abort path')).toHaveAttribute(
      'data-presented',
      'true',
    )
    expect(screen.getByText('Cancelled path')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
