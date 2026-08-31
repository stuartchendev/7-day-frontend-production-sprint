import { useReducer, useState } from 'react'
import { bookingReducer } from './booking/bookingReducer'
import { initialBookingState } from './booking/type'
import { reserveTable } from './booking/bookingAdapter'
import { Link } from 'react-router-dom'
import "./day-four.css"

// test value
const slots = [
    { time: '18:00', available: true },
    { time: '18:30', available: true },
    { time: '19:00', available: false },
    { time: '19:30', available: true },
    { time: '20:00', available: true },
]

const getToday = () => {
    const today = new Date()
    const offset = today.getTimezoneOffset()
    const localDate = new Date(today.getTime() - offset * 60 * 1000)

    return localDate.toISOString().slice(0, 10)
}

export function DayFourPage() {
    const [state, dispatch] = useReducer(
        bookingReducer,
        initialBookingState,
    )
    const isLoading = state.bookingStatus === 'loading'
    const isTemporaryError = state.bookingStatus === 'temporary-error'
    const isConflict = state.bookingStatus === 'conflict'
    // test
    const [unavailableTimes, setUnavailableTimes] = useState<string[]>([])
    const [selectedDate, setSelectedDate] = useState<string>(getToday());
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
            setUnavailableTimes((times) => [
                ...times,
                selectedTime,
            ])

            dispatch({
                type: 'reserve-conflict',
            })
            return
        }
    }
    return (
        <main className='day-four'>
            <Link className="day-four__back-link" to="/">
                ← Back to Sprint Home
            </Link>
            <header className='day-four__header'>
                <p className="day-four__eyebrow">
                    Day 4 · Booking reservation
                </p>
                <h1>
                    Book a table, handle the uncertainty
                </h1>
                <p>
                    The booking flow models loading, temporary failure, and
                    reservation conflicts without relying on a real API.
                </p>
            </header>

            <div className='day-four__content'>
                <section className='booking_form'>
                    <h2>Booking Form</h2>

                    <label htmlFor="booking-date">
                        Date
                    </label>
                    <input
                        id="booking-date"
                        type="date"
                        value={selectedDate}
                        onChange={(event) => setSelectedDate(event.target.value)}
                    />
                    {!selectedDate && (
                        <p className="booking_form__error">
                            Please choose a date.
                        </p>
                    )}
                    <p className="booking_form__label">
                        Choose a time
                    </p>
                    {slots.map((slot) => {
                        const isReserved = state.reservations.some(
                            (reservation) =>
                                reservation.date === selectedDate &&
                                reservation.time === slot.time
                        )
                        const isSelected = slot.time === selectedTime
                        const isUnavailable =
                            !slot.available ||
                            unavailableTimes.includes(slot.time)

                        return (
                            <button
                                className={[
                                    'booking_form__slot',
                                    isSelected && 'is-selected',
                                    isReserved && 'is-reserved',
                                    isUnavailable && 'is-unavailable',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                key={slot.time}
                                type="button"
                                onClick={() => handleTimeSelect(slot.time)}
                                disabled={
                                    isUnavailable ||
                                    isSelected ||
                                    isReserved
                                }
                            >
                                {slot.time}
                                {!slot.available && ' (Unavailable)'}
                            </button>
                        )
                    })}
                    <button
                        className='booking-form__reserve'
                        onClick={handleReserve}>
                        Reserve table
                    </button>
                    {isTemporaryError && (
                        <button onClick={handleRetry}>
                            Retry
                        </button>
                    )}
                </section>
                <div className='day-four__sidebar'>
                    <section className='booking_reservation'>
                        <h2>Reservations</h2>

                        {state.reservations.length === 0 ? (
                            <p>No reservations yet.</p>
                        ) : (
                            state.reservations.map((reservation) => (
                                <div key={reservation.id}>
                                    <p>Date: {reservation.date}</p>
                                    <p>Time: {reservation.time}</p>
                                </div>
                            ))
                        )}

                    </section>

                    <section className='booking_result'>
                        {isLoading && <p>Booking...</p>}
                        {state.confirmation &&
                            < div>
                                <p>Reservation confirmed!</p>
                                <p>
                                    {state.confirmation.date} · {state.confirmation.time}
                                </p>
                                <p>Table for 2</p>
                            </div >
                        }
                        {isConflict && (
                            <div>
                                <p>This time slot is no longer available.</p>
                            </div>
                        )}
                        {isTemporaryError && (
                            <div>
                                <p>Something went wrong. Please try again.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>

    );
}