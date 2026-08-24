import { Link } from 'react-router-dom'
import type { SprintDay } from '../days/types'

type SprintIndexPageProps = {
  days: SprintDay[]
}

export function SprintIndexPage({ days }: SprintIndexPageProps) {
  const publishedDays = [...days].sort((a, b) => a.day - b.day)

  return (
    <main className="sprint-index">
      <header className="sprint-index__hero">
        <p className="sprint-index__eyebrow">7-Day Frontend Production Sprint</p>
        <h1>Seven focused builds. One production story.</h1>
        <p className="sprint-index__intro">
          A time-boxed series of frontend projects built around clear user flows,
          production-minded state handling, and reviewable delivery evidence.
        </p>
      </header>

      <section className="sprint-index__progress" aria-labelledby="progress-title">
        <div>
          <p
            className="sprint-index__count"
            aria-label={`${publishedDays.length} of 7 demos published`}
          >
            <strong>{publishedDays.length}</strong>
            <span>/ 7 demos published</span>
          </p>
          <h2 id="progress-title">Sprint demos</h2>
        </div>

        {publishedDays.length === 0 ? (
          <p className="sprint-index__empty">
            Completed demos will appear here after their scope, tests, and evidence
            have been reviewed.
          </p>
        ) : (
          <ol className="sprint-index__grid">
            {publishedDays.map((sprintDay) => (
              <li key={sprintDay.slug}>
                <article className="sprint-card">
                  <p className="sprint-card__meta">
                    Day {sprintDay.day} · {sprintDay.publishedOn}
                  </p>
                  <h3>{sprintDay.title}</h3>
                  <p>{sprintDay.summary}</p>
                  <Link to={`/${sprintDay.slug}`}>Open demo</Link>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}
