import type { ComponentType } from 'react'

export type SprintDayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type SprintDay = {
  day: SprintDayNumber
  slug: `day-${SprintDayNumber}`
  title: string
  summary: string
  publishedOn: string
  Component: ComponentType
}
