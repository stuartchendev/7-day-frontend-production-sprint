import type { Ticket, TicketAction } from "../type";

export function ticketReducer(
    state: Ticket[],
    action: TicketAction
): Ticket[] {
    return state.map((ticket) => {
        if (ticket.id !== action.ticketId) {
            return ticket;
        }

        switch (action.type) {
            case 'resolve':
                return {
                    ...ticket,
                    status: 'resolved',
                    handling: 'Issue resolved',
                    history: [
                        ...ticket.history,
                        {
                            id: crypto.randomUUID(),
                            action: 'resolve',
                            timestamp: new Date().toISOString(),
                        },
                    ],
                };

            case 'block':
                return {
                    ...ticket,
                    status: 'blocked',
                    handling: 'Waiting for the required information',
                    blockReason: action.blockReason,
                    history: [
                        ...ticket.history,
                        {
                            id: crypto.randomUUID(),
                            action: 'block',
                            timestamp: new Date().toISOString(),
                            note: action.blockReason,
                        },
                    ],
                };

            case 'resume': {
                const blockedTicket = ticket as Extract<
                    Ticket,
                    { status: 'blocked' }
                >;

                const { blockReason, ...rest } = blockedTicket;

                return {
                    ...rest,
                    status: 'processing',
                    handling: 'Resuming investigation',
                    history: [
                        ...ticket.history,
                        {
                            id: crypto.randomUUID(),
                            action: 'resume',
                            timestamp: new Date().toISOString(),
                            note: blockReason,
                        },
                    ],
                };
            }
            default:
                return ticket;
        }
    });
}