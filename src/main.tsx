import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createSprintRoutes } from './app/routes'
import { DayFivePage } from './days/day-5/DayFivePage'
import { sprintDays } from './days/sprintDays'
import './app/app.css'

const router = createBrowserRouter(
  createSprintRoutes(sprintDays, [
    {
      path: '/day-5',
      element: <DayFivePage />,
    },
  ]),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
