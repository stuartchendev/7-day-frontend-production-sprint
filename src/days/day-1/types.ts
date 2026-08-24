export type KnowledgeArticle = {
  id: string
  title: string
  summary: string
  category: 'Booking' | 'Payments' | 'Policies' | 'Before your visit'
  keywords: string[]
}
