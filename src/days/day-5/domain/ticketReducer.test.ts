import { describe, expect, it } from 'vitest';
import { ticketReducer } from './ticketReducer';

// notes
// processing → resolved
// processing → blocked
// resume -> processing
// blocked → processing
// blocked → blocked



describe('ticketReducer', () => {
    // processing -> resolved
    it('resolves a processing ticket', () => {
        const processingTicket = {
            id: 'T-001',
            title: 'Air conditioner issue',
            report: 'The air conditioner is not cooking',
            status: 'processing' as const,
            handling: 'Investigating the reported issue',
            history: [],
        }
        const otherTicket = {
            id: 'T-002',
            title: 'Printer unavailable',
            report: 'The printer is not responding.',
            status: 'processing' as const,
            handling: 'Checking the printer connection',
            history: [],
        };

        const newState = ticketReducer(
            [processingTicket, otherTicket],
            { type: 'resolve', ticketId: 'T-001' }
        );

        expect(newState[0].status).toBe('resolved');
        expect(newState[0].handling).toBe('Issue resolved')

        expect(newState[0].history).toHaveLength(1);
        expect(newState[0].history[0].action).toBe('resolve');
        expect(newState[0].history[0].note).toBeUndefined();
    })

    // processing -> blocked
    it('blocks a processing ticket with a reason', () => {
        const processingTicket = {
            id: 'T-001',
            title: 'Air conditioner issue',
            report: 'The air conditioner is not cooking',
            status: 'processing' as const,
            handling: 'Investigating the reported issue',
            history: [],
        }
        const newState = ticketReducer(
            [processingTicket],
            {
                type: 'block',
                ticketId: 'T-001',
                blockReason: 'Waiting for maintenance information',
            }
        );

        expect(newState[0].status).toBe('blocked');
        expect(newState[0].handling).toBe(
            'Waiting for the required information'
        );
        expect(newState[0].history).toHaveLength(1);
        expect(newState[0].history[0].action).toBe('block');
        expect(newState[0].history[0].note).toBe(
            'Waiting for maintenance information'
        );
    })

    // resume -> processing
    it('resumes a blocked ticket and preserves the block reason in histroy', () => {
        const blockedTicket = {
            id: 'T-001',
            title: 'Air conditioner issue',
            report: 'The air conditioner is not cooling.',
            status: 'blocked' as const,
            handling: 'Waiting for the required information',
            blockReason: 'Waiting for maintenance information',
            history: [
                {
                    id: 'H-001',
                    action: 'block' as const,
                    timestamp: '2026-09-04T10:30:00Z',
                    note: 'Waiting for maintenance information',
                },
            ],
        };

        const newState = ticketReducer(
            [blockedTicket],
            { type: 'resume', ticketId: 'T-001' }
        );

        expect(newState[0].status).toBe('processing');
        expect(newState[0].handling).toBe('Resuming investigation');

        expect(newState[0].history).toHaveLength(2);
        expect(newState[0].history[1].action).toBe('resume');
        expect(newState[0].history[1].note).toBe(
            'Waiting for maintenance information'
        );
    })

    // blocked → blocked
    it('adds a new block transition when blocking an already blocked ticket', () => {
        const blockedTicket = {
            id: 'T-001',
            title: 'Air conditioner issue',
            report: 'The air conditioner is not cooling.',
            status: 'blocked' as const,
            handling: 'Waiting for the required information',
            blockReason: 'Waiting for maintenance information',
            history: [
                {
                    id: 'H-001',
                    action: 'block' as const,
                    timestamp: '2026-09-04T10:30:00Z',
                    note: 'Waiting for maintenance information',
                },
            ],
        };

        const newState = ticketReducer(
            [blockedTicket],
            {
                type: 'block',
                ticketId: 'T-001',
                blockReason: 'Waiting for customer confirmation',
            }
        );

        expect(newState[0].status).toBe('blocked');
        expect(newState[0].blockReason).toBe(
            'Waiting for customer confirmation'
        );

        expect(newState[0].history).toHaveLength(2);
        expect(newState[0].history[0].action).toBe('block');
        expect(newState[0].history[1].action).toBe('block');
        expect(newState[0].history[1].note).toBe(
            'Waiting for customer confirmation'
        );
    });
});