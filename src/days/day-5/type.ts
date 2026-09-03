export type TicketHistoryEntry = {
    id: string;
    action: string;
    timestamp: string;
    note?: string;
};

type BaseTicket = {
    id: string;
    title: string;
    report: string;
    history: TicketHistoryEntry[];
};

export type Ticket = BaseTicket & (
    | {
        status: 'assigned';
    }
    | {
        status: 'processing';
        handling: string;
    }
    | {
        status: 'blocked';
        handling: string;
        blockReason: string;
    }
    | {
        status: 'resolved';
        handling: string;
    }
);

export type TicketAction =
    | { type: 'start' }
    | { type: 'resolve' }
    | { type: 'block'; blockReason: string }
    | { type: 'resume' };

type TicketTransitions = {
    assigned: ['start'];
    processing: ['resolve', 'block'];
    blocked: ['resume'];
    resolved: [];
};

export const ticketTransitions = {
    assigned: ['start'],
    processing: ['resolve', 'block'],
    blocked: ['resume'],
    resolved: [],
} satisfies TicketTransitions;