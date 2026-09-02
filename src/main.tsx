import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createSprintRoutes } from './app/routes'
import { DayFourPage } from './days/day-4/DayFourPage'
import { sprintDays } from './days/sprintDays'
import './app/app.css'

const router = createBrowserRouter(
  createSprintRoutes(sprintDays, [
    {
      path: '/day-4',
      element: <DayFourPage />,
    },
  ]),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
