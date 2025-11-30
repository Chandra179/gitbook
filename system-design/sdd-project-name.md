---
description: software design document
---

# SDD: \[Project Name]

> **Status:** Draft\
> **Project:** \[Project Name]\
> **Author:** \[Author Name]\
> **Last Updated:** \[YYYY-MM-DD]

***

### Table of Contents

1. [Introduction](https://chatgpt.com/c/692c63e4-d594-8332-b45c-ecf5b510ed06#introduction)
2. [High-Level Architecture](https://chatgpt.com/c/692c63e4-d594-8332-b45c-ecf5b510ed06#high-level-architecture)
3. [Data Design](https://chatgpt.com/c/692c63e4-d594-8332-b45c-ecf5b510ed06#data-design)
4. [Building Blocks (Components)](https://chatgpt.com/c/692c63e4-d594-8332-b45c-ecf5b510ed06#building-blocks-components)
5. [API Design](https://chatgpt.com/c/692c63e4-d594-8332-b45c-ecf5b510ed06#api-design)
6. [Operational Concerns](https://chatgpt.com/c/692c63e4-d594-8332-b45c-ecf5b510ed06#operational-concerns)
7. [Decision Logs (ADRs)](https://chatgpt.com/c/692c63e4-d594-8332-b45c-ecf5b510ed06#decision-logs-adrs)
8. [Risks & Mitigations](https://chatgpt.com/c/692c63e4-d594-8332-b45c-ecf5b510ed06#risks--mitigations)

***

### 1. Introduction

#### 1.1 Context

High-level problem statement and background. and the goals

#### 1.2 Constraints

Time, for mvp only, prototype only, etc...

#### 1.3 Functional Requirements (summary)

* FR-1: \[Short description]
* FR-2: \[Short description]

#### 1.4 Non-Functional Requirements (NFRs)

* Performance (throughput, latency targets)
* Availability (SLA / SLO targets)
* Scalability
* Durability / consistency
* Security
* Observability

***

### 2. High-Level Architecture

#### 2.1 Architecture Style

Chosen style (Microservices / Monolith / Event-driven / Serverless) and short justification.

#### 2.2 Component Diagram

Insert component/container diagram here (link or embedded image). Brief descriptions of each component and responsibilities.

#### 2.3 Communication Patterns

* Synchronous (HTTP/REST, gRPC) — where and why
* Asynchronous (message broker, event streams) — topics/queues and semantics

#### 2.4 Sequence Diagrams (Key Flows)

* Flow A: \[e.g., Order creation] — steps
* Flow B: \[e.g., Payment processing] — steps

#### 2.5 Design Considerations & Tradeoffs

* Decision: \[example] Microservices vs monolith — Rationale
* Decision: \[example] SQL vs NoSQL — Rationale
* For each major decision include pros, cons, and consequences.

***

### 3. Data Design

#### 3.1 Storage Technologies & Justification

* Primary store(s): PostgreSQL / MySQL / MongoDB / Cassandra / DynamoDB / etc.
* Rationale for each choice (consistency, query patterns, scale)

#### 3.3 Logical Schema and ERD

* Link to ER diagram or include an image
*   Sample tables/entities with key attributes and types in SQL format, for example:<br>

    ```sql
    CREATE table user()
    ```

#### 3.4 Indexing Strategy

* Which fields are indexed and why

***

### 4. Building Blocks (Components)

_For each major component/service provide the following sub-sections (use copy for each):_

#### Component: `[Component Name]`

**Purpose:**

* Short description of what it does and owns.

**Responsibilities:**

* Responsibility A
* Responsibility B

**APIs / Interfaces:**

* Public endpoints, message topics, or SDKs

**Data Owned:**

* Entities persisted by this component

**Failure Modes & Mitigations:**

* What happens on partial failure and how to recover

_Repeat for all components (Auth, API Gateway, Order Service, Payment Service, Ledger, Reporting, etc.)_

***

### 5. API Design

#### 5.1 API Principles

* Versioning policy
* Idempotency rules
* Error handling and status codes
* Pagination and filtering conventions

#### 5.2 Public API (Client-facing)

_Example endpoint:_ `POST /api/v1/orders`

<pre class="language-json"><code class="lang-json">Description: Create an order

<strong>Request:
</strong>{
  "customer_id": "uuid",
  "items": [ { "sku": "string", "qty": 1 } ],
  "metadata": {}
}

Response:
{
  "order_id": "uuid",
  "status": "created"
}

Errors:
  400 Bad Request — validation
  401 Unauthorized — auth
  409 Conflict — idempotency violation
</code></pre>

#### 5.3 Internal APIs / RPC

Notes on gRPC or internal REST calls, payload size expectations

#### 5.4 Authentication & Authorization

* JWT / OAuth2 / mTLS usage
* Role-based access rules for sensitive endpoints

***

### 6. Operational Concerns

#### 6.1 Observability

**Logging**

* Structured JSON logs, correlation id, request id, fields to include

**Metrics**

* Key metrics per service (requests/sec, error rate, latency p50/p95/p99)
* Exporters (Prometheus, OpenTelemetry)

**Tracing**

* Distributed tracing (OpenTelemetry, Jaeger)
* Trace sampling policy

***

### 7. Decision Logs (Architectural Decision Records - ADRs)

* \[context] then the decision \[decision] and the consequences \[consequences]
* \[context2] then the decision \[decision2] and the consequences \[consequences2]

***

### 8. Risks & Mitigations

#### \[Title: Single DB bottleneck]

* impact: high
* mitigation: read replicas, partitioning

#### \[Title: abc]

* impact: high
* mitigation: the mitigations
