---
description: software design document
---

# HLD: \[Project Name]

### Table of Contents

1. [Introduction](https://nothin.gitbook.io/computing/system-design/sdd-project-name#introduction)
2. [High-Level Architecture](https://nothin.gitbook.io/computing/system-design/sdd-project-name#high-level-architecture)
3. [Data Design](https://nothin.gitbook.io/computing/system-design/sdd-project-name#data-design)
4. [Building Blocks (Components)](https://nothin.gitbook.io/computing/system-design/sdd-project-name#building-blocks-components)
5. [API Design](https://nothin.gitbook.io/computing/system-design/sdd-project-name#api-design)

***

### 1. Introduction

#### 1.1 Context

High-level problem statement and background. and the goals

#### 1.2 Constraints

Time, for mvp only, prototype only, etc...

#### 1.3 Functional Requirements

* FR-1: \[Short description]
* FR-2: \[Short description]

#### 1.4 Non-Functional Requirements

* Performance (throughput, latency targets)
* Availability (SLA / SLO targets)
* Scalability
* Durability / consistency
* Security

***

### 2. High-Level Architecture

#### 2.1 Architecture Style

Chosen style (Microservices / Monolith / Event-driven / Serverless) and the reason in paragraphs

#### 2.2 Component Diagram

Insert component/container diagram here (plantuml or embedded image). Brief descriptions of each component and responsibilities.

#### 2.3 Architectural Decision Records

For each major decision include pros, cons, and consequences.

* _Example:_ Chose PostgreSQL over MongoDB (Decision) because strong transactional consistency was prioritized over horizontal write scalability (Tradeoff).
* Example2: ...
* Example3: ...

***

### 3. Data Design

data design must be align with functional and non function requirements

#### 3.1 Storage

PostgreSQL / MySQL / MongoDB / Cassandra / DynamoDB / etc. why choose this database and not the other ... whats the reason

#### 3.3 DB Schema

database schema

#### 3.4 Caching Strategy

caching strategy if any

***

### 4. Building Blocks (Components)

_For each major component/service provide the following sub-sections (use copy for each):_

#### Component: `[Component Name]`

**Purpose:**

Short description of what it does and owns.

**Responsibilities:**

whats the main responsibility of the component and what is not

**APIs / Interfaces:**

* Public endpoints, rest/grpc, error\_code, versioning

**Failure Modes & Mitigations:**

* What happens on partial failure and how to recover

_Repeat for all components (Auth, API Gateway, Order Service, Payment Service, Ledger, Reporting, etc.)_

***

### 5. Observability

how we tracing data flow, what strategy to use, what data we need to carries in the logs

**Logging**

* Structured JSON logs, correlation id, request id, fields to include

**Metrics**

* Key metrics per service (requests/sec, error rate, latency p50/p95/p99)
* Exporters (Prometheus, OpenTelemetry)

**Tracing**

* Distributed tracing (OpenTelemetry, Jaeger)
* Trace sampling policy
