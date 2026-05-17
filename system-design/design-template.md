# Design Template

**Companion to:** [Broken link](/broken/pages/ssLgVMb1U7WKwMIdEJZc "mention") | [Broken link](/broken/pages/h9Azz1HKNN5KhXAFCX09 "mention")

## Goal

\[One sentence. What are we building?]

## Non-goals

* \[What we're NOT doing]

## Numbers

* QPS: \_\_\_\_\_
* Storage: \_\_\_\_\_ / year
* Latency target: \_\_\_\_\_

## Critical invariant

\[One sentence. The thing that must never be violated.]

## Failure modes

| What fails | How it manifests | How we recover |
| ---------- | ---------------- | -------------- |
|            |                  |                |

## Diagram&#x20;

mermaidjs flowchart

```mermaid
flowchart TB
    A[User A]
    B[User B]
    C[User C offline]
```

## Core flow

\[Paragraphs. Use bullet lists when needed.]

## Core Features

\[Features without which the app is useless. Must ship in MVP.]

#### Feature 1: \[Name]

**What it does:** \[One sentence.]

**Risks we tolerate:**

* \[Risk — e.g., "No authentication on this endpoint"]
* \[Risk — e.g., "Data loss if process crashes mid-write"]

#### Feature 2: \[Name]

**What it does:** \[One sentence.]

**Risks we tolerate:**

* \[Risk]
* \[Risk]

#### Feature 3: \[Name]

**What it does:** \[One sentence.]

**Risks we tolerate:**

* \[Risk]

***

## Constraints

\[Rules that limit complexity. Prevents over-engineering.]

* \[Constraint — e.g., "Only handle statuses: PENDING, COMPLETED, FAILED"]
* \[Constraint — e.g., "Single tenant. No isolation logic."]
* \[Constraint — e.g., "Max 3 retries. No custom retry policies."]
* \[Constraint — e.g., "No update or delete of submitted tasks."]

***

## Implementation Phases

#### Phase 0: Foundation

#### Phase 1: \[Feature A]

\[First working feature.]

* \[Task]
* \[Task]

**Checkpoint:** \[What works when this phase is done]

#### Phase 2: \[Feature B]

* \[Task]
* \[Task]

**Checkpoint:** \[What works]

***

### What Never Changes

\[Invariants across all phases.]

* \[Invariant 1]
* \[Invariant 2]
* \[Invariant 3]

## Storage choice & why

\[What + reasoning.]

## The hard part & how we solve it

* **Bottleneck:** \_\_\_\_\_
* **Fix:** \_\_\_\_\_

## What we sacrifice

\[One paragraph. What we lose. Who pays the cost. When this will hurt us.]

## Architecture Style

**Choice:** \[Modular monolith / Plugable]

**Why:** explain why we choose this archicture

**Module boundaries:**

\[Package 1] — Responsibility\
\[Package 2] — Responsibility\
\[Package 3] — Responsibility

dependencies (programming language standard library, open source pkg, sidecar pattern, etc..)

## Directory Structure

for MVP use simple architecture (modular monolith), ref: [https://github.com/Chandra179/brook](https://github.com/Chandra179/brook)

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
