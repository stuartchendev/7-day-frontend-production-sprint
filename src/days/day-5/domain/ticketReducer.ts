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
            case 'start':
                return {
                    ...ticket,
                    status: 'processing',
                    handling: 'Investigating the reported issue',
                };

            case 'resolve':
                return {
                    ...ticket,
                    status: 'resolved',
                    handling: 'Issue resolved',
                };

            case 'block':
                return {
                    ...ticket,
                    status: 'blocked',
                    handling: 'Waiting for the required information',
                    blockReason: action.blockReason,
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
                            note: `Resumed after block: ${blockReason}`,
                        },
                    ],
                };
            }

            default:
                return ticket;
        }
    });
}