import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DayTwoPage } from './DayTwoPage'
import { saveProfile } from './sync/ProfileService'
import { MemoryRouter } from 'react-router-dom';

vi.mock('./sync/ProfileService', () => ({
  saveProfile: vi.fn(),
}))

const mockedSaveProfile = vi.mocked(saveProfile)

describe('DayTwoPage profile ownership', () => {
  beforeEach(() => {
    mockedSaveProfile.mockReset()
  })

  it('starts with matching persisted and draft values', () => {
    render(
      <MemoryRouter>
        <DayTwoPage />
      </MemoryRouter>,)

    const persistedPanel = screen.getByRole('region', {
      name: 'Persisted snapshot',
    })

    expect(within(persistedPanel).getByText('Stuart Chen')).toBeInTheDocument()
    expect(screen.getByLabelText('Display name')).toHaveValue('Stuart Chen')
    expect(within(persistedPanel).getByText('stuart@example.com')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('stuart@example.com')
    expect(
      within(persistedPanel).getByText(
        'Frontend engineer building calm, reliable product experiences.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Bio')).toHaveValue(
      'Frontend engineer building calm, reliable product experiences.',
    )
    expect(
      screen.getByRole('button', { name: 'Discard changes' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })

  it('updates the local draft without changing the persisted profile', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DayTwoPage />
      </MemoryRouter>,
    );

    const persistedPanel = screen.getByRole('region', {
      name: 'Persisted snapshot',
    })
    const displayNameInput = screen.getByLabelText('Display name')

    await user.clear(displayNameInput)
    await user.type(displayNameInput, 'Penguin')

    expect(displayNameInput).toHaveValue('Penguin')
    expect(within(persistedPanel).getByText('Stuart Chen')).toBeInTheDocument()
    expect(within(persistedPanel).queryByText('Penguin')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Local draft changed')
  })

  it('restores every draft field from the persisted profile', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DayTwoPage />
      </MemoryRouter>,
    );

    const persistedPanel = screen.getByRole('region', {
      name: 'Persisted snapshot',
    })
    const displayNameInput = screen.getByLabelText('Display name')
    const emailInput = screen.getByLabelText('Email')
    const bioInput = screen.getByLabelText('Bio')
    const discardButton = screen.getByRole('button', {
      name: 'Discard changes',
    })

    await user.clear(displayNameInput)
    await user.type(displayNameInput, 'Penguin')
    await user.clear(emailInput)
    await user.type(emailInput, 'penguin@example.com')
    await user.clear(bioInput)
    await user.type(bioInput, 'Building a new local draft.')

    expect(displayNameInput).toHaveValue('Penguin')
    expect(emailInput).toHaveValue('penguin@example.com')
    expect(bioInput).toHaveValue('Building a new local draft.')
    expect(screen.getByRole('status')).toHaveTextContent('Local draft changed')
    expect(discardButton).toBeEnabled()
    expect(within(persistedPanel).getByText('Stuart Chen')).toBeInTheDocument()
    expect(within(persistedPanel).getByText('stuart@example.com')).toBeInTheDocument()
    expect(
      within(persistedPanel).getByText(
        'Frontend engineer building calm, reliable product experiences.',
      ),
    ).toBeInTheDocument()

    await user.click(discardButton)

    expect(displayNameInput).toHaveValue('Stuart Chen')
    expect(emailInput).toHaveValue('stuart@example.com')
    expect(bioInput).toHaveValue(
      'Frontend engineer building calm, reliable product experiences.',
    )
    expect(within(persistedPanel).getByText('Stuart Chen')).toBeInTheDocument()
    expect(within(persistedPanel).getByText('stuart@example.com')).toBeInTheDocument()
    expect(
      within(persistedPanel).getByText(
        'Frontend engineer building calm, reliable product experiences.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Draft matches server')
    expect(discardButton).toBeDisabled()
  })

  it('shows saving and syncs both profiles after a successful save', async () => {
    const user = userEvent.setup()
    let resolveSave: (profile: { displayName: string; email: string; bio: string }) => void
    const saveComplete = new Promise<{
      displayName: string
      email: string
      bio: string
    }>((resolve) => {
      resolveSave = resolve
    })
    mockedSaveProfile.mockReturnValueOnce(saveComplete)
    render(
      <MemoryRouter>
        <DayTwoPage />
      </MemoryRouter>,
    );

    const displayNameInput = screen.getByLabelText('Display name')
    await user.clear(displayNameInput)
    await user.type(displayNameInput, 'Penguin')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByRole('status')).toHaveTextContent('Saving...')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()

    resolveSave!({
      displayName: 'Penguin',
      email: 'stuart@example.com',
      bio: 'Frontend engineer building calm, reliable product experiences.',
    })

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Draft matches server'),
    )
    expect(
      within(
        screen.getByRole('region', { name: 'Persisted snapshot' }),
      ).getByText('Penguin'),
    ).toBeInTheDocument()
    expect(displayNameInput).toHaveValue('Penguin')
  })

  it('preserves the draft and allows retrying after a failed save', async () => {
    const user = userEvent.setup()
    let resolveRetry: (profile: {
      displayName: string
      email: string
      bio: string
    }) => void
    const retryComplete = new Promise<{
      displayName: string
      email: string
      bio: string
    }>((resolve) => {
      resolveRetry = resolve
    })
    mockedSaveProfile
      .mockRejectedValueOnce(new Error('Profile save failed'))
      .mockReturnValueOnce(retryComplete)
    render(
      <MemoryRouter>
        <DayTwoPage />
      </MemoryRouter>,
    );

    const persistedPanel = screen.getByRole('region', {
      name: 'Persisted snapshot',
    })
    const displayNameInput = screen.getByLabelText('Display name')
    await user.clear(displayNameInput)
    await user.type(displayNameInput, 'Penguin')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Save failed')).toBeInTheDocument()
    expect(screen.getByText('Draft preserved')).toBeInTheDocument()
    expect(screen.getByText('Server unchanged')).toBeInTheDocument()
    expect(displayNameInput).toHaveValue('Penguin')
    expect(within(persistedPanel).getByText('Stuart Chen')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.getByRole('status')).toHaveTextContent('Saving...')
    resolveRetry!({
      displayName: 'Penguin',
      email: 'stuart@example.com',
      bio: 'Frontend engineer building calm, reliable product experiences.',
    })
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Draft matches server'),
    )
    expect(within(persistedPanel).getByText('Penguin')).toBeInTheDocument()
    expect(mockedSaveProfile).toHaveBeenCalledTimes(2)
  })

  it('arms one simulated failure for the next real save, then retries normally', async () => {
    const user = userEvent.setup()
    mockedSaveProfile.mockImplementation(async (profile, options) => {
      if (options?.shouldFail) {
        throw new Error('Profile save failed')
      }

      return profile
    })
    render(
      <MemoryRouter>
        <DayTwoPage />
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole('button', { name: 'Simulate next save failure' }),
    )
    expect(screen.getByText('Failure armed ✓')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Simulate next save failure' }),
    ).toBeDisabled()

    const displayNameInput = screen.getByLabelText('Display name')
    await user.clear(displayNameInput)
    await user.type(displayNameInput, 'Penguin')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Save failed')).toBeInTheDocument()
    expect(screen.queryByText('Failure armed ✓')).not.toBeInTheDocument()
    expect(mockedSaveProfile).toHaveBeenLastCalledWith(
      expect.objectContaining({ displayName: 'Penguin' }),
      { shouldFail: true },
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Draft matches server'),
    )
    expect(mockedSaveProfile).toHaveBeenLastCalledWith(
      expect.objectContaining({ displayName: 'Penguin' }),
      { shouldFail: false },
    )
  })
})
