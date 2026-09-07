# 7-Day Frontend Production Sprint

One shared React + TypeScript repository for a seven-day, production-focused frontend sprint.

The repository root is the Sprint Index and the single Portfolio entry for the Sprint. Days 1–6 share this technical base. A daily demo is added only after its implementation, verification, and evidence are ready.

## Sprint Index

| Day | Project | Engineering focus |
| --- | --- | --- |
| 1 | [Knowledge Base Search](./src/days/day-1/) | Async request ownership, stale-response prevention, and observable search lifecycle |
| 2 | [Profile Sync Workspace](./src/days/day-2/) | Draft/server ownership, save states, rollback behavior, and synchronization boundaries |
| 3 | [Cart State Skeleton](./src/days/day-3/) | Canonical cart state, intent flow, derived totals, and checkout review |
| 4 | [Booking & Reservation](./src/days/day-4/) | Availability, reservation conflicts, temporary failures, retry behavior, and state transitions |
| 5 | [Maintenance Ticket Workflow](./src/days/day-5/) | Typed workflow states, explicit transitions, derived views, and persistent history |
| 6 | — | Planned |
| 7 | — | Final integration / evidence selection |

Live Sprint Demo: https://seven-day-frontend-sprint.spu76611.chatgpt.site

## Commands

```bash
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
```

## Add a completed day

1. Read the matching Day row in the `7-Day Frontend Production Sprint DB` in Notion.
2. Implement the day inside `src/days/day-N/`.
3. Verify the day's stated behavior and Definition of Done.
4. Add one `SprintDay` entry to `src/days/sprintDays.ts`.

The registry is the single source for both the Sprint Index card and the `/day-N` route.

```tsx
import { DayFivePage } from './day-5/DayFivePage'

export const sprintDays: SprintDay[] = [
  {
    day: 5,
    slug: 'day-5',
    title: 'Maintenance Ticket Workflow',
    summary: 'Explicit ticket states drive valid actions, derived views, and persistent workflow history.',
    publishedOn: '2026-09-08',
    Component: DayFivePage,
  },
]
```

Do not pre-create empty daily pages or shared abstractions without a demonstrated cross-day need.

## Day 1 engineering note

Day 1 makes async search ownership visible. The core rule is: **Every request may
finish. Only the latest request earns render ownership.**

Valid queries debounce before starting a request. A new query cancels obsolete
work with `AbortController`, while the reducer independently rejects stale
successes and failures by request ID. `activeRequestId` identifies the request
currently allowed to settle; `renderedRequestId` identifies the last accepted
request whose results remain visible, including while a newer request is loading.

The mock adapter uses deterministic latency so overlapping requests can be tested
reliably. Signal events explain the lifecycle through a separate presentation
queue, so observability pacing never delays search execution or result rendering.
The trade-off is extra observability plumbing, kept deliberately separate from
product correctness.

## Day 7 boundary

After Day 6 evidence selection, Day 7 starts on a dedicated integration branch. That branch is development isolation, not a permanent Portfolio or deployment boundary.

After the product is complete, review the real boundary:

- Merge it into this repository as the final Sprint demo; or
- Extract it into its own repository and deployment only if it has become a standalone flagship product.

## Source of truth

- Challenge status and cross-day decisions: `7-Day Frontend Production Sprint` in Activity / Challenge DB.
- Daily scope and DoD: the matching Day 1–7 row in `7-Day Frontend Production Sprint DB`.
