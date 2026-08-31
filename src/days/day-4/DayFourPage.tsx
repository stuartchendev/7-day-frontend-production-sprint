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

export function getTodayDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
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
    const [unavailableSlots, setUnavailableSlots] = useState<
        { date: string; time: string }[]
    >([])

    const selectedDate = state.selectedDate
    const selectedTime = state.selectedTime

    const isAlreadyReserved = state.reservations.some(
        (reservation) =>
            reservation.date === selectedDate &&
            reservation.time === selectedTime,
    )

    const handleTimeSelect = (time: string) => {
        dispatch({ type: 'booking-reset' })
        dispatch({ type: 'select-time', time })
    }

    const handleRetry = () => {
        handleReserve()
    }

    const handleDateChange = (date: string) => {
        dispatch({ type: 'select-date', date })
        setUnavailableSlots([])
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
            setUnavailableSlots((slots) => [
                ...slots,
                {
                    date: selectedDate,
                    time: selectedTime,
                },
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
                        min={getTodayDate()}
                        value={selectedDate}
                        onChange={(event) => handleDateChange(event.target.value)}
                    />
                    {!selectedDate && (
                        <p className="booking_form__error">
                            Please choose a date.
                        </p>
                    )}
                    <p className="booking_form__label">
                        Choose a time
                    </p>
                    <div className='booking_form__slot-layout'>
                        {slots.map((slot) => {
                            const isReserved = state.reservations.some(
                                (reservation) =>
                                    reservation.date === selectedDate &&
                                    reservation.time === slot.time
                            )
                            const isSelected = slot.time === selectedTime
                            const isConflictUnavailable = unavailableSlots.some(
                                (unavailableSlot) =>
                                    unavailableSlot.date === selectedDate &&
                                    unavailableSlot.time === slot.time
                            )

                            const isUnavailable =
                                !slot.available ||
                                isConflictUnavailable

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
                    </div>
                    <div className="booking_form__actions">
                        {!isTemporaryError ? (
                            <button
                                className="booking-form__reserve"
                                onClick={handleReserve}
                            >
                                Reserve table
                            </button>
                        ) : (
                            <button
                                className="booking-form__retry"
                                onClick={handleRetry}>
                                Retry
                            </button>
                        )}
                    </div>
                </section>
                <div className='day-four__sidebar'>
                    <section className='booking_reservation'>
                        <h2>Reservations</h2>

                        <div className="booking_reservation__items">
                            {state.reservations.length === 0 ? (
                                <p>No reservations yet.</p>
                            ) : (
                                state.reservations.map((reservation) => (
                                    <div
                                        className="booking_reservation__item"
                                        key={reservation.id}
                                    >
                                        <p className="booking_reservation__date">
                                            {reservation.date}
                                        </p>
                                        <p className="booking_reservation__time">
                                            {reservation.time}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className='booking_result'>
                        {!isLoading &&
                            !state.confirmation &&
                            !isConflict &&
                            !isTemporaryError && (
                                <div className="booking_result__empty">
                                    <p className="booking_result__message">
                                        Ready when you are
                                    </p>
                                    <p className="booking_result__info">
                                        Choose a date and time to start your booking.
                                    </p>
                                </div>
                            )}
                        {isLoading && <p className="booking_result__message">Booking...</p>}
                        {state.confirmation &&
                            <div>
                                <p className="booking_result__message">
                                    Reservation confirmed!
                                </p>

                                <p className="booking_result__info">
                                    {state.confirmation.date} · {state.confirmation.time}
                                </p>

                                <p className="booking_result__info">
                                    Table for 2
                                </p>
                            </div>
                        }
                        {isConflict && (
                            <div>
                                <p className="booking_result__message">
                                    This time slot is no longer available.
                                </p>
                            </div>
                        )}
                        {isTemporaryError && (
                            <div>
                                <p className="booking_result__message">
                                    Something went wrong. Please try again.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div >
        </main >

    );
}