export type TicketHistoryEntry = {
    id: string;
    action: 'resolve' | 'block' | 'resume';
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
    {
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
    | { type: 'resolve'; ticketId: string }
    | { type: 'block'; ticketId: string; blockReason: string }
    | { type: 'resume'; ticketId: string };

type TicketTransitions = {
    processing: ['resolve', 'block'];
    blocked: ['resume', 'block'],
    resolved: [];
};

export const ticketTransitions = {
    processing: ['resolve', 'block'],
    blocked: ['resume', 'block'],
    resolved: [],
} satisfies TicketTransitions;

export type Statuses = {
    label: string;
    status: Ticket['status'];
}