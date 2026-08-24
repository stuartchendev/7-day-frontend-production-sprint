import type { KnowledgeArticle } from '../types'

export type SearchRequest = {
  query: string
  signal?: AbortSignal
}

export type SearchAdapter = {
  search(request: SearchRequest): Promise<KnowledgeArticle[]>
}
