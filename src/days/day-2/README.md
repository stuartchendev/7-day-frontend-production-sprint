# Day 2 — Profile Sync Workspace

Day 2 focuses on a common frontend state-management problem: keeping a user's local draft separate from the persisted server value while making save behavior and failure states explicit.

The UI is intentionally small, but the state model makes the ownership boundary visible.

## What this demo proves

The core rule is:

> The draft is not the server truth.

The page maintains two canonical profile values:

- **Persisted Snapshot** — the latest profile accepted by the persistence boundary.
- **Current Draft** — the user's editable local working copy.

Saving creates an explicit persistence boundary between them.

A failed save must not overwrite the persisted value or discard the user's draft.

## State ownership

The canonical state is intentionally small:

```ts
type SaveStatus = 'idle' | 'saving' | 'error'

type Profile = {
  displayName: string
  email: string
  bio: string
}

type ProfileSettingsState = {
  serverProfile: Profile
  draftProfile: Profile
  status: SaveStatus
  error: string | null
}
```

## The ownership model is:

```
serverProfile → persisted truth
draftProfile  → local working copy
status        → save-request lifecycle
error         → latest real save failure
```

Values such as `isDirty`, changed fields, and save/discard availability are derived from canonical state instead of being stored separately.

### For example:

```ts
const isDirty = !isProfileEqual(serverProfile, draftProfile)
```

This keeps the relationship between persisted state and local state explicit and avoids duplicate sources of truth.

## Save lifecycle

The normal flow is:
```
Draft differs from server
        ↓
      Saving
        ↓
      Saved
```
The failure path is:
```
Draft differs from server
        ↓
      Saving
        ↓
      Failed
        ↓
      Retry
        ↓
      Saved
```
A failed save preserves both important facts:
```
serverProfile → unchanged
draftProfile  → preserved
```
The user can retry the same draft or explicitly discard it.

On successful persistence, the accepted response becomes both the new persisted profile and the current draft. This keeps the persistence boundary explicit instead of assuming that the submitted draft is automatically the final server value.

## Persistence boundary

The UI depends on a small service contract:
```ts
type ProfileService = {
  saveProfile(profile: Profile): Promise<Profile>
}
```
The current implementation uses a mock persistence adapter with controlled latency and deterministic failure simulation.

The failure mechanism stays outside the profile state model so it can be removed when a real API replaces the mock adapter.

Controlled latency exists only to make the save lifecycle observable in the demo.

## Failure demonstration

The demo can intentionally fail the next save.

The important behavior is not the failure itself, but what remains true after it:
```
Server        Draft          Save
Stuart        Penguin        Failed
  │              │
  │ unchanged    │ preserved
```
Retrying the same draft can then complete normally:
```
Server        Draft          Save
Penguin       Penguin        Saved
```
This demonstrates the persistence boundary without requiring a real backend.

## Why `useState` instead of a reducer?

Day 1 used `useReducer` because multiple coordinated async transitions and request ownership rules benefited from an explicit state-transition model.

Day 2 is intentionally more linear:
```
edit → draft changes
save → persistence request
success → promote accepted response
failure → preserve server + draft
discard → restore draft from server
```
For this smaller state model, `useState` with derived values keeps the implementation easier to read without weakening the ownership rules.

This is a deliberate trade-off rather than a preference for one state-management approach.

## Component responsibilities

State ownership remains centralized in `Day2Page`:
```
Day2Page
├── PersistedProfilePanel
│   └── reads serverProfile
├── ProfileDraftForm
│   ├── reads draftProfile
│   └── emits field changes
└── SaveStatusPanel
    ├── reads save state
    └── emits save / discard actions
```
Child components are responsible for presentation and user interaction. `Day2Page` coordinates the state transitions.

## Validation

Validation is intentionally minimal:

- `displayName` is required and length-bounded.
- `email` is required and uses a basic email format check.
- `bio` is optional and length-bounded.

Validation exists to keep `canSave` meaningful. Authentication, server-side validation, uniqueness checks, and account-security flows are outside the scope of this demo.

## Verification

The implementation was verified through:

- Behavior tests covering draft/server ownership, discard, successful save,
- save failure, retry, and simulated failure.
- Typecheck.
- Lint.
- Production build.
- git diff --check.
- Desktop/mobile smoke testing.
- Live failure demonstration.

The final demo reproduces the key invariant:
>A failed save does not change persisted server truth and does not discard the user's local draft.

## Scope

Day 2 is an engineering demonstration of frontend state ownership and persistence boundaries, not a complete account-management system.

Intentionally excluded:

- Authentication    
- Real backend infrastructure
- Password or security settings
- Avatar upload
- Notification preferences
- Generic form/diff infrastructure
- Full account-management features

The scope stays intentionally bounded so the state model and failure behavior remain easy to inspect and verify.