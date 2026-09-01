export type BookingStatus =
    | 'idle'
    | 'loading'
    | 'success'
    | 'temporary-error'
    | 'conflict'


export type TimeSlot = {
    time: string
    available: boolean
}


export type AvailabilitySnapshot = {
    date: string
    slots: TimeSlot[]
}

export type Reservation = {
    id: string
    date: string
    time: string
}

export type BookingState = {
    selectedDate: string
    selectedTime: string | null
    availability: AvailabilitySnapshot | null
    bookingStatus: BookingStatus
    reservations: Reservation[]
    confirmation: Reservation | null
}


export const initialBookingState: BookingState = {
    selectedDate: '',
    selectedTime: null,
    availability: null,
    bookingStatus: 'idle',
    reservations: [],
    confirmation: null
}

export type BookingResult =
    | {
        status: 200
        reservation: Reservation
    }
    | {
        status: 503
    }
    | {
        status: 409
    }


export type BookingAction =
    | {
        type: 'reserve-start'
    }
    | {
        type: 'reserve-success'
        reservation: Reservation
    }
    | {
        type: 'reserve-temporary-error'
    }
    | {
        type: 'reserve-conflict'
    }
    | {
        type: 'select-date'
        date: string
    }
    | {
        type: 'select-time'
        time: string
    }
    | {
        type: 'booking-reset'
    } | {
        type: 'availability-loaded'
        availability: AvailabilitySnapshot
    }