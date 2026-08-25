import { useRef, useState } from 'react'
import type { Profile } from './type'
import { saveProfile } from './sync/ProfileService'

type PersistedProfilePanelProps = {
  profile: Profile
  changedFields: ChangedFields
}

type ProfileDraftFormProps = {
  profile: Profile
  changedFields: ChangedFields
  onFieldChange: (field: keyof Profile, value: string) => void
}

type SaveStatusPanelProps = {
  isDirty: boolean
  status: SaveStatus
  isFailureArmed: boolean
  onSave: () => void
  onDiscard: () => void
  onSimulateNextSaveFailure: () => void
}

type SaveStatus = 'idle' | 'saving' | 'error'

type ChangedFields = {
  displayName: boolean
  email: boolean
  bio: boolean
}

const initialProfile: Profile = {
  displayName: 'Stuart Chen',
  email: 'stuart@example.com',
  bio: 'Frontend engineer building calm, reliable product experiences.',
}

function PersistedProfilePanel({
  profile,
  changedFields,
}: PersistedProfilePanelProps) {
  return (
    <section
      className="profile-panel profile-panel--persisted"
      aria-labelledby="persisted-profile-title"
    >
      <p className="profile-panel__stage">Server truth</p>
      <h2 id="persisted-profile-title">Persisted snapshot</h2>
      <p className="profile-panel__description">
        Read-only reference: the latest profile accepted by the server.
      </p>

      <dl className="persisted-profile">
        <div>
          <dt>
            Display name
            {changedFields.displayName && <span>Differs from draft</span>}
          </dt>
          <dd>{profile.displayName}</dd>
        </div>
        <div>
          <dt>
            Email
            {changedFields.email && <span>Differs from draft</span>}
          </dt>
          <dd>{profile.email}</dd>
        </div>
        <div>
          <dt>
            Bio
            {changedFields.bio && <span>Differs from draft</span>}
          </dt>
          <dd>{profile.bio}</dd>
        </div>
      </dl>
    </section>
  )
}

function ProfileDraftForm({
  profile,
  changedFields,
  onFieldChange,
}: ProfileDraftFormProps) {
  return (
    <section
      className="profile-panel profile-panel--draft"
      aria-labelledby="profile-draft-title"
    >
      <p className="profile-panel__stage">Your edits</p>
      <h2 id="profile-draft-title">Current draft</h2>
      <p className="profile-panel__description">
        Edits stay local until a future save flow crosses the persistence boundary.
      </p>

      <form
        className="profile-draft-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <div>
          <label htmlFor="profile-display-name">
            Display name
            {changedFields.displayName && <span>Changed</span>}
          </label>
          <input
            id="profile-display-name"
            name="displayName"
            value={profile.displayName}
            onChange={(event) =>
              onFieldChange('displayName', event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="profile-email">
            Email
            {changedFields.email && <span>Changed</span>}
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            value={profile.email}
            onChange={(event) => onFieldChange('email', event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="profile-bio">
            Bio
            {changedFields.bio && <span>Changed</span>}
          </label>
          <textarea
            id="profile-bio"
            name="bio"
            rows={5}
            value={profile.bio}
            onChange={(event) => onFieldChange('bio', event.target.value)}
          />
        </div>
      </form>
    </section>
  )
}

function SaveStatusPanel({
  isDirty,
  status,
  isFailureArmed,
  onSave,
  onDiscard,
  onSimulateNextSaveFailure,
}: SaveStatusPanelProps) {
  const isSaving = status === 'saving'
  const saveFailed = status === 'error'
  const statusTone = saveFailed
    ? 'error'
    : isSaving
      ? 'saving'
      : isDirty
        ? 'dirty'
        : 'synced'

  return (
    <section
      className="profile-panel profile-panel--save"
      aria-labelledby="save-status-title"
    >
      <p className="profile-panel__stage">Persistence lifecycle</p>
      <h2 id="save-status-title">Save state</h2>
      <div className={`save-status save-status--${statusTone}`}>
        <span className="save-placeholder__indicator" aria-hidden="true" />
        <div>
          <p className="save-status__label">Current status</p>
          <p role="status">
            {isSaving
              ? 'Saving...'
              : saveFailed
                ? 'Save failed'
                : isDirty
                  ? 'Local draft changed'
                  : 'Draft matches server'}
          </p>
        </div>
      </div>
      {saveFailed ? (
        <div className="save-failure-details" aria-label="Failed save details">
          <p>Draft preserved</p>
          <p>Server unchanged</p>
          <p>
            Choose Try again to save this draft, or Discard changes to restore
            the server snapshot.
          </p>
        </div>
      ) : (
        <p className="profile-panel__description">
          Save sends the working copy to the persisted profile.
        </p>
      )}
      <button
        className="discard-button"
        type="button"
        onClick={onDiscard}
        disabled={!isDirty || isSaving}
      >
        Discard changes
      </button>
      {saveFailed ? (
        <button className="save-button" type="button" onClick={onSave}>
          Try again
        </button>
      ) : (
        <button
          className="save-button"
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
        >
          Save changes
        </button>
      )}
      <div className="save-demo-control">
        <p className="save-demo-control__label">Demo control</p>
        <button
          className="save-demo-control__button"
          type="button"
          onClick={onSimulateNextSaveFailure}
          disabled={isSaving || isFailureArmed}
        >
          Simulate next save failure
        </button>
        {isFailureArmed && <p>Failure armed ✓</p>}
      </div>
    </section>
  )
}

export function DayTwoPage() {
  const [serverProfile, setServerProfile] = useState<Profile>(() => ({ ...initialProfile }))
  const [draftProfile, setDraftProfile] = useState<Profile>(() => ({
    ...initialProfile,
  }))
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [shouldFailNextSave, setShouldFailNextSave] = useState(false)
  const isSavingRef = useRef(false)

  const changedFields = {
    displayName: serverProfile.displayName !== draftProfile.displayName,
    email: serverProfile.email !== draftProfile.email,
    bio: serverProfile.bio !== draftProfile.bio,
  }
  const isDirty = Object.values(changedFields).some(Boolean)

  function updateDraftField(field: keyof Profile, value: string) {
    setDraftProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }))
  }

  function discardDraft() {
    setDraftProfile({ ...serverProfile })
    setStatus('idle');
  }

  function simulateNextSaveFailure() {
    setShouldFailNextSave(true)
  }

  async function handleSave() {
    if (isSavingRef.current) {
      return
    }

    isSavingRef.current = true
    const shouldFail = shouldFailNextSave
    setShouldFailNextSave(false)
    setStatus('saving')

    try {
      const savedProfile = await saveProfile(draftProfile, { shouldFail })

      setServerProfile({ ...savedProfile })
      setDraftProfile({ ...savedProfile })
      setStatus('idle')
    } catch {
      setStatus('error')
    } finally {
      isSavingRef.current = false
    }
  }

  return (
    <main className="profile-workspace">
      <header className="profile-workspace__header">
        <p className="sprint-index__eyebrow">Day 2 · Account settings</p>
        <h1>Profile Sync Workspace</h1>
        <p>
          A failed save rolls back neither the draft nor the server truth. Each
          copy keeps the state it actually owns.
        </p>
      </header>

      <div className="profile-workspace__panels">
        <PersistedProfilePanel
          profile={serverProfile}
          changedFields={changedFields}
        />
        <ProfileDraftForm
          profile={draftProfile}
          changedFields={changedFields}
          onFieldChange={updateDraftField}
        />
        <SaveStatusPanel
          isDirty={isDirty}
          status={status}
          isFailureArmed={shouldFailNextSave}
          onSave={handleSave}
          onDiscard={discardDraft}
          onSimulateNextSaveFailure={simulateNextSaveFailure}
        />
      </div>
    </main>
  )
}
