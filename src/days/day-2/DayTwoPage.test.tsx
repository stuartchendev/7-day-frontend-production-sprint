import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DayTwoPage } from './DayTwoPage'

describe('DayTwoPage profile ownership', () => {
  it('starts with matching persisted and draft values', () => {
    render(<DayTwoPage />)

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
  })

  it('updates the local draft without changing the persisted profile', async () => {
    const user = userEvent.setup()
    render(<DayTwoPage />)

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
})
