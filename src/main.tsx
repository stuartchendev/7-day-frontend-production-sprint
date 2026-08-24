import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createSprintRoutes } from './app/routes'
import { DayOnePage } from './days/day-1/DayOnePage'
import { sprintDays } from './days/sprintDays'
import './app/app.css'

const router = createBrowserRouter(
  createSprintRoutes(sprintDays, [
    {
      path: '/day-1',
      element: <DayOnePage />,
    },
  ]),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
