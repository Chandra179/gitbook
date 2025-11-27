# Ledger Service

#### 1. Introduction

_The backbone of our financial infrastructure, providing immutable double-entry accounting._

**Purpose**

The purpose of this document is to define the architecture, data structures, and interfaces for the Core Ledger Service (CLS). It serves as the single source of truth for all financial movements and account balances within the platform, ensuring compliance with double-entry bookkeeping principles.

**Scope**

* In Scope: Double-entry transaction recording, account balance management, idempotency enforcement, audit trailing, and historical balance reporting.
* Out of Scope: Payment gateway integration (upstream), currency exchange rate logic, user authentication (managed by IAM), and KYC/Compliance checks.

***

#### 2. Non-Functional Requirements (NFRs)

_The constraints and quality attributes the system must meet._

**Scalability & Performance**

* Throughput: Must handle `1,500` transactions per second (TPS) (write-heavy) at peak.
* Latency: API response time for posting transactions must be under `200ms` (p99).
* Data Volume: System expects `50` GB of new ledger entry data per day.

**Availability & Reliability**

* Consistency: Strong Consistency (ACID) is required. Eventual consistency is not acceptable for balances.
* Uptime Goal: `99.99%` (Critical path service).
* Disaster Recovery: RPO (Data loss limit) = `0 seconds` (Synchronous replication required); RTO = `15 minutes`.

**Security**

* Authentication: Service-to-service authentication via mTLS.
* Immutability: No `UPDATE` or `DELETE` operations allowed on posted transactions. Corrections must be handled via reversing entries.

***

#### 3. High-Level Design (Architecture)

_The "Big Picture" view of the system._

**Architecture Style**

We are following a Modular Monolith architecture (internally) exposed via gRPC/REST, utilizing an Event-Sourcing inspired persistence model (Audit Log).

**Component View (Container Diagram)**

_This diagram shows how the ledger interacts with upstream Payment services and the database._

<figure><img src="../../.gitbook/assets/image (22).png" alt=""><figcaption></figcaption></figure>

***

#### 4. Data Design

_How we store and manage state. Schema optimized for Double-Entry._

**Data Model (Schema)**

Table: `accounts` (The Balance Sheet)

```sql
CREATE TABLE accounts (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code           VARCHAR(50) UNIQUE NOT NULL, -- e.g., '1001-USER-WALLET'
    type           VARCHAR(20) NOT NULL,        -- 'ASSET', 'LIABILITY'
    currency       CHAR(3) NOT NULL,            -- 'USD'
    
    -- FINANCIAL STATE (Denormalized for read performance)
    balance        BIGINT NOT NULL DEFAULT 0,   -- Stored in Cents/Micros
    
    -- CONCURRENCY CONTROL
    version        INT NOT NULL DEFAULT 1,      -- For Optimistic Locking
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

Table: `transactions` (The Journal Header)

```sql
CREATE TABLE transactions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id   VARCHAR(100) NOT NULL, -- External ID (e.g., Stripe Charge ID)
    idem_key       VARCHAR(100) UNIQUE NOT NULL, -- Idempotency Key
    status         VARCHAR(20) DEFAULT 'POSTED',
    metadata       JSONB,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

Table: `postings` (The Ledger Lines - The Source of Truth)

```sql
CREATE TABLE postings (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    account_id     UUID NOT NULL REFERENCES accounts(id),
    direction      VARCHAR(10) NOT NULL, -- 'DEBIT' or 'CREDIT'
    amount         BIGINT NOT NULL CHECK (amount > 0),
    
    INDEX idx_account_created (account_id, created_at) -- For fast history lookup
);
```

**Caching Strategy**

* Strategy: Write-Through not recommended for balances due to high concurrency.
* Read Cache: Redis used for `GET /accounts/{id}/balance`.
* Invalidation: Cache key `ledger:account:{id}` is deleted immediately upon successful transaction commit.

***

#### 5. Component Design (API & Modules)

_Interfaces for developers._

**API Specification**

_Standard: RESTful JSON over HTTP._

`POST /api/v1/transactions`

```json
// Context: Records a double-entry transaction.
// Constraint: Sum of Debits must equal Sum of Credits.

Request:
{
  "reference_id": "ord_550e8400",
  "idempotency_key": "txn_12345_retry_1",
  "description": "Payment for Order #99",
  "postings": [
    {
      "account_id": "acc_user_123",
      "direction": "DEBIT",
      "amount": 1000,
      "currency": "USD"
    },
    {
      "account_id": "acc_platform_revenue",
      "direction": "CREDIT",
      "amount": 1000,
      "currency": "USD"
    }
  ]
}

Response (200 OK):
{
  "transaction_id": "txn_uuid_999...",
  "status": "POSTED",
  "timestamp": "2023-10-27T10:00:00Z"
}
```

**Module Abstraction**

_Key interfaces for the backend logic._

`ILedgerManager` Interface:

```go
type ILedgerManager interface {
    // Core Atomic Operation
    PostTransaction(ctx Context, cmd CreateTransactionCommand) (Transaction, error)

    // Read Operations
    GetBalance(ctx Context, accountID uuid.UUID) (Money, error)
    GetAccountHistory(ctx Context, accountID uuid.UUID, filter DateRange) ([]Posting, error)
}
```

***

#### 6. Module Detail

_Implementation detail for `ILedgerManager.PostTransaction`_

**Logic Flow (Atomic Transaction)**

1. Idempotency Check: Query `transactions` table by `idempotency_key`. If exists, return saved result.
2. Validation:
   * Verify all `account_id`s exist.
   * Verify `currency` consistency across entries.
   * Zero-Sum Rule: Assert $$\sum Debits - \sum Credits = 0$$.
3. Database Transaction (Begin):
   * Insert row into `transactions`.
   * Insert rows into `postings`.
   *   Lock & Update: For every account involved:

       SQL

       ```
       UPDATE accounts 
       SET balance = balance + (direction == 'CREDIT' ? amount : -amount), 
           version = version + 1
       WHERE id = ? AND version = ?
       ```
   * If `UPDATE` returns 0 rows (version mismatch), Rollback & Retry (Optimistic Concurrency).
   * Check `balance >= 0` constraint (if account does not allow overdraft).
4. Database Transaction (Commit).
5. Event Emission: Publish `TransactionPosted` event to Kafka.

***

#### 7. Technology Stack

| **Layer**        | **Technology** | **Reason for Choice (ADR Ref)**                                                 |
| ---------------- | -------------- | ------------------------------------------------------------------------------- |
| Language         | Go (Golang)    | Strong support for concurrency and database transaction management.             |
| Database         | PostgreSQL     | Proven ACID compliance, row-level locking, and JSONB support.                   |
| Schema Migration | Liquibase      | Version control for database schema changes.                                    |
| Messaging        | Apache Kafka   | High-throughput log for auditing and async reporting.                           |
| Precision        | Integer Math   | ADR-001: No Floating Point arithmetic. All money stored in lowest unit (cents). |
