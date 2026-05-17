# Implementation Template

**Companion to:** [design-template.md](design-template.md "mention") | [mvp-template.md](mvp-template.md "mention")

## Programming Language & Why

**Language:** \[Go / Rust / Elixir / etc.]

**Why this language:**

* \[Reason 1 tied to the design's needs — e.g., "Go's goroutine model maps directly to the concurrent poll-and-claim loop"]
* \[Reason 2 — e.g., "Compiles to a single static binary. No runtime dependencies. Matches our deployment model of horizontally scaled scheduler nodes"]
* \[Reason 3 — e.g., "pgx driver has first-class support for FOR UPDATE SKIP LOCKED, the concurrency primitive our design depends on"]

***

## Event Queue (if used)

**Choice:** \[Kafka / RabbitMQ / NATS / Redis Streams / None]

**Why:**

* \[Architectural reason — e.g., "Kafka provides ordered, durable retention. Critical because tasks must be replayed in order for exactly-once worker deduplication"]

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

**Choice:** \[Modular monolith / Plugable]

**Why:** explain why we choose this archicture

**Module boundaries:**

\[Package 1] — Responsibility\
\[Package 2] — Responsibility\
\[Package 3] — Responsibility

dependencies (programming language standard library, open source pkg, sidecar pattern, etc..)

***

## Directory Structure

* pluggable/pipeline/orchestrator architecture. Depends on the usecases and what the domain do if its suitable for  this archictecture
*   for MVP use simple architecture (modular monolith), ref: [https://github.com/Chandra179/brook](https://github.com/Chandra179/brook)<br>

    ```
    cmd/example/main.go   # entrypoint — starts HTTP + gRPC
    modules/              # domain modules
      example/            #   example module
        config.go         #     module-specific config struct
        dependencies.go   #     wire deps, load own config
        http.go           #     HTTP handlers + route registration
    middleware/           # shared: recovery, request ID, timeout, validation
    config/               # YAML loader + config.yaml
    ```

***

## Abstraction Depth per Modules

* use interfaces for swappable implementation
* do not over abstract
* add why we abstract it (the functions) why the module export this function to be usable to outside world

***

## Testing Strategy

tests should be done after each phase implementation, we should breakdown the system to be independent and testable without waiting the apps fully build

#### Unit Tests

**What:** Domain logic. Core functionalities

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

***

## What Not to Include Here

* CI/CD pipeline configuration
* Monitoring and alerting rules (separate ops runbook)
* Specific library versions
* Deployment manifests (separate infra repo)
* API contracts (separate API spec if complex)
