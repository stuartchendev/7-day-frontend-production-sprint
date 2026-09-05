import { useReducer, useState } from "react";
import type { Ticket, TicketAction } from "./type";
import { ticketTransitions } from "./type";
import { Link } from "react-router-dom";
import { initialTickets, statuses } from "./tickets";
import './day-five.css'
import { ticketReducer } from "./domain/ticketReducer";

const recentActivity = [
    {
        id: 'activity-1',
        ticketId: 'T-002',
        action: 'Started processing',
        timestamp: '10 min ago',
    },
    {
        id: 'activity-2',
        ticketId: 'T-003',
        action: 'Ticket blocked',
        timestamp: '24 min ago',
    },
    {
        id: 'activity-3',
        ticketId: 'T-004',
        action: 'Ticket resolved',
        timestamp: '1 hr ago',
    },
    {
        id: 'activity-4',
        ticketId: 'T-001',
        action: 'Ticket assigned',
        timestamp: '2 hrs ago',
    },
];
function isValidTicketTransition(
    state: Ticket,
    action: TicketAction
): boolean {
    return ticketTransitions[state.status].includes(action.type as never);
}

export function DayFivePage() {
    const [tickets, dispatch] = useReducer(
        ticketReducer,
        initialTickets
    );
    const [selectedStatus, setSelectedStatus] =
        useState<Ticket['status'] | null>(null);

    const [selectedTicket, setSelectedTicket] =
        useState<string | null>(null);

    const filteredTickets = selectedStatus
        ? tickets.filter((ticket) => ticket.status === selectedStatus)
        : tickets;

    const withCountStatus = statuses.map((status) => ({
        ...status,
        count: tickets.filter(
            (ticket) => ticket.status === status.status
        ).length,
    }));

    const selectedTicketData = tickets.find((ticket) => ticket.id === selectedTicket)

    const handleTicketAction = (action: TicketAction) => {

        if (!selectedTicketData) {
            return;
        }

        if (!isValidTicketTransition(selectedTicketData, action)) {
            return;
        }

        dispatch({
            ...action,
            ticketId: selectedTicketData.id,
        });
    };


    return (
        <main className="day-five">
            <div className="day-five__intro">
                <Link className="day-five__back-link" to="/">
                    ← Back to Sprint Home
                </Link>

                <header className="day-five__header">
                    <p className="day-five__eyebrow">Day 5 · Ticket workflow</p>
                    <h1>Clear states, explicit transitions</h1>
                    <p>
                        Tickets move through explicit workflow states, with each state exposing
                        only the actions and data it needs.
                    </p>
                </header>
            </div>

            <div className="day-five__workspace">
                <section className="day-five__overview">
                    <div className="day-five__section-heading">
                        <p className="day-five__eyebrow">Status overview</p>
                        <h2>Work across the queue</h2>
                    </div>

                    <div className="day-five__status-grid">
                        {withCountStatus.map((status) => (
                            <button
                                className={`day-five__status-card day-five__status-card--${status.status} ${selectedStatus === status.status
                                    ? 'day-five__status-card--selected'
                                    : ''
                                    }`}
                                type="button"
                                key={status.status}
                                onClick={() => {
                                    setSelectedStatus(status.status);
                                    setSelectedTicket(null);
                                }}
                            >
                                <div>
                                    <p>{status.label}</p>
                                    <strong>{status.count}</strong>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <div className="day-five__main-grid">
                    {selectedTicketData ? (
                        <section className="day-five__detail">
                            <div className="day-five__detail-header">
                                <div>
                                    <button
                                        className="day-five__detail-back"
                                        type="button"
                                        onClick={() => setSelectedTicket(null)}
                                    >
                                        ← Back to ticket list
                                    </button>
                                    <div className="day-five__detail-meta">
                                        <p className="day-five__ticket-id">{selectedTicketData.id}</p>

                                        <span
                                            className={`day-five__status-pill day-five__status-pill--${selectedTicketData.status}`}
                                        >
                                            {selectedTicketData.status}
                                        </span>
                                    </div>

                                    <h2>{selectedTicketData.title}</h2>
                                </div>
                            </div>

                            <div className="day-five__detail-content">
                                <div className="day-five__report">
                                    <p className="day-five__eyebrow">Report</p>
                                    <p>{selectedTicketData.report}</p>
                                </div>

                                <div className="day-five__handling">
                                    <p className="day-five__eyebrow">Current handling</p>
                                    <p>{selectedTicketData.handling}</p>
                                </div>

                                <div className="day-five__detail-actions">
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => handleTicketAction({ type: 'resolve' })}>Resolve</button>
                                        <button type="button">Block</button>
                                    </div>
                                </div>
                            </div>

                            <div className="day-five__detail-history">
                                <div className="day-five__detail-history-heading">
                                    <p className="day-five__eyebrow">Transition history</p>
                                </div>

                                <div className="day-five__history-list">
                                    {selectedTicketData.history.map((entry) => (
                                        <div className="day-five__history-item" key={entry.id}>
                                            <div className="day-five__history-marker">
                                                <span />
                                            </div>

                                            <div className="day-five__history-meta">
                                                <time>{entry.timestamp}</time>
                                                <strong>{entry.action}</strong>
                                            </div>

                                            <p>{entry.note}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className="day-five__tickets">
                            {/* Ticket List */}
                            <div className="day-five__section-heading day-five__ticket-heading">
                                <div>
                                    <p className="day-five__eyebrow">Ticket list</p>
                                    <h2>Maintenance requests</h2>
                                </div>
                                <button
                                    className="day-five__ticket-viewall"
                                    type="button"
                                    onClick={() => setSelectedStatus(null)}
                                >
                                    View all
                                </button>
                            </div>
                            <div className="day-five__ticket-list">
                                {filteredTickets.map((ticket) => (
                                    <button
                                        className="day-five__ticket-card"
                                        key={ticket.id}
                                        type="button"
                                        onClick={() => setSelectedTicket(ticket.id)}
                                    >
                                        <div className="day-five__ticket-info">
                                            <p className="day-five__ticket-id">{ticket.id}</p>
                                            <h3>{ticket.title}</h3>
                                            <p>{ticket.report}</p>
                                        </div>

                                        <span
                                            className={`day-five__status-pill day-five__status-pill--${ticket.status}`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                    <section className="day-five__activity">
                        <div className="day-five__activity-heading">
                            <p className="day-five__eyebrow">History Activity</p>
                            <h2>Maintenance requests</h2>
                        </div>
                        <div className="day-five__activity-list">
                            {recentActivity.map((activity) => (
                                <div className="day-five__activity-item" key={activity.id}>
                                    <div>
                                        <strong>{activity.ticketId}</strong>
                                        <p>{activity.action}</p>
                                    </div>

                                    <time>{activity.timestamp}</time>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main >
    )
}