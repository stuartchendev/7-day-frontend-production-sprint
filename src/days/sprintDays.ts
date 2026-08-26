import { DayOnePage } from './day-1/DayOnePage'
import { DayTwoPage } from './day-2/DayTwoPage'
import type { SprintDay } from './types'

/**
 * Add a day only after its implementation, verification, and evidence are ready.
 * The index and router are derived from this single registry.
 */
export const sprintDays: SprintDay[] = [
  {
    day: 1,
    slug: 'day-1',
    title: 'Knowledge Base Search',
    summary: 'A production-minded async search experience.',
    publishedOn: '2026-08-24',
    Component: DayOnePage,
  },
  {
    day: 2,
    slug: 'day-2',
    title: 'Profile Sync Workspace',
    summary: 'A failed save rolls back neither the draft nor the server truth. Each copy keeps the state it actually owns.',
    publishedOn: '2026-08-25',
    Component: DayTwoPage,
  },
]
