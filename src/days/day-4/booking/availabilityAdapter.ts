import type { AvailabilitySnapshot } from "./type";

const slots = [
    { time: '18:00', available: true },
    { time: '18:30', available: true },
    { time: '19:00', available: false },
    { time: '19:30', available: true },
    { time: '20:00', available: true },
]


export async function getAvailability(
    date: string,
): Promise<AvailabilitySnapshot> {
    return {
        date,
        slots,
    }
}


