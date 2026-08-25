import { describe, expect, it, vi } from 'vitest'
import { saveProfile } from './ProfileService'

describe('saveProfile', () => {
  it('rejects when its test failure option is enabled', async () => {
    vi.useFakeTimers()
    const profile = {
      displayName: 'Penguin',
      email: 'penguin@example.com',
      bio: 'A test profile.',
    }

    const save = saveProfile(profile, { shouldFail: true })
    const expectation = expect(save).rejects.toThrow('Profile save failed')
    await vi.advanceTimersByTimeAsync(900)

    await expectation
    vi.useRealTimers()
  })
})
