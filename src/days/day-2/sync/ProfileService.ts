
import type { Profile } from "../type";

const SAVE_LATENCY_MS = 900;

const delay = (ms: number) => {
    new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    })
}

export async function saveProfile(
    profile: Profile
): Promise<Profile> {

    await delay(SAVE_LATENCY_MS);

    return profile;
}