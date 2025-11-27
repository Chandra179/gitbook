---
description: software design document
---

# SDD: \[Project Name]

### 1. Introduction

_High-level context for the team. Keep this brief._

#### Purpose

The purpose of this document is to define the architecture, data structures, and interfaces for the \[Project Name]. It serves as the primary reference for backend and frontend implementation.

#### Scope

* In Scope: \[e.g., User Authentication, Payment Processing, Report Generation]
* Out of Scope: \[e.g., Mobile App development, Legacy data migration]

***

### 2. Non-Functional Requirements (NFRs)

_The constraints and quality attributes the system must meet._

#### Scalability & Performance

* Throughput: Must handle `[X]` requests per second (RPS) at peak.
* Latency: API response time must be under `[X]ms` for the 95th percentile (p95).
* Data Volume: System expects `[X]` GB of new data per day.

#### Availability & Reliability

* Uptime Goal: `99.9%` (Allowing \~8 hours downtime/year).
* Disaster Recovery: RPO (Data loss limit) = `1 hour`; RTO (Recovery time) = `4 hours`.

#### Security

* Authentication: All internal APIs must be secured via `[e.g., OAuth2 / JWT]`.
* Encryption: Data at rest must be encrypted (AES-256). Data in transit via TLS 1.3.

***

### 3. High-Level Design (Architecture)

_The "Big Picture" view of the system._

#### Architecture Style

We are following a `[Microservices / Monolithic / Event-Driven]` architecture.

#### Component View (Container Diagram)

_This diagram shows how the system interacts with external entities and internal services._

> \[Insert Image: Component Diagram]
>
> Show:  $$Web App \leftrightarrow API Gateway \leftrightarrow [Service A] \leftrightarrow Database$$&#x20;

***

### 4. Data Design

_How we store and manage state._

#### Data Model (Schema)

> \[Insert Image: ER Diagram]
>
> Show relationships between Users, Orders, and Payments.

**Table: `users`**

```sql
CREATE TABLE accounts (
    id             BIGINT PRIMARY KEY, -- Snowflake ID
    user_id        UUID NOT NULL,      -- Mapped from internal Identity Service
    currency       CHAR(3) NOT NULL,   -- 'USD', 'IDR', etc.
    
    -- FINANCIAL STATE
    balance        BIGINT NOT NULL DEFAULT 0, -- Available to spend (in cents)
    hold_balance   BIGINT NOT NULL DEFAULT 0, -- Locked for pending txns
    
    -- CONCURRENCY CONTROL (Optimistic Locking)
    version        INT NOT NULL DEFAULT 1,    -- Increments on every update
    last_updated   TIMESTAMPTZ DEFAULT NOW(),
    
    -- CONSTRAINT: Balance can never be negative (unless overdraft allowed)
    CONSTRAINT check_positive_balance CHECK (balance >= 0)
);
```

#### Caching Strategy

* Cache Invalidation: We will use `[Write-Through / TTL of 5 minutes]` for user profile data.
* Keys: Pattern will be `user_profile:{user_id}`.

***

### 5. Component Design (API & Modules)

_Interfaces for developers._

#### API Specification

_Standard: RESTful JSON over HTTP._

**`POST /api/v1/orders`**

```json
// Context: Creates a new order.

Request:
JSON
{
  "items": [{"id": "123", "qty": 1}],
  "currency": "USD"
}

Response (201 Created):
JSON
{
  "order_id": "550e8400-e29b...",
  "status": "PENDING"
}
```

#### Module Abstraction

_Key interfaces for the backend logic._

OrderService Interface:

```go
interface IOrderService {
  // Validates stock and calculates total
  createOrder(user: User, items: Item[]): Promise<Order>;

  // Handles payment gateway callback
  confirmPayment(orderId: string): Promise<boolean>;
}
```

***

### 6. Module Detail

_module implementation detail from module abstraction_

#### IOrderService

1. Inventory Check: An order cannot be created if `Stock < Quantity`.
2. Minimum Order: Cart value must be > $10.00.

### 7. Technology Stack

| Layer     | Technology        | Reason for Choice (ADR Ref)           |
| --------- | ----------------- | ------------------------------------- |
| Frontend  | React, TypeScript | Standard team competency              |
| Backend   | Go (Golang)       | High concurrency support              |
| Database  | PostgreSQL        | ACID compliance required for payments |
| Caching   | Redis             | Session storage                       |
| Messaging | Kafka             | Asynchronous event processing         |
