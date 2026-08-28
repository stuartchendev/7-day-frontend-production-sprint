import { describe, expect, it } from 'vitest'
import { bookingReducer } from './bookingReducer'
import { initialBookingState } from './type'



describe('bookingReducer', () => {
    // reserve start
    it('sets booking status to loading when reservation starts', () => {
        const nextState = bookingReducer(
            initialBookingState,
            { type: 'reserve-start' },
        )

        expect(nextState.bookingStatus).toBe('loading')
    })
    // success
    it('stores the reservation and marks booking as success', () => {
        const reservation = {
            id: 'reservation-1',
            date: '2026-08-28',
            time: '18:00',
        }

        const nextState = bookingReducer(
            initialBookingState,
            {
                type: 'reserve-success',
                reservation,
            },
        )

        expect(nextState.bookingStatus).toBe('success')
        expect(nextState.reservations).toEqual([reservation])
        expect(initialBookingState).toEqual({
            selectedDate: '',
            selectedTime: null,
            availability: null,
            bookingStatus: 'idle',
            reservations: [],
        })
    })
    // 503
    it('sets temporary-error when booking temporarily fails', () => {
        const nextState = bookingReducer(
            initialBookingState,
            { type: 'reserve-temporary-error' },
        )

        expect(nextState.bookingStatus).toBe('temporary-error')
    })
    // 409
    it('sets conflict when the booking conflicts', () => {
        const nextState = bookingReducer(
            initialBookingState,
            { type: 'reserve-conflict' },
        )

        expect(nextState.bookingStatus).toBe('conflict')
    })
    // clear selected
    it('clears selected time when the date changes', () => {
        const state = {
            ...initialBookingState,
            selectedDate: '2026-08-28',
            selectedTime: '18:30',
        }

        const nextState = bookingReducer(
            state,
            {
                type: 'select-date',
                date: '2026-08-29',
            },
        )

        expect(nextState.selectedDate).toBe('2026-08-29')
        expect(nextState.selectedTime).toBeNull()
    })
})