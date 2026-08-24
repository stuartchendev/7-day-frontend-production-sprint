import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="route-message">
      <p className="sprint-index__eyebrow">Demo not found</p>
      <h1>This Sprint route is not available.</h1>
      <p>The demo may not have been published yet.</p>
      <Link to="/">Back to Sprint Index</Link>
    </main>
  )
}
