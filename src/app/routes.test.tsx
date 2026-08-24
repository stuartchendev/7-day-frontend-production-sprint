import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { SprintDay } from '../days/types'
import { createSprintRoutes } from './routes'

function DayOneDemo() {
  return <h1>Day 1 demo</h1>
}

const dayOne: SprintDay = {
  day: 1,
  slug: 'day-1',
  title: 'Knowledge Base Search',
  summary: 'A production-minded async search experience.',
  publishedOn: '2026-08-24',
  Component: DayOneDemo,
}

function renderRoute(path: string, days: SprintDay[] = []) {
  const router = createMemoryRouter(createSprintRoutes(days), {
    initialEntries: [path],
  })

  return render(<RouterProvider router={router} />)
}

describe('Sprint routes', () => {
  it('shows the reviewed empty state before a demo is published', () => {
    renderRoute('/')

    expect(
      screen.getByRole('heading', {
        name: 'Seven focused builds. One production story.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('0 of 7 demos published')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Open demo' })).not.toBeInTheDocument()
  })

  it('derives the index link and daily route from the same registry entry', async () => {
    const user = userEvent.setup()
    renderRoute('/', [dayOne])

    expect(screen.getByLabelText('1 of 7 demos published')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Open demo' }))
    expect(screen.getByRole('heading', { name: 'Day 1 demo' })).toBeInTheDocument()
  })

  it('returns unknown paths to the Sprint Index', async () => {
    const user = userEvent.setup()
    renderRoute('/not-published')

    await user.click(screen.getByRole('link', { name: 'Back to Sprint Index' }))
    expect(
      screen.getByRole('heading', {
        name: 'Seven focused builds. One production story.',
      }),
    ).toBeInTheDocument()
  })
})
