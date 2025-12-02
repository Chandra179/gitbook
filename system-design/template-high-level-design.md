---
description: software design document
---

# \[Template] High Level Design

### 1. Interaction Patterns

#### 1.1 System Components Overview

Brief list of major components (services, databases, queues, caches) with one-line descriptions.

#### 1.2 Communication Patterns

Diagram or description showing:

* **Synchronous boundaries** (REST/gRPC calls between services)
* **Asynchronous boundaries** (event-driven, message queues)
* **Data flow direction** (who calls whom, who publishes what events)

**Example:**

```
API Gateway --[REST]--> Order Service --[Event: OrderCreated]--> Kafka --> Inventory Service
                                     \--[REST]--> Payment Service
```

#### 1.3 Key Architectural Decisions

* Why sync vs async for specific interactions
* Trade-offs made (coupling, latency, complexity)

***

### 2. Data Flow & State Machines

#### 2.1 User Journey: \[Journey Name 1]

**Example: Checkout Flow**

**High-level flow:** User adds to cart → Initiates checkout → Payment processed → Order confirmed → Inventory reserved

**State Machine:**

```
[Cart] --checkout--> [PaymentPending] --payment_success--> [OrderConfirmed] --inventory_reserved--> [OrderFulfilled]
                            |
                            +--payment_failed--> [PaymentFailed] --retry--> [PaymentPending]
```

**Key transitions:**

* `checkout`: User initiates payment
* `payment_success`: Payment gateway confirms
* `payment_failed`: Payment gateway rejects, user can retry
* `inventory_reserved`: Inventory service locks items

#### 2.2 User Journey: \[Journey Name 2]

Repeat structure for each critical journey

***

### 3. Failure Scenarios

Keep each scenario short: symptom → behavior → impact

#### Scenario 1: \[Component X] Fails

**Example: Payment Service Down**

* **Behavior:** Circuit breaker opens, checkout flow degrades to async processing
* **Impact:** Users see "Payment queued, will process shortly" message
* **Recovery:** Orders processed once Payment Service recovers

#### Scenario 2: \[Dependency Y] Degrades

**Example: Database Latency Spike**

* **Behavior:** API Gateway enforces timeout (5s), returns cached data where possible
* **Impact:** Some requests fail fast, user sees "Try again" message
* **Recovery:** Auto-scaling adds read replicas, load redistributes

#### Scenario 3: \[External Service Z] Times Out

**Example: Email Service Unavailable**

* **Behavior:** Email events queued in Kafka, retried later
* **Impact:** No impact on checkout flow, emails delayed
* **Recovery:** Batch send when service recovers

***

### 4. Consistency Model

#### 4.1 Overall Approach

Describe the system's general consistency philosophy.

**Example:** "We use eventual consistency across services with strong consistency within service boundaries. Critical financial data (payments, ledger) requires strong consistency. Non-critical data (notifications, analytics) uses eventual consistency."

#### 4.2 Consistency Per Domain

<table><thead><tr><th width="210.20001220703125">Domain</th><th width="193">Model</th><th>Reason</th></tr></thead><tbody><tr><td>Orders</td><td>Strong</td><td>Financial accuracy required</td></tr><tr><td>Inventory</td><td>Strong</td><td>Prevent overselling</td></tr><tr><td>Notifications</td><td>Eventual</td><td>Delivery delay acceptable</td></tr><tr><td>Analytics</td><td>Eventual</td><td>Real-time not required</td></tr></tbody></table>

#### 4.3 Conflict Resolution

How do we handle conflicts when they occur?

**Example:** "Inventory conflicts resolved by last-write-wins with compensation. If oversold, customer service manually resolves."

***

### 5. Scaling & Bottlenecks

how  to scale the systems and what bottlenecks does the current design have

#### 5.1 Current Bottlenecks

Identify where the system will struggle first under load.

**Example:** "Primary bottleneck is database writes. Order Service can handle 10K req/sec but PostgreSQL primary maxes at 5K writes/sec."

#### 5.2 Bottleneck Mitigation

How do we address each bottleneck?

| Bottleneck      | Mitigation                   | Limit                    |
| --------------- | ---------------------------- | ------------------------ |
| DB writes       | Write sharding by tenant\_id | Scales to 50K writes/sec |
| Payment gateway | Rate limiting + queueing     | 1K req/sec hard limit    |
| API Gateway     | Horizontal scaling           | No known limit           |

#### 5.3 Scaling Strategy

* **Horizontal scaling:** Which components scale out (stateless services)
* **Vertical scaling:** Which components scale up (databases, caches)
* **Sharding/partitioning:** How data is distributed

***

### 6. Load Handling

how do the systems handle load and high traffic requests

#### 6.1 Normal vs Peak Load

| Metric         | Normal | Peak | Notes                    |
| -------------- | ------ | ---- | ------------------------ |
| Requests/sec   | 1K     | 10K  | Peak during sales events |
| Orders/min     | 100    | 1K   | Black Friday traffic     |
| DB connections | 200    | 800  | Connection pool sizing   |

#### 6.2 Backpressure Mechanisms

How does the system slow down gracefully?

**Example:** "API Gateway applies rate limiting (1000 req/sec per user). Message queues buffer spikes. Workers process at sustainable rate."

#### 6.3 Load Shedding

What do we drop when overwhelmed?

**Example:** "Under extreme load, we disable non-critical features: recommendation engine, real-time analytics dashboard. Core checkout flow remains operational."

***

### 7. State Management

#### 7.1 State Distribution

Where does state live in the system?

<table><thead><tr><th width="203">Component</th><th>State Type</th><th>Storage</th></tr></thead><tbody><tr><td>API Gateway</td><td>Stateless</td><td>None</td></tr><tr><td>Order Service</td><td>Stateful</td><td>PostgreSQL</td></tr><tr><td>Session Manager</td><td>Stateful</td><td>Redis</td></tr><tr><td>Worker Nodes</td><td>Stateless</td><td>Process queue messages</td></tr></tbody></table>

#### 7.2 State Lifecycle

How does state get created, updated, and cleaned up?

**Example:** "User sessions created on login, expire after 30 days of inactivity. Background job deletes expired sessions weekly. Order data retained indefinitely for compliance."

#### 7.3 State Reconciliation

How do we handle state drift or inconsistencies?

**Example:** "Nightly reconciliation job compares Order Service and Inventory Service. Discrepancies logged for manual review. No auto-correction to prevent data loss."
