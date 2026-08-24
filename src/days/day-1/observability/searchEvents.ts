export type SearchEvent =
  | {
      type: 'REQUEST_STARTED'
      requestId: string
      timestamp: number
    }
  | {
      type: 'REQUEST_ABORTED'
      requestId: string
      timestamp: number
    }
  | {
      type: 'RESPONSE_ACCEPTED'
      requestId: string
      elapsedMs: number
      timestamp: number
    }
  | {
      type: 'RESPONSE_IGNORED'
      requestId: string
      elapsedMs: number
      timestamp: number
    }
