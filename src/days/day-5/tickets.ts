import type { Ticket } from "./type";

export const initialTickets: Ticket[] = [
    {
        id: 'T-001',
        title: 'Air conditioner issue',
        status: 'assigned',
        report: 'The air conditioner is not cooling.',
        history: [
            {
                id: 'history-1',
                action: 'Assigned',
                timestamp: '08:42',
                note: 'Ticket assigned to maintenance team',
            },
        ],
    },
    {
        id: 'T-002',
        title: 'Printer unavailable',
        status: 'processing',
        report: 'The printer is not responding when users try to print.',
        handling: 'Checking the printer connection and power status',
        history: [
            {
                id: 'history-1',
                action: 'Assigned',
                timestamp: '09:12',
                note: 'Ticket assigned to maintenance team',
            },
            {
                id: 'history-2',
                action: 'Started processing',
                timestamp: '09:24',
                note: 'Investigation started',
            },
        ],
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
                id: 'history-1',
                action: 'Assigned',
                timestamp: '08:56',
                note: 'Ticket assigned to maintenance team',
            },
            {
                id: 'history-2',
                action: 'Started processing',
                timestamp: '09:18',
                note: 'Network issue investigation started',
            },
            {
                id: 'history-3',
                action: 'Blocked',
                timestamp: '09:47',
                note: 'Waiting for network equipment replacement',
            },
        ],
    },
    {
        id: 'T-004',
        title: 'Office lighting failure',
        status: 'resolved',
        report: 'The lights in the meeting room are not working.',
        handling: 'Replaced the faulty lighting fixture',
        history: [
            {
                id: 'history-1',
                action: 'Assigned',
                timestamp: '07:35',
                note: 'Ticket assigned to maintenance team',
            },
            {
                id: 'history-2',
                action: 'Started processing',
                timestamp: '07:48',
                note: 'Faulty lighting fixture identified',
            },
            {
                id: 'history-3',
                action: 'Resolved',
                timestamp: '08:16',
                note: 'Lighting fixture replaced successfully',
            },
        ],
    },
];

export const statuses: {
    label: string;
    status: Ticket['status'];
}[] = [
        { label: 'Assigned', status: 'assigned' },
        { label: 'Processing', status: 'processing' },
        { label: 'Blocked', status: 'blocked' },
        { label: 'Resolved', status: 'resolved' },
    ];