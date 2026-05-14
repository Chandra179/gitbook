# Implementation Template

> Companion to the System Design Document. Read that first for architectural context, tradeoffs, and invariants.

## Programming Language & Why

**Language:** \[Go / Rust / Elixir / etc.]

**Why this language:**

* \[Reason 1 tied to the design's needs — e.g., "Go's goroutine model maps directly to the concurrent poll-and-claim loop"]
* \[Reason 2 — e.g., "Compiles to a single static binary. No runtime dependencies. Matches our deployment model of horizontally scaled scheduler nodes"]
* \[Reason 3 — e.g., "pgx driver has first-class support for FOR UPDATE SKIP LOCKED, the concurrency primitive our design depends on"]

**Why not \[alternative]:**

* \[Reason the obvious alternative was rejected — e.g., "Rust would give stronger correctness guarantees, but the team has no Rust experience and the database already provides the safety net via ACID"]

***

## Event Queue

**Choice:** \[Kafka / RabbitMQ / NATS / Redis Streams / None]

**Why:**

* \[Architectural reason — e.g., "Kafka provides ordered, durable retention. Critical because tasks must be replayed in order for exactly-once worker deduplication"]

**Why not \[alternative]:**

* \[e.g., "RabbitMQ has more flexible routing and built-in priority queues, but its persistence model is weaker. A RabbitMQ crash can lose acknowledged-but-unprocessed messages"]

**Configuration:**

* \[Topic/queue naming convention]
* \[Partitioning strategy — e.g., "One partition per task type priority"]
* \[Retention policy — e.g., "7-day retention for replay capability"]

***

## Cache (if used)

**Choice:** \[Redis / Memcached / None]

**Why:**

* \[e.g., "Redis for hot task deduplication. TTL matches visibility timeout. Not used for task persistence — PostgreSQL remains source of truth"]

**What we cache:**

* \[Specific data and TTL — e.g., "Processed task IDs, TTL = 30 days. Task deduplication at the worker level"]

**What we don't cache:**

* \[e.g., "Task state. The database is always authoritative"]

***

## Architecture Style

**Choice:** \[Modular monolith / Microservices / DDD / Hexagonal / Plugable]

**Why:**

* \[e.g., "Modular monolith. Scheduler, dispatcher, and cleanup are separate packages within one binary. They share database access but have clear interface boundaries. We reject microservices because the network overhead and deployment complexity aren't justified for a system where all components share the same scaling profile"]

**Module boundaries:**

\[Package 1] — Responsibility\
\[Package 2] — Responsibility\
\[Package 3] — Responsibility

***

## Directory Structure

* modular monolith, pluggable architecture, DDD

***

## Abstraction Depth

**Principle:** \[e.g., "Interface per external dependency. No interface for internal types that have a single implementation. Deep modules (complex internals, simple interfaces) over shallow modules."]

**Where we abstract:**

* **Broker:** `broker.Publisher` interface. One method: `Publish(task Task) error`. Kafka and RabbitMQ implement it. This lets us swap brokers without changing the scheduler
* **Database:** `store.TaskStore` interface. Methods: `PollPending()`, `Claim(taskID)`, `Release(taskID)`. PostgreSQL implements it. A future CockroachDB implementation is possible

**Where we don't abstract:**

* The claim loop. It has one implementation. Wrapping it in an interface adds indirection without value
* Domain types. `Task`, `TaskStatus`, `Priority` are concrete types. Used everywhere. Interfaces would obscure, not clarify

**Rule of thumb used:**

> Abstract external dependencies (broker, database, clock). Don't abstract internal logic (claim loop, state transitions, priority calculation). Add an interface when you have two real implementations or when testing requires it. Don't add one preemptively.

***

## Testing Strategy

#### Unit Tests

**What:** Domain logic. Priority calculation. State transition validation. Task aggregate behavior.

**Coverage target:** 90%+ on domain package. 70%+ on claim/dispatch logic (mocked dependencies).

**Example:**

* "Task with status COMPLETED cannot transition to IN\_PROGRESS"
* "Priority comparison correctly orders high-priority before low-priority with same scheduled\_at"

#### Integration Tests

**What:** Database interactions. Broker interactions. The poll-and-claim loop with real PostgreSQL. End-to-end claim → dispatch → worker acknowledgment.

**Example:**

* "Two concurrent schedulers claiming from same PENDING pool: exactly N tasks claimed, no duplicates"
* "Visibility timeout cleanup resets IN\_PROGRESS tasks stuck longer than timeout"
* "Worker idempotency: submitting the same task\_id twice results in single execution"
* use test-container if applicable

#### Load / Performance Tests

**Purpose:** Validates the architectural assumptions.

**What we test:**

* Claim throughput: N schedulers claiming from M pending tasks. Target: 10K claims/second
* Poll latency under contention: p95 < 50ms with 10 concurrent schedulers
* Broker dispatch throughput: publish rate matches claim rate with no backpressure buildup
* Visibility cleanup scan time on 10M rows with date-based partitioning
* use K6 for free use

**Pass criteria:** Derived from the system design's Numbers section. The architecture predicted 10K QPS. The load test proves or disproves it.

#### Stress / Soak Tests

**Purpose:** Finds the breaking point.

**What we test:**

* Run system at 2x target load for 24 hours. Memory leak? Connection exhaustion? Partition skew?
* Simulate database failover mid-claim. Does the system recover without double execution?
* Kill a scheduler node every 5 minutes. Does the cleanup leader re-elect within 30 seconds? Are tasks recovered?

**Pass criteria:** No data loss. No double execution. Recovery within visibility timeout window

***

### What Not to Include Here

* CI/CD pipeline configuration
* Monitoring and alerting rules (separate ops runbook)
* Specific library versions
* Deployment manifests (separate infra repo)
* API contracts (separate API spec if complex)
