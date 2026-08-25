import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createSprintRoutes } from './app/routes'
import { DayTwoPage } from './days/day-2/DayTwoPage'
import { sprintDays } from './days/sprintDays'
import './app/app.css'

const router = createBrowserRouter(
  createSprintRoutes(sprintDays, [
    {
      path: '/day-2',
      element: <DayTwoPage />,
    },
  ]),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
