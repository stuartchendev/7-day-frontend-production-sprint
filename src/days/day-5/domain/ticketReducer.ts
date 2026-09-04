import type { Ticket, TicketAction } from "../type";

export function ticketReducer(
    state: Ticket,
    action: TicketAction
): Ticket {
    switch (action.type) {
        case "start":
            return {
                ...state,
                status: 'processing',
                handling: 'Investigating the reported issue',
            }
        case "resolve":
            return {
                ...state,
                status: 'resolved',
                handling: 'Issue resolved',
            };
        case "block":
            return {
                ...state,
                status: 'blocked',
                handling: 'Waiting for the required information',
                blockReason: action.blockReason
            };
        case "resume": {
            const blockedState = state as Extract<
                Ticket,
                { status: 'blocked' }
            >;

            const { blockReason, ...rest } = blockedState;

            return {
                ...rest,
                status: 'processing',
                handling: 'Resuming investigation',
                history: [
                    ...state.history,
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
            return state;
    }
}