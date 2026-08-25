
import type { Profile } from '../type'

const SAVE_LATENCY_MS = 900

type SaveProfileOptions = {
    shouldFail?: boolean
}

const delay = (ms: number) =>
    new Promise<void>((resolve) => {
        setTimeout(resolve, ms)
    })

export async function saveProfile(
    profile: Profile,
    { shouldFail = false }: SaveProfileOptions = {},
): Promise<Profile> {
    await delay(SAVE_LATENCY_MS)

    if (shouldFail) {
        throw new Error('Profile save failed')
    }

    return { ...profile }
}
