import type { KnowledgeArticle } from '../types'

export const workshopArticles: KnowledgeArticle[] = [
  {
    id: 'booking-a-workshop',
    title: 'Booking a workshop session',
    summary:
      'Choose an available date and reserve your place online. Your booking is confirmed when the confirmation email arrives.',
    category: 'Booking',
    keywords: ['reservation', 'class schedule', 'availability', 'confirmation'],
  },
  {
    id: 'payments-and-receipts',
    title: 'Payments, deposits, and receipts',
    summary:
      'Pay securely by card when you book. Private group sessions may require a deposit, with the remaining balance due before the visit.',
    category: 'Payments',
    keywords: ['credit card', 'deposit', 'invoice', 'receipt', 'balance'],
  },
  {
    id: 'rescheduling-and-cancellation',
    title: 'Rescheduling or cancelling a booking',
    summary:
      'Contact the studio at least 48 hours before your session to move your booking or review the applicable cancellation terms.',
    category: 'Policies',
    keywords: ['reschedule', 'cancellation', 'refund', '48 hours', 'change date'],
  },
  {
    id: 'beginner-friendly-workshops',
    title: 'Are workshops suitable for beginners?',
    summary:
      'Yes. Tutors demonstrate each step and provide individual guidance, so no previous workshop experience is required.',
    category: 'Before your visit',
    keywords: ['first-timer', 'beginner friendly', 'experience level', 'instruction'],
  },
  {
    id: 'private-group-bookings',
    title: 'Private and group bookings',
    summary:
      'Groups can request a private session for celebrations, team activities, or school visits, subject to studio capacity.',
    category: 'Booking',
    keywords: ['team event', 'birthday', 'school group', 'private class', 'capacity'],
  },
  {
    id: 'prepare-for-your-visit',
    title: 'What to bring and when to arrive',
    summary:
      'Arrive ten minutes early in comfortable clothes. The studio supplies tools, materials, aprons, and safety equipment.',
    category: 'Before your visit',
    keywords: ['arrival time', 'clothing', 'materials', 'apron', 'tools'],
  },
  {
    id: 'studio-safety-and-access',
    title: 'Studio safety, age, and accessibility policies',
    summary:
      'Review age guidance before booking and contact the studio to discuss accessibility needs or workshop-specific safety requirements.',
    category: 'Policies',
    keywords: ['minimum age', 'wheelchair access', 'safety rules', 'accessibility'],
  },
]
