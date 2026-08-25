import { useState } from 'react'

type Profile = {
  displayName: string
  email: string
  bio: string
}

type PersistedProfilePanelProps = {
  profile: Profile
}

type ProfileDraftFormProps = {
  profile: Profile
  onFieldChange: (field: keyof Profile, value: string) => void
}

type SaveStatusPanelProps = {
  isDirty: boolean
}

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

function SaveStatusPanel({ isDirty }: SaveStatusPanelProps) {
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
          {isDirty ? 'Local draft changed' : 'Draft matches server'}
        </p>
      </div>
      <p className="profile-panel__description">
        Save orchestration is intentionally outside this slice.
      </p>
    </section>
  )
}

export function DayTwoPage() {
  const [serverProfile] = useState<Profile>(() => ({ ...initialProfile }))
  const [draftProfile, setDraftProfile] = useState<Profile>(() => ({
    ...initialProfile,
  }))

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
        <SaveStatusPanel isDirty={isDirty} />
      </div>
    </main>
  )
}
