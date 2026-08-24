import { DayOnePage } from './day-1/DayOnePage'
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
]
