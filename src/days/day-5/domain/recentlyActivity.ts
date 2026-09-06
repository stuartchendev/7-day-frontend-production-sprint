import type { Ticket, TicketHistoryEntry } from "../type";


type RecentActivity = {
    id: string;
    ticketId: string;
    action: TicketHistoryEntry['action'];
    timestamp: string;
};

export function getRecentActivity(tickets: Ticket[]): RecentActivity[] {
    return tickets
        .flatMap((ticket) =>
            ticket.history.map((entry) => ({
                id: entry.id,
                ticketId: ticket.id,
                action: entry.action,
                timestamp: entry.timestamp,
            }))
        )
        .sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
        )
        .slice(0, 4);
}