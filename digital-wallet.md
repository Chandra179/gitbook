# Digital Wallet

> Status: DRAFT | Author: \[Chandra] | Last Updated: 2025-11-27

## 1. Introduction

### **Purpose**

The purpose of this document is to define the architecture, data structures, and interfaces for the Core Digital Wallet Platform. It serves as the primary reference for the implementation of the financial ledger, ensuring the system acts as the immutable "source of truth" for user balances and money movement.

### **Scope**

* In Scope: Internal Ledger Management, Payment Processing, Double-Entry Bookkeeping, Idempotency, Reconciliation, Step-Up Authentication, and External Gateway Integration.
* Out of Scope: Mobile App UI implementation, Marketing websites, Non-financial user profile management.

***

## 2. Non-Functional Requirements (NFRs)

**Consistency & Integrity**

* Financial Accuracy: The system prioritizes data consistency over availability in split-brain scenarios (CP per CAP theorem).
* Auditability: 100% of financial movements must be traceable via an append-only ledger.
* Concurrency: Must handle high-concurrency updates to "hot" accounts (e.g., merchants) without data corruption.

**Scalability & Performance**

* Throughput: Utilization of CQRS to separate Write (Command) and Read (Query) loads.
* Database Performance: Use of 64-bit Integer IDs (Snowflake/KSUID) to optimize B-Tree indexing.
* Latency: Optimistic locking is used to avoid database deadlocks associated with SERIALIZABLE isolation levels.

**Security**

* Authentication: Step-Up Authentication (PIN/Biometric) required immediately prior to transaction execution.
* Fraud Prevention: Multi-layered rate limiting based on IP, User ID, and Device Signature to prevent "card testing" and brute force.
* Isolation: Signature verification payloads processed by isolated service/HSM.

***

## 3. High-Level Design (Architecture)

**Architecture Style**

We are following a `Monolithic with Clear Module Boundaries` architecture. The system is organized into distinct modules (Account, Transaction, Payment, Reconciliation) within a single deployable unit, allowing for potential future extraction into microservices if needed.

**Component View (Container Diagram)**

```
┌─────────────┐
│   Web App   │
│  (Client)   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────┐
│         API Gateway / Load Balancer     │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌────────────────────────────────────────────────┐
│         Digital Wallet Application             │
│  ┌─────────────┐  ┌──────────────┐             │
│  │   Account   │  │ Transaction  │             │
│  │   Module    │  │    Module    │             │
│  └─────────────┘  └──────────────┘             │
│  ┌─────────────┐  ┌──────────────┐             │
│  │   Payment   │  │Reconciliation│             │
│  │   Module    │  │    Module    │             │
│  └─────────────┘  └──────────────┘             │
└────────┬─────────────────────┬─────────────────┘
         │                     │
         ↓                     ↓
┌─────────────────┐   ┌─────────────────┐
│   PostgreSQL    │   │  Stripe Gateway │
│   (Master + RR) │   │  (External API) │
└─────────────────┘   └─────────────────┘
         │
         ↓
┌─────────────────┐
│  Elasticsearch  │
│ (Read Queries)  │
└─────────────────┘
```

**Technology Stack**

| Layer            | Technology                 | Reason for Choice                                         |
| ---------------- | -------------------------- | --------------------------------------------------------- |
| Backend          | Go (Golang)                | High concurrency support, excellent for financial systems |
| Database (Write) | PostgreSQL                 | ACID compliance required for payments, strong consistency |
| Database (Read)  | PostgreSQL (Read Replicas) | CQRS pattern - read scalability                           |
| Search/Analytics | Elasticsearch              | Fast query for transaction history and analytics          |
| Caching          | Redis                      | Session storage and rate limiting                         |
| ID Generation    | Snowflake/KSUID            | Time-sortable, 64-bit integers for better indexing        |

**CQRS Pattern**

To satisfy requirements for high throughput and partition tolerance:

* **Write operations** (payments, refunds) → Master PostgreSQL database for immediate consistency
* **Read operations** (balance queries, transaction history, analytics) → Read replicas or Elasticsearch for high availability

## 4. Data Design

1\. Accounts Table (Snapshot State)

```sql
CREATE TABLE accounts (
    id             UUID PRIMARY KEY,         
    user_id        UUID NOT NULL UNIQUE,      -- Mapped from internal Identity Service
    currency       CHAR(3) NOT NULL,          -- 'USD', 'IDR', etc.
    
    -- FINANCIAL STATE
    balance        BIGINT NOT NULL DEFAULT 0, -- Available to spend (in minor units, e.g., cents)
    hold_balance   BIGINT NOT NULL DEFAULT 0, -- Locked for pending transactions
    
    -- CONCURRENCY CONTROL (Optimistic Locking)
    version        INT NOT NULL DEFAULT 1,    -- Increments on every update
    
    -- AUDIT
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- CONSTRAINT: Balance can never be negative
    CONSTRAINT check_positive_balance CHECK (balance >= 0),
    CONSTRAINT check_positive_hold CHECK (hold_balance >= 0)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
```

2\. Transactions Table

```sql
CREATE TABLE transactions (
    id                BIGINT PRIMARY KEY,           -- Snowflake ID (time-sortable)
    idempotency_key   VARCHAR(255) NOT NULL UNIQUE, -- Prevent duplicate transactions
    
    -- ACCOUNT REFERENCES
    from_account_id   UUID NOT NULL,
    to_account_id     UUID NOT NULL,
    
    -- TRANSACTION DETAILS
    amount            BIGINT NOT NULL,              -- In minor units (cents)
    currency          CHAR(3) NOT NULL,
    transaction_type  VARCHAR(50) NOT NULL,         -- 'PAYMENT', 'REFUND', 'TRANSFER'
    
    -- STATE MACHINE
    status            VARCHAR(30) NOT NULL,         -- FSM: CREATED, PENDING, PAID, SETTLED, FAILED, REFUNDED
    
    -- EXTERNAL REFERENCE
    external_ref_id   VARCHAR(255),                 -- Stripe payment ID or similar
    
    -- METADATA
    description       TEXT,
    metadata          JSONB,                        -- Additional flexible data
    
    -- AUDIT (Immutable - no updates allowed)
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_from_account FOREIGN KEY (from_account_id) REFERENCES accounts(id),
    CONSTRAINT fk_to_account FOREIGN KEY (to_account_id) REFERENCES accounts(id),
    CONSTRAINT check_positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_transactions_from_account ON transactions(from_account_id, created_at DESC);
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_external_ref ON transactions(external_ref_id);
```

3. Transaction ledger (Immutable / Double-Entry)

```sql
-- Double-Entry Bookkeeping: Every transaction creates TWO ledger entries
CREATE TABLE transaction_ledger (
    id              BIGSERIAL PRIMARY KEY,
    transaction_id  BIGINT NOT NULL,
    account_id      BIGINT NOT NULL,
    
    -- DOUBLE-ENTRY
    entry_type      VARCHAR(15) NOT NULL,    -- 'DEBIT' or 'CREDIT'
    amount          BIGINT NOT NULL,         -- Always positive, direction determined by entry_type
    
    -- RUNNING BALANCE (denormalized for query efficiency)
    balance_after   BIGINT NOT NULL,
    
    -- AUDIT
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT check_entry_type CHECK (entry_type IN ('DEBIT', 'CREDIT'))
);

CREATE INDEX idx_ledger_account ON transaction_ledger(account_id, created_at DESC);
CREATE INDEX idx_ledger_transaction ON transaction_ledger(transaction_id);
```

4. Reconciliation records

```sql
CREATE TABLE reconciliation_records (
    id                  BIGSERIAL PRIMARY KEY,
    reconciliation_date DATE NOT NULL,
    
    -- EXTERNAL PROVIDER DATA
    provider            VARCHAR(50) NOT NULL,        -- 'STRIPE'
    external_ref_id     VARCHAR(255) NOT NULL,
    external_amount     BIGINT NOT NULL,
    external_status     VARCHAR(50),
    
    -- INTERNAL DATA
    transaction_id      BIGINT,
    internal_amount     BIGINT,
    internal_status     VARCHAR(20),
    
    -- RECONCILIATION RESULT
    match_status        VARCHAR(30) NOT NULL,        -- 'MATCHED', 'DISCREPANCY', 'MISSING_INTERNAL', 'MISSING_EXTERNAL'
    discrepancy_reason  TEXT,
    
    -- AUDIT
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ,
    
    CONSTRAINT fk_transaction_recon FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE INDEX idx_recon_date ON reconciliation_records(reconciliation_date);
CREATE INDEX idx_recon_status ON reconciliation_records(match_status);
```

***

## 5. Component Design (API & Modules)

**API Specification**

_Standard: RESTful JSON over HTTP._

**`POST /api/v1/transactions`**

```json
// Context: Initiates a payment transaction.
// Requires: Step-up authentication (PIN/Biometric)

Request:
{
  "idempotency_key": "unique-client-generated-key",
  "from_account_id": 123456789,
  "to_account_id": 987654321,
  "amount": 1050,
  "currency": "USD",
  "description": "Payment for Order #12345",
  "step_up_token": "biometric-or-pin-verification-token"
}

Response (201 Created):
{
  "transaction_id": "550e8400e29b41d4a716446655440000",
  "status": "PENDING",
  "amount": 1050,
  "currency": "USD",
  "created_at": "2025-01-15T10:30:00Z"
}

Response (400 Bad Request - Insufficient Balance):
{
  "error": "INSUFFICIENT_BALANCE",
  "message": "Account balance is insufficient for this transaction"
}

Response (409 Conflict - Duplicate Idempotency Key):
{
  "error": "DUPLICATE_REQUEST",
  "message": "Transaction with this idempotency key already exists",
  "existing_transaction_id": "550e8400e29b41d4a716446655440000"
}
```

**`GET /api/v1/accounts/{account_id}/balance`**

```json
// Context: Retrieves current account balance.

Response (200 OK):
{
  "account_id": 123456789,
  "balance": 10050,
  "hold_balance": 500,
  "available_balance": 9550,
  "currency": "USD",
  "last_updated": "2025-01-15T10:30:00Z"
}
```

**`GET /api/v1/accounts/{account_id}/transactions`**

```json
// Context: Retrieves transaction history.
// Query params: ?limit=20&offset=0&status=PAID

Response (200 OK):
{
  "transactions": [
    {
      "transaction_id": "550e8400e29b41d4a716446655440000",
      "amount": 1050,
      "currency": "USD",
      "status": "PAID",
      "description": "Payment for Order #12345",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

**Module Abstraction**

```go
type TransactionService interface {
    // Creates a new transaction with idempotency protection
    // Validates balance, step-up auth, and rate limits
    CreateTransaction(ctx context.Context, req CreateTransactionRequest) (*Transaction, error)
    
    // Retrieves transaction by ID
    GetTransaction(ctx context.Context, txnID int64) (*Transaction, error)
    
    // Updates transaction status via FSM
    UpdateTransactionStatus(ctx context.Context, txnID int64, newStatus TransactionStatus) error
    
    // Processes refund (creates offsetting transaction)
    ProcessRefund(ctx context.Context, originalTxnID int64, reason string) (*Transaction, error)
}

type AccountService interface {
    // Retrieves account balance with optimistic locking support
    GetAccount(ctx context.Context, accountID int64) (*Account, error)
    
    // Updates balance with version check (optimistic locking)
    UpdateBalance(ctx context.Context, accountID int64, amount int64, version int) error
    
    // Retrieves transaction history (reads from replica/ES)
    GetTransactionHistory(ctx context.Context, accountID int64, filters HistoryFilters) ([]Transaction, error)
}

type PaymentGatewayService interface {
    // Processes payment through external gateway (Stripe)
    ProcessPayment(ctx context.Context, req PaymentRequest) (*PaymentResponse, error)
    
    // Handles webhook callbacks from payment provider
    HandleWebhook(ctx context.Context, payload []byte, signature string) error
    
    // Retrieves settlement report for reconciliation
    GetSettlementReport(ctx context.Context, date time.Time) ([]SettlementRecord, error)
}

type ReconciliationService interface {
    // Runs daily reconciliation against external provider
    ReconcileTransactions(ctx context.Context, date time.Time) (*ReconciliationReport, error)
    
    // Identifies and flags discrepancies
    FlagDiscrepancy(ctx context.Context, externalRefID string, reason string) error
}
```

***

## 6. Processing Detail

### **Business Logic & Constraints**

1. **Balance Validation**: A transaction cannot be created if `available_balance < transaction_amount`.
2. **Idempotency**: Transaction requests with duplicate `idempotency_key` return the existing transaction (HTTP 409).
3. **Step-Up Authentication**: All financial operations require fresh authentication token verified within last 5 minutes.
4. **Rate Limiting**:
   * Per IP: 100 requests/hour
   * Per User: 50 transactions/hour
   * Per Device: 30 transactions/hour
5. **Monetary Storage**: All amounts stored as integers in minor units (cents) - NEVER use FLOAT/DOUBLE to eliminate floating-point rounding errors..
6. **Corrections/refunds** create new offsetting transaction rows. This ensures complete audit trail and immutability
7. **Double-Entry Bookkeeping**
   1. Every financial event records a debit from one account and credit to another
   2. System-wide sum of all transactions must always equal zero
   3. Provides mathematical proof of correctness
8. **Optimistic Locking**
   1. Account balance updates check version number. If version mismatch, transaction fails and retries
   2. Query: `UPDATE accounts SET balance = ?, version = version + 1 WHERE id = ? AND version = ?`
   3. Prevents race conditions without expensive table locks

***

### **Transaction Finite State Machine (FSM)**

```
CREATED → PENDING → PAID → SETTLED
   ↓         ↓        ↓
 FAILED   FAILED   REFUNDED
```

**State Definitions:**

* `CREATED`: Transaction record created, awaiting processing
* `PENDING`: Sent to payment gateway, awaiting confirmation
* `PAID`: Payment confirmed by gateway
* `SETTLED`: Funds fully settled (after settlement period)
* `FAILED`: Transaction failed at any stage
* `REFUNDED`: Transaction has been refunded (creates offsetting entry)

**Invalid Transitions:**

* Cannot go from `FAILED` to `PAID` directly
* Cannot go from `SETTLED` back to `PENDING`
* Cannot skip states (e.g., `CREATED` → `SETTLED`)

***

### **Critical Flows (Sequence Diagram)**

_Scenario: User initiates a payment transaction._

***

<figure><img src=".gitbook/assets/image (19).png" alt=""><figcaption></figcaption></figure>

### **Edge Cases & Failure Scenarios**

**Database Write Failure**:

* Return `500 Internal Server Error`
* Transaction rolled back, no state change
* Client can retry with same idempotency key

**Optimistic Locking Conflict**:

* Concurrent balance update detected via version mismatch
* Transaction rolled back automatically
* Retry with exponential backoff (max 3 attempts)

**Payment Gateway Timeout**:

* Transaction remains in `PENDING` state
* Background job polls gateway for status
* After timeout (5 minutes), mark as `FAILED`

**Duplicate Idempotency Key**:

* Check for existing transaction at start
* Return existing transaction with HTTP 409 Conflict
* No new database writes performed

**Insufficient Balance During Concurrent Transactions**:

* Use row-level locking: `SELECT ... FOR UPDATE` on account
* First transaction succeeds, second fails with insufficient balance
* Ensures no overdraft

**Network Failure After Payment Gateway Success**:

* Webhook from gateway will update status to PAID
* If webhook fails, reconciliation process catches discrepancy
* Manual or automated resolution via reconciliation service

**Reconciliation Discrepancies**:

* Daily batch job compares internal ledger vs. Stripe settlement
* Mismatches flagged in `reconciliation_records` table
* Alert sent to operations team for investigation

***

**Reconciliation Process: Daily Batch Job (Scheduled at 02:00 UTC):**

1. Fetch settlement report from Stripe for previous day
2. Query internal transactions for same date range
3. Match by `external_ref_id`
4. Compare: amount, status, currency
5. Flag discrepancies:
   * `MISSING_INTERNAL`: Stripe has record, we don't
   * `MISSING_EXTERNAL`: We have record, Stripe doesn't
   * `DISCREPANCY`: Amounts or statuses don't match
6. Generate reconciliation report
7. Alert operations team if discrepancies > threshold

***

## 7. Security Considerations

**Step-Up Authentication Flow**

1. User initiates financial transaction
2. System requires fresh authentication (< 5 minutes old)
3. User provides PIN or Biometric signature
4. Verification payload sent to isolated Auth Service or HSM
5. Auth Service returns signed `step_up_token` (JWT)
6. Token included in transaction request
7. API validates token signature and expiry
8. Only then is transaction processed

**Rate Limiting Strategy**

**Multi-Layer Defense:**

```
Layer 1: IP-based (CloudFlare/CDN level)
  └─ 1000 req/minute per IP

Layer 2: User-based (Application level)
  └─ 50 transactions/hour per user_id

Layer 3: Device-based (Application level)
  └─ 30 transactions/hour per device_signature

Layer 4: Pattern Detection (ML-based)
  └─ Flag suspicious patterns (card testing)
```

**Data Protection**

* **Encryption at Rest**: AES-256 for database storage
* **Encryption in Transit**: TLS 1.3 for all API calls
* **Sensitive Data**: PCI DSS compliance for payment data
* **Internal User Mapping**: External user IDs mapped to internal UUIDs to decouple from identity providers

***

## 8. Monitoring & Observability

**Key Metrics**

* **Transaction Success Rate**: Target > 99.5%
* **API Latency**: p50, p95, p99 for all endpoints
* **Balance Accuracy**: Reconciliation match rate > 99.9%
* **Retry Rate**: Track optimistic locking conflicts
* **Gateway Response Time**: Monitor Stripe API performance

**Alerts**

* Balance discrepancy detected in reconciliation
* Transaction failure rate > 5% for 5 minutes
* API latency > 1 second for p95
* Optimistic locking retry rate > 20%
* Rate limit threshold breached (potential attack)

***

## 9. Future Considerations

* Migration to microservices architecture as scale increases
* Support for additional payment gateways (PayPal, Square)
* Multi-currency support and FX conversion
* Advanced fraud detection with ML models
* Real-time reconciliation instead of daily batch
* GraphQL API for flexible client queries

***

## **References**

* Stripe API Documentation: [https://stripe.com/docs/api](https://stripe.com/docs/api)
* PostgreSQL Optimistic Locking: [https://www.postgresql.org/docs/current/mvcc.html](https://www.postgresql.org/docs/current/mvcc.html)
* PCI DSS Compliance: [https://www.pcisecuritystandards.org/](https://www.pcisecuritystandards.org/)
