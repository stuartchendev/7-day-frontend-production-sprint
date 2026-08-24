import type { ReactNode } from 'react'
import type { SearchState } from '../state/searchReducer'
import type { SearchEvent } from './searchEvents'

type SignalPanelProps = {
  state: SearchState
  currentEvent: SearchEvent | null
}

type StageState =
  | 'resting'
  | 'ready'
  | 'active'
  | 'observed'
  | 'accepted'
  | 'ignored'
  | 'aborted'
  | 'error'
  | 'owner'

type SignalStageProps = {
  label: string
  step: string
  state: StageState
  children: ReactNode
  className?: string
  presented?: boolean
}

const eventLabels: Record<SearchEvent['type'], string> = {
  REQUEST_STARTED: 'Request started',
  REQUEST_ABORTED: 'Request aborted',
  RESPONSE_ACCEPTED: 'Response accepted',
  RESPONSE_IGNORED: 'Response ignored',
}

const eventDescriptions: Record<SearchEvent['type'], string> = {
  REQUEST_STARTED: 'The request entered the async boundary.',
  REQUEST_ABORTED: 'The obsolete request stopped without becoming an error.',
  RESPONSE_ACCEPTED: 'The current owner passed the response gate.',
  RESPONSE_IGNORED: 'A stale response reached the gate and was discarded.',
}

function displayValue(value: string | null) {
  return value && value.length > 0 ? value : '—'
}

function SignalStage({
  label,
  step,
  state,
  children,
  className = '',
  presented = false,
}: SignalStageProps) {
  return (
    <section
      className={`signal-stage ${className}`.trim()}
      data-state={state}
      data-presented={presented}
      role="group"
      aria-label={`${label} stage`}
    >
      <div className="signal-stage__heading">
        <span>{step}</span>
        <strong>{label}</strong>
      </div>
      <div className="signal-stage__content">{children}</div>
      <span className="signal-stage__state">{state}</span>
    </section>
  )
}

export function SignalPanel({ state, currentEvent }: SignalPanelProps) {
  const query = state.query.trim()
  const eventType = currentEvent?.type ?? null
  const eventRequestId = currentEvent?.requestId ?? null
  const isRequestStarted = eventType === 'REQUEST_STARTED'
  const isRequestAborted = eventType === 'REQUEST_ABORTED'
  const isResponseAccepted = eventType === 'RESPONSE_ACCEPTED'
  const isResponseIgnored = eventType === 'RESPONSE_IGNORED'
  const isResponsePresented = isResponseAccepted || isResponseIgnored
  const presentationKey = currentEvent
    ? `${currentEvent.type}:${currentEvent.requestId}:${currentEvent.timestamp}`
    : 'signal-idle'

  const inputState: StageState = query.length > 0 ? 'ready' : 'resting'
  const debounceState: StageState =
    state.status === 'debouncing' ? 'active' : 'resting'

  let requestState: StageState = 'resting'
  if (state.status === 'loading') {
    requestState = 'active'
  } else if (eventType === 'REQUEST_ABORTED') {
    requestState = 'aborted'
  } else if (eventType === 'REQUEST_STARTED') {
    requestState = 'observed'
  }

  let gateState: StageState = 'resting'
  if (eventType === 'RESPONSE_ACCEPTED') {
    gateState = 'accepted'
  } else if (eventType === 'RESPONSE_IGNORED') {
    gateState = 'ignored'
  } else if (state.status === 'error') {
    gateState = 'error'
  }

  const renderState: StageState =
    state.renderedRequestId === null ? 'resting' : 'owner'
  const acceptedBranchState =
    eventType === 'RESPONSE_ACCEPTED'
      ? 'accepted'
      : renderState === 'owner'
        ? 'owner'
        : 'resting'
  const ignoredBranchState =
    eventType === 'RESPONSE_IGNORED' ? 'ignored' : 'resting'
  const abortPathState =
    eventType === 'REQUEST_ABORTED' ? 'aborted' : 'resting'

  return (
    <aside className="signal-panel" aria-labelledby="signal-panel-title">
      <header className="signal-panel__header">
        <div className="signal-panel__title">
          <p className="signal-panel__eyebrow">Async engine · live trace</p>
          <h2 id="signal-panel-title">Signal flow</h2>
        </div>
        <p>
          Canonical state shows what is true now. The highlighted trace explains
          what just happened.
        </p>
      </header>

      <div className="signal-panel__now" aria-label="Current search state">
        <span className="signal-panel__status" data-status={state.status}>
          {state.status}
        </span>
        <p>
          <span>Query</span>
          <strong>{query || 'Waiting for input'}</strong>
        </p>
      </div>

      <div
        key={presentationKey}
        className="signal-flow"
        aria-label="Async request lifecycle"
      >
        <SignalStage label="Input" step="01" state={inputState}>
          <code>{query || 'empty'}</code>
        </SignalStage>

        <div className="signal-connector" data-active={debounceState === 'active'}>
          <span aria-hidden="true" />
        </div>

        <SignalStage label="Debounce" step="02" state={debounceState}>
          <span>250 ms intent window</span>
        </SignalStage>

        <div
          className="signal-connector"
          data-active={requestState === 'active' || isRequestStarted}
          data-presented={isRequestStarted}
        >
          <span aria-hidden="true" />
        </div>

        <SignalStage
          label="Request"
          step="03"
          state={requestState}
          presented={isRequestStarted}
        >
          <span>Active request</span>
          <code>{displayValue(state.activeRequestId)}</code>
          {state.activeRequestId === null && eventRequestId !== null && (
            <small>Observed {eventRequestId}</small>
          )}
        </SignalStage>

        <div
          className="signal-abort-path"
          data-state={abortPathState}
          data-presented={isRequestAborted}
          aria-label="Abort path"
        >
          <span aria-hidden="true" />
          <strong>Cancelled path</strong>
          <small>normal concurrency control</small>
        </div>

        <div
          className="signal-connector"
          data-active={gateState === 'accepted' || gateState === 'ignored'}
          data-presented={isResponsePresented}
        >
          <span aria-hidden="true" />
        </div>

        <SignalStage
          label="Response gate"
          step="04"
          state={gateState}
          className="signal-stage--gate"
          presented={isResponsePresented}
        >
          <span>Reducer ownership check</span>
          {eventRequestId !== null && <code>{eventRequestId}</code>}
        </SignalStage>

        <div className="signal-branches" aria-label="Response gate outcomes">
          <div
            className="signal-branch signal-branch--accepted"
            data-state={acceptedBranchState}
            data-presented={isResponseAccepted}
            role="group"
            aria-label="Accepted branch"
          >
            <span className="signal-branch__route" aria-hidden="true" />
            <SignalStage
              label="Render owner"
              step="05A"
              state={renderState}
              presented={isResponseAccepted}
            >
              <span>Visible results owned by</span>
              <code>{displayValue(state.renderedRequestId)}</code>
            </SignalStage>
          </div>

          <div
            className="signal-branch signal-branch--ignored"
            data-state={ignoredBranchState}
            data-presented={isResponseIgnored}
            role="group"
            aria-label="Ignored branch"
          >
            <span className="signal-branch__route" aria-hidden="true" />
            <div className="signal-terminal">
              <span>05B</span>
              <strong>Ignored</strong>
              <small>stale response</small>
            </div>
          </div>
        </div>
      </div>

      <section
        className="signal-panel__event"
        aria-labelledby="signal-event-title"
        aria-live="polite"
      >
        <p id="signal-event-title">Presented lifecycle event</p>
        {currentEvent === null ? (
          <strong>Waiting for a request</strong>
        ) : (
          <>
            <div className="signal-panel__event-summary">
              <strong>{eventLabels[currentEvent.type]}</strong>
              <code>{currentEvent.requestId}</code>
              {'elapsedMs' in currentEvent && (
                <small>{Math.round(currentEvent.elapsedMs)} ms</small>
              )}
            </div>
            <span>{eventDescriptions[currentEvent.type]}</span>
          </>
        )}
      </section>
    </aside>
  )
}
