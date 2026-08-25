import { useRef, useState } from 'react'
import type { Profile } from './type'
import { saveProfile } from './sync/ProfileService'

type PersistedProfilePanelProps = {
  profile: Profile
}

type ProfileDraftFormProps = {
  profile: Profile
  onFieldChange: (field: keyof Profile, value: string) => void
}

type SaveStatusPanelProps = {
  isDirty: boolean
  status: SaveStatus
  onSave: () => void
  onDiscard: () => void
}

type SaveStatus = 'idle' | 'saving' | 'error'

const initialProfile: Profile = {
  displayName: 'Stuart Chen',
  email: 'stuart@example.com',
  bio: 'Frontend engineer building calm, reliable product experiences.',
}

function PersistedProfilePanel({ profile }: PersistedProfilePanelProps) {
  return (
    <section
      className="profile-panel profile-panel--persisted"
      aria-labelledby="persisted-profile-title"
    >
      <p className="profile-panel__stage">Server</p>
      <h2 id="persisted-profile-title">Persisted snapshot</h2>
      <p className="profile-panel__description">
        The latest profile accepted by the server.
      </p>

      <dl className="persisted-profile">
        <div>
          <dt>Display name</dt>
          <dd>{profile.displayName}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div>
          <dt>Bio</dt>
          <dd>{profile.bio}</dd>
        </div>
      </dl>
    </section>
  )
}

function ProfileDraftForm({ profile, onFieldChange }: ProfileDraftFormProps) {
  return (
    <section
      className="profile-panel profile-panel--draft"
      aria-labelledby="profile-draft-title"
    >
      <p className="profile-panel__stage">Draft</p>
      <h2 id="profile-draft-title">Working copy</h2>
      <p className="profile-panel__description">
        Edits stay local until a future save flow crosses the persistence boundary.
      </p>

      <form
        className="profile-draft-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <div>
          <label htmlFor="profile-display-name">Display name</label>
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
          <label htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            name="email"
            type="email"
            value={profile.email}
            onChange={(event) => onFieldChange('email', event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="profile-bio">Bio</label>
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
  onSave,
  onDiscard,
}: SaveStatusPanelProps) {
  const isSaving = status === 'saving'
  const saveFailed = status === 'error'

  return (
    <section
      className="profile-panel profile-panel--save"
      aria-labelledby="save-status-title"
    >
      <p className="profile-panel__stage">Save</p>
      <h2 id="save-status-title">Persistence boundary</h2>
      <div className="save-placeholder">
        <span className="save-placeholder__indicator" aria-hidden="true" />
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
      {saveFailed ? (
        <div className="profile-panel__description">
          <p>Draft preserved</p>
          <p>Server unchanged</p>
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
    </section>
  )
}

export function DayTwoPage() {
  const [serverProfile, setServerProfile] = useState<Profile>(() => ({ ...initialProfile }))
  const [draftProfile, setDraftProfile] = useState<Profile>(() => ({
    ...initialProfile,
  }))
  const [status, setStatus] = useState<SaveStatus>('idle')
  const isSavingRef = useRef(false)

  const isDirty =
    serverProfile.displayName !== draftProfile.displayName ||
    serverProfile.email !== draftProfile.email ||
    serverProfile.bio !== draftProfile.bio

  function updateDraftField(field: keyof Profile, value: string) {
    setDraftProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }))
  }

  function discardDraft() {
    setDraftProfile({ ...serverProfile })
  }

  async function handleSave() {
    if (isSavingRef.current) {
      return
    }

    isSavingRef.current = true
    setStatus('saving')

    try {
      const savedProfile = await saveProfile(draftProfile)

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
        <PersistedProfilePanel profile={serverProfile} />
        <ProfileDraftForm
          profile={draftProfile}
          onFieldChange={updateDraftField}
        />
        <SaveStatusPanel
          isDirty={isDirty}
          status={status}
          onSave={handleSave}
          onDiscard={discardDraft}
        />
      </div>
    </main>
  )
}
