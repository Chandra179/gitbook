# Ledger Service

### 1. Introduction

_The backbone of our financial infrastructure, providing immutable double-entry accounting._

**Purpose**

The purpose of this document is to define the architecture, data structures, and interfaces for the Core Ledger Service (CLS). It serves as the single source of truth for all financial movements and account balances within the platform, ensuring compliance with double-entry bookkeeping principles.

**Scope**

* In Scope: Double-entry transaction recording, account balance management, idempotency enforcement, audit trailing, and historical balance reporting.
* Out of Scope: Payment gateway integration (upstream), currency exchange rate logic, user authentication (managed by IAM), and KYC/Compliance checks.

***

### 2. Non-Functional Requirements (NFRs)

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

### 3. High-Level Design (Architecture)

**Architecture Style**

We are following a Modular Monolith architecture (internally) exposed via gRPC/REST, utilizing an Event-Sourcing inspired persistence model (Audit Log).

**Component View (Container Diagram)**

_This diagram shows how the ledger interacts with upstream Payment services and the database._

<figure><img src="../../.gitbook/assets/image (22).png" alt=""><figcaption></figcaption></figure>

***

### 4. Data Design

_How we store and manage state. Schema optimized for Double-Entry._

#### **Data Model (Schema)**

We using snowflake id generator&#x20;

Table: `accounts` (The Balance Sheet)

<pre class="language-sql"><code class="lang-sql">CREATE TABLE accounts (
    id             BIGINT PRIMARY KEY,
    entity_id      BIGINT NOT NULL,
    code           VARCHAR(50) UNIQUE NOT NULL, -- e.g., '1001-USER-WALLET'
    type           VARCHAR(35) NOT NULL,        -- 'ASSET', 'LIABILITY'
    currency       CHAR(3) NOT NULL,            -- 'USD'
    
    -- FINANCIAL STATE (Denormalized for read performance)
    balance        BIGINT NOT NULL DEFAULT 0,   -- Stored in Cents/Micros
    
    -- CONCURRENCY CONTROL
    version        INT NOT NULL DEFAULT 1,      -- For Optimistic Locking
<strong>    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
</strong>    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint: Prevent balances from going negative (unless overdraft is allowed)
    CONSTRAINT check_non_negative_balance CHECK (balance >= 0)   
);
</code></pre>

Table: `transactions` (The Journal Header)

```sql
CREATE TABLE transactions (
    id             BIGINT PRIMARY KEY,
    reference_id   VARCHAR(100) NOT NULL, -- External ID (e.g., Stripe Charge ID)
    idempotent_key VARCHAR(100) UNIQUE NOT NULL, -- Idempotency Key
    status         VARCHAR(20) DEFAULT 'POSTED',
    metadata       JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- CRITICAL ADDITION: Who/what service created this transaction
    created_by     VARCHAR(50) NOT NULL
);
-- CRITICAL PERFORMANCE INDEX
-- You will query by reference_id constantly for support/debugging.
CREATE INDEX idx_transactions_ref ON transactions(reference_id);
```

Table: `postings` (The Ledger Lines - The Source of Truth)

```sql
CREATE TABLE postings (
    id             BIGINT PRIMARY KEY,
    -- CRITICAL: Ensure data is not accidentally deleted
    transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    account_id     BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    direction      VARCHAR(10) NOT NULL, 
    amount         BIGINT NOT NULL CHECK (amount > 0),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign Key Constraints (Named explicitly for better error logs)
    CONSTRAINT fk_postings_txn FOREIGN KEY (transaction_id) 
        REFERENCES transactions(id) ON DELETE RESTRICT,
    CONSTRAINT fk_postings_acc FOREIGN KEY (account_id) 
        REFERENCES accounts(id) ON DELETE RESTRICT
);
-- CRITICAL PERFORMANCE INDEXES
-- 1. Essential for "Get Transaction Details" (Join)
CREATE INDEX idx_postings_txn ON postings(transaction_id);

-- 2. Essential for "Get Account History" (Timeline)
CREATE INDEX idx_postings_account_time ON postings(account_id, created_at DESC);
```

* In many modern financial platforms (fintechs, marketplaces, e-commerce platforms), not every account is owned by a single human user. Using the term `entity_id` provides the necessary flexibility for growth
* `postings.account_id` should link directly to `accounts.id`.  A single user might have multiple ledger accounts (e.g., a "USD Wallet," a "EUR Wallet," an "Investment Account"). The `postings` table needs to know _which_ specific financial instrument the money moved in/out of, not just who the ultimate owner is. Its should not linked to `accounts.entity_id` because a user can have multiple ledger accounts

### 5. Component Design (API & Modules)

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

### 6. Module Detail

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

### 7. Technology Stack

| **Layer**        | **Technology** | **Reason for Choice (ADR Ref)**                                                 |
| ---------------- | -------------- | ------------------------------------------------------------------------------- |
| Language         | Go (Golang)    | Strong support for concurrency and database transaction management.             |
| Database         | PostgreSQL     | Proven ACID compliance, row-level locking, and JSONB support.                   |
| Schema Migration | Liquibase      | Version control for database schema changes.                                    |
| Messaging        | Apache Kafka   | High-throughput log for auditing and async reporting.                           |
| Precision        | Integer Math   | ADR-001: No Floating Point arithmetic. All money stored in lowest unit (cents). |
