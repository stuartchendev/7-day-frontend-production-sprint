import { mockSearchAdapter } from './mockSearchAdapter'
import type { SearchRequest } from './searchAdapter'

export const searchService = {
  search(request: SearchRequest) {
    return mockSearchAdapter.search(request)
  },
}
