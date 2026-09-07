# Day 1 — Knowledge Base Search

A production-minded async search experience focused on request ownership and stale-response prevention.

## Engineering focus

Day 1 makes async search ownership visible. The core rule is:

> **Every request may finish. Only the latest request earns render ownership.**

Valid queries debounce before starting a request. A new query cancels obsolete work with `AbortController`, while the reducer independently rejects stale successes and failures by request ID.

`activeRequestId` identifies the request currently allowed to settle; `renderedRequestId` identifies the last accepted request whose results remain visible, including while a newer request is loading.

## Observability

The mock adapter uses deterministic latency so overlapping requests can be tested reliably.

Signal events explain the lifecycle through a separate presentation queue, so observability pacing never delays search execution or result rendering.

The trade-off is extra observability plumbing, kept deliberately separate from product correctness.
