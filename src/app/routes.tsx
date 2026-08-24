import type { RouteObject } from 'react-router-dom'
import type { SprintDay } from '../days/types'
import { NotFoundPage } from './NotFoundPage'
import { SprintIndexPage } from './SprintIndexPage'

export function createSprintRoutes(
  days: SprintDay[],
  inProgressRoutes: RouteObject[] = [],
): RouteObject[] {
  return [
    {
      path: '/',
      element: <SprintIndexPage days={days} />,
    },
    ...days.map(({ slug, Component }) => ({
      path: `/${slug}`,
      element: <Component />,
    })),
    ...inProgressRoutes,
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ]
}
