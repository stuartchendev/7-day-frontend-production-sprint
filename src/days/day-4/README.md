# Day 4 — Booking / Reservation

## Overview

A minimal restaurant booking flow designed to model real-world booking uncertainty.

The demo focuses on:

* Availability snapshots
* Booking lifecycle state
* HTTP-like success and failure semantics
* Temporary failures and retry behavior
* Booking conflicts
* Reservation persistence within the client session
* Separating operation state from domain data and UI feedback

This is intentionally **not a full booking product**.

## Demo

Live demo: To be added.

![Day 4 preview](...)

## User Flow

### Successful booking

```text
Select date
    ↓
Select available time
    ↓
Reserve
    ↓
Loading
    ↓
Success
```

### Temporary failure

```text
Select date
    ↓
Select available time
    ↓
Reserve
    ↓
Loading
    ↓
503 Temporary failure
    ↓
Retry
    ↓
Loading
    ↓
Result
```

### Booking conflict

```text
Select date
    ↓
Select available time
    ↓
Reserve
    ↓
Loading
    ↓
409 Conflict
    ↓
Choose another time
```

A conflict is not retried because the selected slot is no longer valid.

---

## Architecture

The booking flow is intentionally split into three responsibilities:

```text
selectedDate
    ↓
availability adapter
    ↓
availability snapshot
    ↓
Booking Form
    ↓ selectedTime
handleReserve
    ↓
booking adapter
    ↓
HTTP-like result
    ├── 200 → bookingStatus + reservations[]
    ├── 503 → bookingStatus
    └── 409 → bookingStatus

bookingStatus → Result Panel
reservations[] → Reservation List
```

### Availability adapter

`getAvailability(date)` simulates an external availability source.

The UI consumes the returned snapshot through:

```text
availability.slots
```

The Booking Form does not maintain a second copy of the slot data.

### Booking adapter

`reserveTable(date, time)` simulates the server boundary and returns HTTP-like outcomes:

| Status | Meaning                   | UI behavior                                               |
| ------ | ------------------------- | --------------------------------------------------------- |
| `200`  | Booking succeeded         | Store reservation and show confirmation                   |
| `503`  | Temporary service failure | Expose Retry                                              |
| `409`  | Booking conflict          | Mark slot unavailable and ask user to choose another time |

---

## State Design

The booking state is kept intentionally small and semantic.

```text
selectedDate
selectedTime
availability
bookingStatus
reservations
confirmation
```

`bookingStatus` represents the lifecycle of the **current operation**:

```text
idle
  ↓
loading
  ├── success
  ├── temporary-error
  └── conflict
```

### Why `bookingStatus`, `reservations`, and `confirmation` are separate

These values have different lifecycles:

* `bookingStatus` — what is happening with the current booking operation
* `reservations` — what has been successfully booked
* `confirmation` — the latest successful booking that the UI still needs to communicate

This allows the operation to return to `idle` without losing the confirmation UI or the confirmed reservation.

> `bookingStatus` describes what is happening, `reservations` describes what has happened, and `confirmation` describes what just happened that the UI still needs to communicate.

### Reducer-driven state transitions

The booking flow uses a reducer to make state transitions explicit and predictable.

```text
reserve-start
    ↓
loading
    ├── reserve-success → success
    ├── reserve-temporary-error → temporary-error
    └── reserve-conflict → conflict

select-date
    ↓
idle + clear selected time / availability / confirmation
```

The reducer owns workflow state transitions such as loading, success, temporary failure, conflict, date selection, and reset. This keeps transition rules in one place instead of spreading them across UI event handlers.

The state is intentionally separated by responsibility:

* `bookingStatus` — current booking operation state
* `reservations` — confirmed reservations accumulated during the session
* `confirmation` — the latest successful reservation shown as UI feedback
* `selectedDate` / `selectedTime` — current user selection
* `availability` — availability snapshot returned by the adapter

**Why a reducer?**
The booking flow has multiple related transitions and failure paths. A reducer makes those transitions explicit, keeps state changes predictable, and gives the behavior a small, testable state machine without introducing a larger state-management library.

---

## Important Engineering Semantics

### Availability is a snapshot, not a guarantee

A slot can be available when displayed but become unavailable before the booking request completes.

Therefore:

```text
availability !== reservation guarantee
```

The availability snapshot is only used to represent what the simulated server currently reports.

### HTTP status has domain meaning

The demo does not treat every failed request as the same error.

* `200` → success
* `503` → temporary failure → retry the same request
* `409` → booking conflict → choose another time

This keeps the UI behavior aligned with the meaning of the response rather than introducing generic error flags.

### Avoiding speculative state

The implementation intentionally avoids state such as:

```text
isRetrying
hasError
isConfirmed
showResult
canRetry
```

These conditions can be derived from the existing semantic state.

---

## Availability & Reservation Trade-off

The availability adapter currently returns a **static mock snapshot** for the selected date.

That means `getAvailability(date)` does not itself maintain server-side reservation persistence.

After a successful booking, the client session separately uses `reservations` to prevent an already-booked date/time from being selected again.

```text
Mock availability snapshot
        +
Client-side reservations
        ↓
Current demo behavior
```

This is an intentional scope boundary.

A production implementation would persist the reservation on the server and return an updated availability snapshot on subsequent availability requests.

The demo does **not** introduce a separate `mockServerState` just to reproduce that backend behavior, because doing so would add another state boundary without improving the frontend engineering lesson of this slice.

---

## UI Structure

The page is organized into three main areas:

### Booking Form

* Native date input
* Available time slots
* Selected / unavailable / reserved states
* Reserve / Retry actions

### Reservation List

Displays confirmed reservations accumulated during the current session.

### Result Panel

A reusable feedback surface for the current booking operation.

It handles:

* Empty state
* Loading
* Success
* Temporary failure
* Conflict

The Result Panel consumes booking state rather than owning a separate result state.

---

## Demo Boundary

This is a **mock simulation**, not a real booking service.

The demo does **not make real API calls**.

HTTP responses, delays, availability behavior, and failure scenarios are simulated locally so the frontend can demonstrate production-style state and error handling.

There is also no:

* Real backend
* Authentication
* Payment flow
* Reservation cancellation
* Reservation deletion
* Full booking lifecycle management

These are intentionally outside the scope of this slice.

---

## Testing

Behavior-focused tests cover the important reducer transitions, including:

* `reserve-start` → loading
* `reserve-success` → reservation + confirmation
* `503` → temporary error
* `409` → conflict
* Date selection → clears the current selected time

Validation:

```text
npm test
npm run typecheck
npm run lint
npm run build
```

---

## Engineering Takeaway

The main lesson from this slice is that a booking UI is not just:

```text
form → API → success
```

The frontend has to model uncertainty between availability and reservation.

The implementation therefore separates:

```text
Operation state
      ↓
bookingStatus

Confirmed domain data
      ↓
reservations

UI feedback
      ↓
confirmation
```

This keeps the state model explicit while allowing the UI to represent loading, temporary failures, and conflicts without accumulating unrelated boolean flags.

---

## Scope

**Day 4 goal:** demonstrate explicit availability, booking outcomes, HTTP failure semantics, retry decisions, and reusable result feedback in a minimal booking flow.

The implementation deliberately stops before becoming a full reservation system.