# Day 5 — Admin / Approval Dashboard

A small service ticket management dashboard built with React + TypeScript to make workflow state, allowed actions, and state transitions observable.

Day 5 focuses on modeling a ticket workflow with **TypeScript discriminated unions, state-specific data, explicit transitions, and invalid-state prevention** rather than building a complete ticketing system.

## What it demonstrates

* Typed workflow states with TypeScript discriminated unions
* State-specific data, such as `blockReason` for blocked tickets
* Explicit workflow transitions
* Reducer-based state transformation
* Canonical ticket state with derived counts and filtered views
* Persistent transition history
* Recent Activity derived from ticket history
* UI actions constrained by the current ticket state

## Workflow

The observable Day 5 workflow is:

```text
Processing
   │
   ├─ Resolve
   │    ↓
   │  Resolved
   │
   └─ Block
        ↓
      Blocked
        │
      Resume
        ↓
    Processing
```

### Resolved

`Resolved` is the terminal state for this demo.

Once a ticket is resolved, no further processing action is exposed.

### Blocked

A blocked ticket requires a `blockReason`.

```text
Processing
    ↓
  Block
    ↓
Blocked + blockReason
    ↓
  Resume
    ↓
Processing
```

Resuming removes the active `blockReason` from the current ticket state while retaining the previous block information in transition history.

**Blocked ≠ Done.**

A blocked ticket represents work that cannot currently proceed, not completed work.

## Data flow

The dashboard keeps the ticket collection as the canonical source of truth:

```text
tickets
   ↓
selectedStatus
   ↓
filteredTickets
   ↓
selectedTicket
   ↓
Ticket Detail / History
```

Status counts and filtered ticket lists are derived from the canonical ticket collection rather than stored as duplicated state.

Ticket detail also reads the existing ticket and its history. Opening a ticket does not initialize or recreate its history.

Recent Activity is derived from existing transition history instead of maintaining a separate activity dataset.

## State and transition design

The domain model uses a discriminated union so state-specific fields are represented by the type system:

```ts
type Ticket = BaseTicket & (
  {
    status: 'processing'
    handling: string
  }
  | {
    status: 'blocked'
    handling: string
    blockReason: string
  }
  | {
    status: 'resolved'
    handling: string
  }
)
```

This makes `blockReason` part of the blocked state rather than an optional field that could exist on every ticket.

The reducer is responsible for applying state transformations:

```text
user action
    ↓
transition validation
    ↓
ticketReducer
    ↓
new ticket state
    ↓
derived UI
    ↓
history / activity
```

Validation and state transformation are intentionally kept as separate responsibilities: the validation layer determines whether an action is allowed, while the reducer applies the resulting transition.

## History as workflow trace

Each transition appends an entry to the ticket's existing history.

For example:

```text
Block
  ↓
Blocked
  ↓
Resume
  ↓
Processing
```

The original block reason remains observable through the history even after the active `blockReason` is removed.

This keeps workflow history attached to the ticket rather than creating a separate source of truth for past actions.

## Verification

Core reducer behavior is covered by behavior tests for:

* Processing → Resolved
* Processing → Blocked with `blockReason`
* Blocked → Processing with the active `blockReason` removed
* Existing history preserved when a new transition is appended
* Resume retaining the previous block information in history

The test suite is focused on observable workflow behavior rather than implementation details.

## Limitations

This is a frontend workflow demonstration, not a production ticketing backend.

The demo does not include:

* Authentication or role management
* Backend persistence
* Database integration
* Real API calls
* Notifications
* Pagination
* Full-text search
* Production ticket intake
* Advanced filtering beyond status navigation

The ticket data and workflow behavior are simulated locally so the state model and UI consequences can be demonstrated deterministically.

## Demo flow

To explore the main workflow:

```text
Dashboard
  ↓
Processing
  ↓
Open a ticket
  ↓
View Detail / Transition history
  ↓
Resolve
  ↓
Resolved
  ↓
Observe count and Recent Activity updates
```

To explore the blocked workflow:

```text
Processing
  ↓
Open a ticket
  ↓
Block
  ↓
Blocked + blockReason
  ↓
Resume
  ↓
Processing
  ↓
Verify previous block information remains in history
```

## Engineering focus

The goal of Day 5 is not to reproduce a complete admin product.

It is to make one small workflow explicit and defensible:

```text
state
  ↓
allowed action
  ↓
user event
  ↓
transition
  ↓
new state
  ↓
derived UI
  ↓
history / activity
```

The implementation deliberately keeps the state model small so that the relationship between domain rules, state transitions, and visible UI behavior remains easy to verify.
