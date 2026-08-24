import { workshopArticles } from '../data/workshopArticles'
import type { KnowledgeArticle } from '../types'
import type { SearchAdapter } from './searchAdapter'

export const MOCK_SEARCH_LATENCY_MS = 320
export const MOCK_SEARCH_FAILURE_QUERY = 'simulate error'
export const MOCK_SEARCH_FAILURE_MESSAGE =
  'The workshop knowledge base is temporarily unavailable.'

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function matchesQuery(article: KnowledgeArticle, query: string) {
  const searchableText = [
    article.title,
    article.summary,
    article.category,
    ...article.keywords,
  ]
    .join(' ')
    .toLowerCase()

  return searchableText.includes(query)
}

function createAbortError() {
  return new DOMException('Search aborted', 'AbortError')
}

function waitForMockLatency(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError())
      return
    }

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, MOCK_SEARCH_LATENCY_MS)

    function handleAbort() {
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', handleAbort)
      reject(createAbortError())
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

export const mockSearchAdapter: SearchAdapter = {
  async search({ query, signal }) {
    const normalizedQuery = normalize(query)

    await waitForMockLatency(signal)
    signal?.throwIfAborted()

    if (normalizedQuery === MOCK_SEARCH_FAILURE_QUERY) {
      throw new Error(MOCK_SEARCH_FAILURE_MESSAGE)
    }

    if (!normalizedQuery) {
      return []
    }

    return workshopArticles.filter((article) =>
      matchesQuery(article, normalizedQuery),
    )
  },
}
