import type { SearchState } from '../state/searchReducer'
import type { SearchEvent } from './searchEvents'

type SignalPanelProps = {
  state: SearchState
  currentEvent: SearchEvent | null
}

const eventLabels: Record<SearchEvent['type'], string> = {
  REQUEST_STARTED: 'Request started',
  REQUEST_ABORTED: 'Request aborted',
  RESPONSE_ACCEPTED: 'Response accepted',
  RESPONSE_IGNORED: 'Response ignored',
}

function displayValue(value: string | null) {
  return value && value.length > 0 ? value : '—'
}

export function SignalPanel({ state, currentEvent }: SignalPanelProps) {
  return (
    <aside className="signal-panel" aria-labelledby="signal-panel-title">
      <p className="signal-panel__eyebrow">Developer observability</p>
      <h2 id="signal-panel-title">Signal Panel</h2>

      <dl className="signal-panel__facts">
        <div>
          <dt>Status</dt>
          <dd>{state.status}</dd>
        </div>
        <div>
          <dt>Query</dt>
          <dd>{displayValue(state.query)}</dd>
        </div>
        <div>
          <dt>Active request</dt>
          <dd>
            <code>{displayValue(state.activeRequestId)}</code>
          </dd>
        </div>
        <div>
          <dt>Rendered request</dt>
          <dd>
            <code>{displayValue(state.renderedRequestId)}</code>
          </dd>
        </div>
      </dl>

      <section
        className="signal-panel__event"
        aria-labelledby="signal-event-title"
        aria-live="polite"
      >
        <h3 id="signal-event-title">Lifecycle event</h3>
        {currentEvent === null ? (
          <p>No lifecycle event yet.</p>
        ) : (
          <>
            <p className="signal-panel__event-name">
              {eventLabels[currentEvent.type]}
            </p>
            <p>
              <code>{currentEvent.requestId}</code>
            </p>
            {'elapsedMs' in currentEvent && (
              <p>{Math.round(currentEvent.elapsedMs)} ms</p>
            )}
          </>
        )}
      </section>
    </aside>
  )
}
