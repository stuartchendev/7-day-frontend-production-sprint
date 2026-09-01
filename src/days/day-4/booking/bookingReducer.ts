import type { BookingAction, BookingState } from "./type"

export function bookingReducer(
    state: BookingState,
    action: BookingAction,
): BookingState {
    switch (action.type) {
        case 'availability-loaded':
            return {
                ...state,
                availability: action.availability,
            }
        case 'reserve-start':
            return {
                ...state,
                bookingStatus: 'loading',
                confirmation: null,
            }
        case 'reserve-success':
            return {
                ...state,
                bookingStatus: 'success',
                reservations: [
                    ...state.reservations,
                    action.reservation,
                ],
                confirmation: action.reservation,
            }
        case 'reserve-temporary-error':
            return {
                ...state,
                bookingStatus: 'temporary-error',
            }
        case 'reserve-conflict':
            return {
                ...state,
                bookingStatus: 'conflict',
            }
        case 'select-date':
            return {
                ...state,
                selectedDate: action.date,
                selectedTime: null,
                bookingStatus: 'idle',
                confirmation: null,
                availability: null,
            }
        case 'select-time':
            return {
                ...state,
                selectedTime: action.time,
            }
        case 'booking-reset':
            return {
                ...state,
                bookingStatus: 'idle',
            }
        default:
            return state
    }
}