import { SignalPanel } from './observability/SignalPanel'
import { useSignalPresentationQueue } from './observability/useSignalPresentationQueue'
import { useWorkshopSearch } from './useWorkshopSearch'

export function DayOnePage() {
  const { currentEvent, enqueueEvent } = useSignalPresentationQueue()
  const { state, changeQuery } = useWorkshopSearch({ onEvent: enqueueEvent })
  const hasResults = state.results.length > 0
  const isSearching = state.status === 'debouncing' || state.status === 'loading'
  const isUpdating = hasResults && isSearching
  const showResults = hasResults && state.status !== 'idle'

  return (
    <main className="day-one-layout">
      <SignalPanel state={state} currentEvent={currentEvent} />

      <section
        className="knowledge-base"
        aria-labelledby="knowledge-base-title"
      >
        <header className="knowledge-base__header">
          <p className="sprint-index__eyebrow">Day 1 · Workshop support</p>
          <h1 id="knowledge-base-title">Workshop Studio Knowledge Base</h1>
          <p>
            Find practical answers about bookings, payments, studio policies, and
            preparing for your visit.
          </p>
        </header>

        <section
          className="knowledge-search"
          aria-labelledby="knowledge-search-title"
        >
          <h2 id="knowledge-search-title">Search the studio guide</h2>
          <label htmlFor="knowledge-search-input">Search articles</label>
          <input
            id="knowledge-search-input"
            type="search"
            value={state.query}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="Try “cancellation” or “beginner”"
            aria-describedby="knowledge-search-hint"
            autoComplete="off"
          />
          <p id="knowledge-search-hint" className="knowledge-search__hint">
            Enter at least 2 characters.
          </p>

          <div
            className="knowledge-search__feedback"
            aria-live="polite"
            aria-busy={isSearching}
          >
            {state.status === 'idle' && (
              <p>Search the guide when you have a workshop question.</p>
            )}
            {state.status === 'debouncing' && !hasResults && (
              <p role="status">Preparing your search…</p>
            )}
            {state.status === 'loading' && !hasResults && (
              <p role="status">Searching the knowledge base…</p>
            )}
            {isUpdating && <p role="status">Updating results…</p>}
            {state.status === 'success' && !hasResults && (
              <p>No articles found for “{state.query.trim()}”.</p>
            )}
            {state.status === 'error' && <p role="alert">{state.error}</p>}
          </div>

          {showResults && (
            <section className="knowledge-results" aria-labelledby="results-title">
              <h2 id="results-title">
                {state.status === 'success'
                  ? `Search results (${state.results.length})`
                  : 'Previous results'}
              </h2>
              <ul>
                {state.results.map((article) => (
                  <li key={article.id}>
                    <article className="knowledge-card">
                      <p className="knowledge-card__category">{article.category}</p>
                      <h3>{article.title}</h3>
                      <p>{article.summary}</p>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      </section>
    </main>
  )
}
