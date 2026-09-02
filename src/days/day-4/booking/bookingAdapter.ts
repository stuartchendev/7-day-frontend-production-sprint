import type { BookingResult } from "./type";

// Similuator request 1 response status
const bookingScenarios = {
    '18:00': 200,
    '18:30': 503,
    '19:30': 409,
    '20:00': 200,
} as const

const attempts = new Map<string, number>()

const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

const isBookingScenarioTime = (
    time: string,
): time is keyof typeof bookingScenarios =>
    time in bookingScenarios

export async function reserveTable(
    date: string,
    time: string,
): Promise<BookingResult> {

    if (!isBookingScenarioTime(time)) {
        throw new Error(`Unsupported booking time: ${time}`)
    }

    const key = `${date}|${time}`
    const attempt = (attempts.get(key) ?? 0) + 1

    attempts.set(key, attempt)

    const status = bookingScenarios[time]

    // simulator latency
    await wait(500)

    // simulator for request #2 → HTTP 200 after a transient failure(503)
    if (status === 503 && attempt > 1) {
        return {
            status: 200,
            reservation: {
                id: crypto.randomUUID(),
                date,
                time,
            },
        }
    }
    if (status === 503) {
        return { status: 503 }
    }

    if (status === 409) {
        return { status: 409 }
    }
    return {
        status: 200,
        reservation: {
            id: crypto.randomUUID(),
            date,
            time,
        },
    }
}