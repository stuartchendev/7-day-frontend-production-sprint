import { describe, expect, it } from 'vitest';
import { getRecentActivity } from './recentlyActivity';
import type { Ticket } from '../type';

describe('getRecentActivity', () => {
    it('derives recent activity from ticket histories', () => {
        const tickets: Ticket[] = [
            {
                id: 'T-001',
                title: 'Air conditioner issue',
                report: 'The air conditioner is not cooling.',
                status: 'processing',
                handling: 'Investigating the reported issue',
                history: [
                    {
                        id: 'H-001',
                        action: 'block',
                        timestamp: '2026-09-06T10:00:00Z',
                        note: 'Waiting for maintenance information',
                    },
                    {
                        id: 'H-002',
                        action: 'resume',
                        timestamp: '2026-09-06T11:00:00Z',
                        note: 'Waiting for maintenance information',
                    },
                ],
            },
            {
                id: 'T-002',
                title: 'Printer unavailable',
                report: 'The printer is not responding.',
                status: 'resolved',
                handling: 'Issue resolved',
                history: [
                    {
                        id: 'H-003',
                        action: 'resolve',
                        timestamp: '2026-09-06T12:00:00Z',
                    },
                ],
            },
        ];

        const result = getRecentActivity(tickets);

        expect(result).toHaveLength(3);

        expect(result[0]).toEqual({
            id: 'H-003',
            ticketId: 'T-002',
            action: 'resolve',
            timestamp: '2026-09-06T12:00:00Z',
        });

        expect(result[1]).toEqual({
            id: 'H-002',
            ticketId: 'T-001',
            action: 'resume',
            timestamp: '2026-09-06T11:00:00Z',
        });

        expect(result[2]).toEqual({
            id: 'H-001',
            ticketId: 'T-001',
            action: 'block',
            timestamp: '2026-09-06T10:00:00Z',
        });
    });

    it('returns only the four most recent activities', () => {
        const tickets: Ticket[] = [
            {
                id: 'T-001',
                title: 'Test ticket',
                report: 'Test report',
                status: 'processing',
                handling: 'Investigating',
                history: [
                    {
                        id: 'H-001',
                        action: 'block',
                        timestamp: '2026-09-06T08:00:00Z',
                    },
                    {
                        id: 'H-002',
                        action: 'resume',
                        timestamp: '2026-09-06T09:00:00Z',
                    },
                    {
                        id: 'H-003',
                        action: 'block',
                        timestamp: '2026-09-06T10:00:00Z',
                    },
                    {
                        id: 'H-004',
                        action: 'resume',
                        timestamp: '2026-09-06T11:00:00Z',
                    },
                ],
            },
        ];

        const result = getRecentActivity(tickets);

        expect(result).toHaveLength(4);

        expect(result.map((activity) => activity.id)).toEqual([
            'H-004',
            'H-003',
            'H-002',
            'H-001',
        ]);
    });
});