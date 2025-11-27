# Digital Wallet



* sensitive money movement operations, including payments, refunds, and ledger management.&#x20;
* **Data Consistency, Idempotency, and Auditability.** While high performance is required, it must never come at the cost of financial accuracy.&#x20;
* The system will serve as the "source of truth" for user balances and transaction histories, interacting with external payment gateways while maintaining an internal immutable ledger.
* To ensure complete control over user data and decouple our system from external providers, we will utilize a mapped internal identification strategy.&#x20;
* For transaction identifiers, we will utilize a distributed ID generator (such as Twitter Snowflake or KSUID) rather than standard UUIDs; this provides time-sortable, 64-bit integers that significantly improve database indexing performance. Furthermore, to prevent "card testing" fraud and brute-force attacks, we will implement multi-layered rate limiting based on IP address, user ID, and device signature.
* All monetary values within the database will be stored as Integers representing minor units (e.g., storing $10.50 as `1050` cents) rather than `FLOAT` or `DOUBLE`. This eliminates the risk of floating-point rounding errors inherent in binary arithmetic.&#x20;
* To achieve the highest level of data integrity and auditability, the transaction data must be strictly immutable. We will adopt an "Append-Only" strategy where transaction rows are never updated. If a correction or refund is needed, a new transaction row is inserted to offset the previous one.&#x20;
* To enforce correctness, we will implement a Double-Entry Bookkeeping schema. Every financial event must record a debit from one account and a credit to another, ensuring that the sum of all transactions across the system always equals zero.&#x20;
* To handle network failures and prevent duplicate charges, we will implement a idempotency mechanism.&#x20;
* Additionally, the transaction lifecycle will be managed via a formal Finite State Machine (FSM). Transactions will move through strict states—`CREATED`, `PENDING`, `PAID`, `SETTLED`, `FAILED`, `REFUNDED`enforcing logic that prevents illegal transitions, such as moving directly from `FAILED` to `PAID` without a new initiation.
* While high isolation levels (like `SERIALIZABLE`) guarantee consistency, they often cause database deadlocks under high load. To balance consistency with low latency, we will implement Optimistic Locking. We will add a `version` number column to account balances. When updating a balance, the query will check that the version matches the one read at the start of the transaction (e.g., `UPDATE accounts SET balance = new_balance, version = version + 1 WHERE id = x AND version = current_version`). If the version has changed during processing, the transaction fails safely and triggers a retry, ensuring data consistency without locking the entire table.
* Standard login is insufficient for financial movement. We will enforce Step-Up Authentication immediately prior to the transaction execution. This requires the user to input a high-entropy credential—such as a PIN or Biometric signature—to sign the transaction request. This verification payload should be processed by a secure, isolated service or Hardware Security Module (HSM) to ensure that the entity initiating the payment is the verified account holder, mitigating risks associated with session hijacking.
* To satisfy the requirements for high throughput and partition tolerance (as per the CAP theorem), we will employ a CQRS (Command Query Responsibility Segregation) pattern. Write operations (payments) will be directed to the master database to ensure immediate consistency, while Read operations (history, analytics) will be served by read replicas or a dedicated search index (e.g., Elasticsearch) to ensure high availability.
* Recognizing that distributed systems eventually drift, we will implement an automated Reconciliation Process. A daily batch job will ingest settlement reports from external payment vendors (e.g., Stripe, PayPal) and match them row-by-row against our internal ledger to identify discrepancies.&#x20;

### Building Blocks

```sql
-- 1. ACCOUNTS TABLE (The "Current State")
-- This is what the user sees on their home screen.
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

-- 2. TRANSACTIONS TABLE (The "Intent")
-- Represents the request (e.g., "Alice sends $10 to Bob").
CREATE TABLE transactions (
    id             BIGINT PRIMARY KEY, -- Snowflake ID
    idempotency_key UUID UNIQUE NOT NULL, -- Safety mechanism
    
    reference      VARCHAR(255),      -- "Invoice #123" or "Payment for Coffee"
    status         VARCHAR(20) NOT NULL, -- PENDING, POSTED, FAILED
    
    metadata       JSONB,             -- Store extra data (IP, Device ID)
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LEDGER POSTINGS (The "Immutable History")
-- Double-Entry Implementation. Rows here are NEVER updated or deleted.
CREATE TABLE ledger_postings (
    id             BIGINT PRIMARY KEY, -- Snowflake ID
    transaction_id BIGINT NOT NULL REFERENCES transactions(id),
    
    account_id     BIGINT NOT NULL REFERENCES accounts(id),
    amount         BIGINT NOT NULL,    -- Negative for Debit, Positive for Credit
    
    direction      VARCHAR(10) NOT NULL, -- 'DEBIT' or 'CREDIT'
    
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for Performance
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_postings_account ON ledger_postings(account_id);
```
