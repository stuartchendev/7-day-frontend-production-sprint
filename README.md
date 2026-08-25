# 7-Day Frontend Production Sprint

One shared React + TypeScript repository for a seven-day, production-focused frontend sprint.

The repository root is the Sprint Index and the single Portfolio entry for the Sprint. Days 1–6 share this technical base. A daily demo is added only after its implementation, verification, and evidence are ready.

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
import { DayOnePage } from './day-1/DayOnePage'

export const sprintDays: SprintDay[] = [
  {
    day: 1,
    slug: 'day-1',
    title: 'Knowledge Base Search',
    summary: 'A production-minded async search experience.',
    publishedOn: '2026-08-24',
    Component: DayOnePage,
  },
]
```

Do not pre-create empty daily pages or shared abstractions without a demonstrated cross-day need.

## Day 1 engineering note

**Workshop Studio Knowledge Base** focuses on one production failure mode: an
older async search response overwriting newer UI. The governing rule is: **Every
request may finish. Only the latest request earns render ownership.**

`activeRequestId` names the request currently allowed to settle. It is cleared
when that request succeeds, fails, or loses ownership. `renderedRequestId` names
the last accepted response whose results remain visible, including while a newer
request is loading. These are intentionally different responsibilities.

Valid queries debounce before starting. A new query cancels obsolete work with
`AbortController`, while the reducer independently rejects stale successes and
failures by request ID. Cancellation reduces wasted work; the ownership check is
the correctness boundary that prevents a stale response from replacing newer UI.

The mock adapter uses controlled, deterministic latency to reproduce concurrency
scenarios reliably. It is a test seam, not a model of query-specific fixed
latency. The Signal Panel observes accepted, ignored, and aborted lifecycle
events through a separate presentation queue; it explains behavior but never
controls search correctness or render timing.

Key trade-offs:

- Request-ID gating and cancellation add coordination state, but provide defense
  in depth when cancellation is unavailable or loses a race.
- Keeping the last accepted results visible avoids loading flicker, but requires
  explicit render ownership so visible data is not confused with active work.
- Deterministic timing and a separate signal queue improve reproducibility and
  reviewability at the cost of mock realism and extra observability plumbing.

[Live demo](https://seven-day-frontend-sprint.spu76611.chatgpt.site/day-1)

## Day 7 boundary

After Day 6 evidence selection, Day 7 starts on a dedicated integration branch. That branch is development isolation, not a permanent Portfolio or deployment boundary.

After the product is complete, review the real boundary:

- Merge it into this repository as the final Sprint demo; or
- Extract it into its own repository and deployment only if it has become a standalone flagship product.

## Source of truth

- Challenge status and cross-day decisions: `7-Day Frontend Production Sprint` in Activity / Challenge DB.
- Daily scope and DoD: the matching Day 1–7 row in `7-Day Frontend Production Sprint DB`.
