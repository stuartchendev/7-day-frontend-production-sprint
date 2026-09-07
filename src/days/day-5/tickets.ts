import type { Ticket, Statuses } from "./type";

export const initialTickets: Ticket[] = [
    {
        id: 'T-001',
        title: 'Air conditioner issue',
        status: 'processing',
        report: 'The air conditioner is not cooling.',
        handling: 'Investigating the reported issue',
        history: [],
    },
    {
        id: 'T-002',
        title: 'Printer unavailable',
        status: 'processing',
        report: 'The printer is not responding when users try to print.',
        handling: 'Checking the printer connection and power status',
        history: [],
    },
    {
        id: 'T-003',
        title: 'Office network outage',
        status: 'blocked',
        report: 'Several workstations cannot connect to the office network.',
        handling: 'Checking the network equipment and connection status',
        blockReason: 'Waiting for network equipment replacement',
        history: [
            {
                id: 'T-003',
                action: 'block',
                timestamp: '2026-09-04T10:30:00Z',
                note: 'Waiting for network equipment replacement',
            },
        ],
    },
    {
        id: 'T-004',
        title: 'Office lighting failure',
        status: 'resolved',
        report: 'The lights in the meeting room are not working.',
        handling: 'Issue resolved',
        history: [
            {
                id: 'T-004',
                action: 'resolve',
                timestamp: '2026-09-05T11:30:00Z',
            },
        ],
    },
];

export const statuses: Statuses[] = [
    { label: 'Processing', status: 'processing' },
    { label: 'Blocked', status: 'blocked' },
    { label: 'Resolved', status: 'resolved' },
];