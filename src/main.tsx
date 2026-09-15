import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createSprintRoutes } from './app/routes'
import { sprintDays } from './days/sprintDays'
import {DaySixPage} from './days/day-6/DaySixPage'
import './app/app.css'

const router = createBrowserRouter(
  createSprintRoutes(sprintDays, [
    {
      path: '/day-6',
      element: <DaySixPage />,
    },
  ]),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
