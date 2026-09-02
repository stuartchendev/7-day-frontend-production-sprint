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
            {publishedDays.map((sprintDay) => {

              return (

                <li key={sprintDay.slug}>
                  <article className="sprint-card">
                    {/*
                    Demo clip follows the public/videos/dayXdemo-clip.mp4 convention.
                  */}
                    <video
                      className="sprint-card__video"
                      autoPlay
                      muted
                      loop
                      playsInline
                      aria-hidden="true"
                    >
                      <source
                        src={`/videos/day${sprintDay.day}demo-clip.mp4`}
                        type="video/mp4"
                      />
                    </video>
                    <div className="sprint-card__content">
                      <p className="sprint-card__meta">
                        Day {sprintDay.day} · {sprintDay.publishedOn}
                      </p>
                      <h3>{sprintDay.title}</h3>
                      <p>{sprintDay.summary}</p>
                      <Link className="sprint-card__link" to={`/${sprintDay.slug}`}>Open demo</Link>
                    </div>
                  </article>
                </li>
              )
            })}
          </ol>
        )
        }
      </section>
      <footer className="site-footer">
        <p>7-Day Frontend Production Sprint</p>

        <nav aria-label="Footer">
          <a
            href="https://github.com/stuartchendev/7-day-frontend-production-sprint"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Repo
          </a>

          <a
            href="https://github.com/stuartchendev"
            target="_blank"
            rel="noreferrer"
          >
            Built by Stuart 🫣🐧
          </a>
        </nav>
      </footer>
    </main >
  )
}
