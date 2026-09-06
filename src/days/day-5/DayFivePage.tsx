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
        useState<Ticket['status'] | 'all'>('all');

    const [selectedTicket, setSelectedTicket] =
        useState<string | null>(null);

    const [isBlocking, setIsBlocking] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    const filteredTickets =
        selectedStatus === 'all'
            ? tickets
            : tickets.filter((ticket) => ticket.status === selectedStatus);

    const allStatus = {
        label: 'All',
        status: 'all' as const,
        count: tickets.length,
    };

    const withCountStatus = [
        allStatus,
        ...statuses.map((status) => ({
            ...status,
            count: tickets.filter(
                (ticket) => ticket.status === status.status
            ).length,
        })),
    ];

    const selectedTicketData = tickets.find((ticket) => ticket.id === selectedTicket)

    const handleBackToList = () => {
        setSelectedTicket(null);
        setIsBlocking(false);
        setBlockReason('');
    }


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

        if (
            action.type === 'resolve' ||
            action.type === 'block' ||
            action.type === 'resume'
        ) {
            setSelectedStatus('all');
            handleBackToList();
        }
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
                                    handleBackToList();
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
                                        onClick={() => handleBackToList()}
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

                                {selectedTicketData.status === 'blocked' && (
                                    <div className="day-five__detail-field">
                                        <span className="day-five__detail-label">Block reason</span>
                                        <p>{selectedTicketData.blockReason}</p>
                                    </div>
                                )}

                                <div className="day-five__detail-actions">
                                    {selectedTicketData.status === 'processing' ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleTicketAction({
                                                        type: 'resolve',
                                                        ticketId: selectedTicketData.id,
                                                    })
                                                }
                                            >
                                                Resolve
                                            </button>

                                            {!isBlocking && (
                                                <button
                                                    onClick={() => setIsBlocking(true)}
                                                >
                                                    Block
                                                </button>
                                            )}
                                        </>
                                    ) : selectedTicketData.status === 'blocked' ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleTicketAction({
                                                        type: 'resume',
                                                        ticketId: selectedTicketData.id,
                                                    })
                                                }
                                            >
                                                Resume
                                            </button>
                                            {!isBlocking && (
                                                <button
                                                    onClick={() => setIsBlocking(true)}
                                                >
                                                    Block
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <p className="day-five__resolve-message">✓ Ticket resolved</p>
                                        </>
                                    )}
                                    {isBlocking && (
                                        <div className="day-five__block-panel">
                                            <p className="day-five__eyebrow">Block ticket</p>

                                            <label htmlFor="block-reason">
                                                Reason
                                            </label>

                                            <textarea
                                                id="block-reason"
                                                value={blockReason}
                                                onChange={(event) =>
                                                    setBlockReason(event.target.value)
                                                }
                                                placeholder="Why is this ticket blocked?"
                                            />

                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsBlocking(false);
                                                        setBlockReason('');
                                                    }}
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={!blockReason.trim()}
                                                    onClick={() => {
                                                        handleTicketAction({
                                                            type: 'block',
                                                            ticketId: selectedTicketData.id,
                                                            blockReason: blockReason.trim(),
                                                        });

                                                        setIsBlocking(false);
                                                        setBlockReason('');
                                                    }}
                                                >
                                                    Confirm block
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="day-five__detail-history">
                                <div className="day-five__detail-history-heading">
                                    <p className="day-five__eyebrow">Transition history</p>
                                </div>

                                <div className="day-five__history-list">
                                    {selectedTicketData.history.length > 0 ? (
                                        selectedTicketData.history.map((entry) => (
                                            <div className="day-five__history-item" key={entry.id}>
                                                <div className="day-five__history-marker">
                                                    <span />
                                                </div>

                                                <div className="day-five__history-meta">
                                                    <time>{entry.timestamp}</time>
                                                    <strong>{entry.action}</strong>
                                                </div>

                                                <p>{entry.action === 'resume' ?
                                                    `Block resolved: ${entry.note}` : entry.note}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="day-five__history-empty">
                                            No transition history yet.
                                        </p>
                                    )}
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
            </div >
        </main >
    )
}