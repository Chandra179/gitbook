# Cache  Stampede

## Problem

What happens if we have a cache where 100k requests hit simultaneously just as the cache expires? All 100k requests would hit the database (DB) at the exact same time, causing contention, errors, and potential DB failure. How do we prevent it?

## Solution

* **Request Coalescing**: When the Redis cache expires, instead of allowing all requests to hit the DB, we use in-memory lock (like mutex) so only one request proceeds. The first request acquires the mutex, fetches the data from the DB, and updates the cache.
  * What happens to the other requests? Requests that attempted to acquire the lock while it was held are "parked." Once the "winner" finishes and updates the cache, the "waiters" are woken up to consume the new result from memory without ever touching the DB.
* **Stay-Ahead Strategy**: Instead of waiting for the TTL to expire reactively, we use a proactive approach. As the TTL nears its end, the system performs a "random roll" to decide if a request should "volunteer" to refresh the data early. This ensures the cache is refreshed before it hits zero, eliminating cache misses and maintaining constant latency.
* **Resilience & Fail-Safe**: We must account for failures during lock acquisition or network issues. If many requests wait in a queue in RAM, it can lead to Out of Memory (OOM) errors. To prevent this, we implement timeouts and graceful degradation.

### Coalescing

<figure><img src="../.gitbook/assets/image (4).png" alt="" width="375"><figcaption></figcaption></figure>

* You use a local lock to ensure only one thread per server hits the DB.
* Waiters stay "parked" while the Winner fetches data. Once the Winner populates the shared memory, the Waiters are "woken up" to consume that exact result.

## Stay Ahead Strategy

<figure><img src="../.gitbook/assets/image (5).png" alt=""><figcaption></figcaption></figure>

* Transition from Reactive (fixing a miss) to Proactive (preventing a miss).
* By refreshing the data based on a probability curve before the TTL expires, the DB hit happens in the background. The user never experiences the latency of a cache miss

## Fail Safe

<figure><img src="../.gitbook/assets/mermaid-diagram-2026-04-26-154109.png" alt="" width="563"><figcaption></figcaption></figure>

* Protect System Resources: If the "Winner" or the DB fails, you must protect the server's RAM and CPU.
* Implement `context.WithTimeout` for Waiters. If the Winner doesn't return within a specific threshold (e.g., 500ms), the Waiters stop waiting to prevent an OOM crash.
* Graceful Degradation: Instead of returning an error, the system can return "Stale" data. It is often better to show a slightly outdated price than a "Service Unavailable" error.
