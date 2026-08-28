import { useReducer, useState } from 'react'
import { bookingReducer } from './booking/bookingReducer'
import { initialBookingState } from './booking/type'
import { reserveTable } from './booking/bookingAdapter'

// test value
const slots = [
    { time: '18:00', available: true },
    { time: '18:30', available: true },
    { time: '19:30', available: true },
]

export function DayFourPage() {
    const [state, dispatch] = useReducer(
        bookingReducer,
        initialBookingState,
    )
    const isLoading = state.bookingStatus === 'loading'
    const isTemporaryError = state.bookingStatus === 'temporary-error'
    const isConflict = state.bookingStatus === 'conflict'
    // test

    const selectedDate = "2026-8-27"
    const [selectedTime, setSelectedTime] = useState<string>('');

    const isAlreadyReserved = state.reservations.some(
        (reservation) =>
            reservation.date === selectedDate &&
            reservation.time === selectedTime,
    )

    const handleTimeSelect = (time: string) => {
        dispatch({ type: 'booking-reset' })
        setSelectedTime(time);
    }

    const handleRetry = () => {
        handleReserve()
    }

    const handleReserve = async () => {
        if (!selectedDate || !selectedTime) {
            return
        }
        if (isAlreadyReserved) {
            return
        }
        dispatch({ type: 'reserve-start' })
        const result = await reserveTable(
            selectedDate,
            selectedTime
        )
        if (result.status === 200) {
            dispatch({
                type: 'reserve-success',
                reservation: result.reservation,
            })
            dispatch({ type: 'booking-reset' })
            return
        }

        if (result.status === 503) {
            dispatch({
                type: 'reserve-temporary-error',
            })
            return
        }

        if (result.status === 409) {
            dispatch({
                type: 'reserve-conflict',
            })
            return
        }
    }
    console.log("confirm", state.confirmation)
    return (
        <>
            <p>Booking status: {state.bookingStatus}</p>
            {slots.map((slot) => {
                const isReserved = state.reservations.some(
                    (reservation) =>
                        reservation.date === selectedDate &&
                        reservation.time === slot.time
                )

                return (
                    <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleTimeSelect(slot.time)}
                        disabled={slot.time === selectedTime || isReserved}
                    >
                        {slot.time}
                    </button>
                )
            })}
            <button onClick={handleReserve}>
                Reserve
            </button>
            {isLoading && <p>Booking...</p>}
            {isTemporaryError && (
                <div>
                    <p>Something went wrong. Please try again.</p>
                    <button onClick={handleRetry}>
                        Retry
                    </button>
                </div>
            )}
            {state.confirmation &&
                < div>
                    <p>Reservation confirmed!</p>
                    {state.reservations.map((reservation) => (
                        <div key={reservation.id}>
                            <p>Date: {reservation.date}</p>
                            <p>Time: {reservation.time}</p>
                        </div>
                    ))}
                </div >
            }
            {isConflict && (
                <div>
                    <p>This time slot is no longer available.</p>
                </div>
            )}

        </>
    );
}