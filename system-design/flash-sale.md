# Flash Sale

### The Scenario: The "Jakarta-Tokyo 90% Off" Event

* **Context:** A specific flight route is discounted by 90%.
* **Traffic:** 50x normal peak (e.g., 100k concurrent users).
* **Bottleneck:** Every request targets the same `Flight_ID` (Read Hot Key) and attempts to update the same `Inventory_ID` (Write Hot Key).

***

### Hot Key

A **Hot Key** occurs when a disproportionately high amount of traffic targets a single data entry, saturating the specific database row or Redis shard where it resides.

#### **Symptoms**

* **SQL Server:** High CPU (99%), massive lock contention, and transaction timeouts.
* **Redis:** Network I/O saturation on a single node while other nodes are idle.
* **Go App:** Goroutine leakage (thousands waiting for I/O).

#### **How to "Cool Down" a Hot Key**

1. **L1 Local Caching:** Store the data in the Go application's RAM for 1–2 seconds. This prevents the request from even reaching Redis or the DB.
2. **Read Replicas:** Distribute read traffic across multiple database "Follower" nodes.
3. **Key Salting/Tagging:** Distribute the data across different Redis shards to avoid saturating a single physical node.

***

### Cache Stampede

A **Cache Stampede** happens when a "Hot Key" expires. Suddenly, thousands of concurrent requests see a "Cache Miss" and rush to the Database at the exact same millisecond to re-generate the data.

#### **Strategies to Prevent Stampede**

* **Soft TTL (Background Refresh):** Set a "Soft" expiration. If the data is slightly old, return it to the user immediately but fire a background Goroutine to update the cache.
* **Probabilistic Early Recomputation:** A worker randomly decides to refresh the cache _before_ it officially expires based on a probability function.
* **Request Coalescing (SingleFlight):** Ensure only one worker hits the DB while others wait for the result.

***

### Request Coalescing

Combining multiple identical concurrent requests into a single execution.

#### **The Mechanism**

1. **Request 1** arrives, sees a cache miss, and "locks" the key.
2. **Requests 2–1000** arrive, see the lock, and enter a "wait" state.
3. **Request 1** fetches the data from the DB once and returns.
4. The system **broadcasts** the result of Request 1 to all 999 waiting requests.

**Go Implementation:** `golang.org/x/sync/singleflight` **Key Benefit:** Reduces DB load from $$N$$ to $$1$$ for concurrent identical reads.

***

### Sharded Counters (Distributed Writes)

When thousands of users try to decrement the same `inventory_count`, SQL Server row-locks become a major bottleneck.

#### **The Strategy**

Instead of one row: `Flight_Inventory { ID: 777, Count: 100 }` You create $N$ slots:

* `Slot_1: 10`
* `Slot_2: 10`
* ... `Slot_10: 10`

#### **The Workflow**

* **Write:** The Go service randomly picks 1 of 10 slots to decrement. This spreads the "Write Heat" across 10 different database pages.
* **Read:** To show the total inventory, the system performs a `SUM(slots)` or reads a cached aggregate.
* **Result:** Eliminates 90% of row-lock contention.

***

### Memory Physics

At the end of the day, these patterns are all about managing **Memory Tiers**

| Layer             | Latency | Role              | Mitigation Pattern                  |
| ----------------- | ------- | ----------------- | ----------------------------------- |
| **L1 (App RAM)**  | < 1μs   | High-Speed Shield | **Request Coalescing / L1 Cache**   |
| **L2 (Redis)**    | \~1ms   | Shared State      | **Soft TTL / Sharding**             |
| **L3 (SQL/Disk)** | > 10ms  | Source of Truth   | **Sharded Counters / Batch Writes** |

***

### Interview Q\&A Summary

**Q: How do you handle a massive traffic spike for a single flight ID?** **A:** I move the "Joining" logic to the application layer. I use **SingleFlight** to coalesce concurrent reads, **L1 caching** to shield the database, and **Sharded Counters** to prevent row-lock deadlocks during the inventory decrement.

**Q: What if your SQL Server hits 99% CPU during the sale?** **A:** I implement a **Circuit Breaker** to protect the DB from total failure, scale my **SQS Consumers** horizontally using **Idempotency keys** to ensure "exactly-once" processing, and use a **Write-Back** pattern where updates are batched to reduce the IOPS load on the physical disk.

**Q: Why choose Application-Layer Stitching over SQL Joins for Order Details?** **A:** It’s a trade-off between DB CPU and Network Latency. By using **Concurrent Goroutines** and an **In-Memory HashMap**, I can fetch 3–4 tables in parallel. This results in faster response times for the user and prevents complex, long-running JOINs from locking up the database during peak periods.

**Q: How do you ensure data consistency in an Event-Driven Ticketing system?** **A:** We use **Durable Queues (SQS)** and **At-Least-Once delivery**. The consumer only deletes the message after the external action (like sending an email or generating a ticket) is confirmed. If it fails, the message remains in the queue for a retry, ensuring no user ever pays for a ticket they don't receive.
