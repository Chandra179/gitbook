# Digital Wallet

> Status: DRAFT | Author: \[Your Name] | Last Updated: 2025-11-27
>
> Reviewers: \[Name 1], \[Name 2]

***

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

**Data Model (Schema)**

> \[Insert Image: ER Diagram]
>
> Diagram Logic:
>
> * `accounts` (Mutable state, Optimistic Locking)
> * `ledger_entries` (Immutable, Double-Entry)
> * `transactions` (The parent event, FSM State)

1\. Accounts Table (Snapshot State)

```sql
CREATE TABLE accounts (
    id             BIGINT PRIMARY KEY,        -- Snowflake ID
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
    from_account_id   BIGINT NOT NULL,
    to_account_id     BIGINT NOT NULL,
    
    -- TRANSACTION DETAILS
    amount            BIGINT NOT NULL,              -- In minor units (cents)
    currency          CHAR(3) NOT NULL,
    transaction_type  VARCHAR(50) NOT NULL,         -- 'PAYMENT', 'REFUND', 'TRANSFER'
    
    -- STATE MACHINE
    status            VARCHAR(20) NOT NULL,         -- FSM: CREATED, PENDING, PAID, SETTLED, FAILED, REFUNDED
    
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
    entry_type      VARCHAR(10) NOT NULL,    -- 'DEBIT' or 'CREDIT'
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
    match_status        VARCHAR(20) NOT NULL,        -- 'MATCHED', 'DISCREPANCY', 'MISSING_INTERNAL', 'MISSING_EXTERNAL'
    discrepancy_reason  TEXT,
    
    -- AUDIT
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ,
    
    CONSTRAINT fk_transaction_recon FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE INDEX idx_recon_date ON reconciliation_records(reconciliation_date);
CREATE INDEX idx_recon_status ON reconciliation_records(match_status);
```

**Storage Strategy**

* Numeric Precision: All monetary values stored as Integers (Minor Units, e.g., $10.50 = 1050 cents) to eliminate floating-point rounding errors.
* Immutability: `transaction` are Append-Only. Corrections are made by inserting new offsetting entries, never by updating existing rows.

**Append-Only Principle**

* Transaction rows are NEVER updated after creation
* Corrections/refunds create new offsetting transaction rows
* This ensures complete audit trail and immutability

**Double-Entry Bookkeeping**

* Every financial event records a debit from one account and credit to another
* System-wide sum of all transactions must always equal zero
* Provides mathematical proof of correctness

**Optimistic Locking:**

* Account balance updates check version number
* Query: `UPDATE accounts SET balance = ?, version = version + 1 WHERE id = ? AND version = ?`
* If version mismatch, transaction fails and retries
* Prevents race conditions without expensive table locks

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
5. **Monetary Storage**: All amounts stored as integers in minor units (cents) - NEVER use FLOAT/DOUBLE.
6. **Immutability**: Transaction records are never updated; corrections create new offsetting entries.

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

```
User → API: POST /api/v1/transactions
                 (with step_up_token)

API → Rate Limiter: Check rate limits
                    (IP/User/Device)
Rate Limiter → API: OK

API → Auth Service: Verify step_up_token
Auth Service → API: Token valid

API → AccountService: GetAccount(from_account_id)
                      (Read with version)
AccountService → PostgreSQL: SELECT ... WHERE id = ?
PostgreSQL → AccountService: Account data + version
AccountService → API: Account{balance, version}

API → Business Logic: Validate balance >= amount
Business Logic → API: Validation passed

API → TransactionService: CreateTransaction()
TransactionService → PostgreSQL: BEGIN TRANSACTION

-- Check idempotency
TransactionService → PostgreSQL: SELECT ... WHERE idempotency_key = ?
PostgreSQL → TransactionService: No existing transaction

-- Create transaction record
TransactionService → PostgreSQL: INSERT INTO transactions
                                 (status = CREATED)

-- Update account balance (optimistic locking)
TransactionService → PostgreSQL: UPDATE accounts 
                                 SET balance = balance - amount,
                                     version = version + 1
                                 WHERE id = ? AND version = ?

-- If version mismatch (concurrent update)
PostgreSQL → TransactionService: 0 rows affected
TransactionService → PostgreSQL: ROLLBACK
TransactionService → API: Retry required

-- If successful
PostgreSQL → TransactionService: 1 row affected

-- Create ledger entries (double-entry)
TransactionService → PostgreSQL: INSERT INTO transaction_ledger
                                 (account_id=from, entry_type=DEBIT)
                                 INSERT INTO transaction_ledger
                                 (account_id=to, entry_type=CREDIT)

TransactionService → PostgreSQL: COMMIT
PostgreSQL → TransactionService: Transaction committed

-- Update transaction status to PENDING
TransactionService → PostgreSQL: INSERT new transaction
                                 (status = PENDING, refs original)

-- Process with external gateway
TransactionService → PaymentGateway: ProcessPayment()
PaymentGateway → Stripe: Create payment intent
Stripe → PaymentGateway: Payment intent created
PaymentGateway → TransactionService: external_ref_id

TransactionService → API: Transaction created (PENDING)
API → User: 201 Created {transaction_id, status}

-- Async: Webhook from Stripe
Stripe → API: POST /webhooks/stripe
                 (payment confirmed)
API → PaymentGateway: HandleWebhook()
PaymentGateway → TransactionService: UpdateStatus(PAID)
TransactionService → PostgreSQL: INSERT new transaction
                                 (status = PAID, refs original)
```

***

**Edge Cases & Failure Scenarios**

1. **Database Write Failure**:
   * Return `500 Internal Server Error`
   * Transaction rolled back, no state change
   * Client can retry with same idempotency key
2. **Optimistic Locking Conflict**:
   * Concurrent balance update detected via version mismatch
   * Transaction rolled back automatically
   * Retry with exponential backoff (max 3 attempts)
3. **Payment Gateway Timeout**:
   * Transaction remains in `PENDING` state
   * Background job polls gateway for status
   * After timeout (5 minutes), mark as `FAILED`
4. **Duplicate Idempotency Key**:
   * Check for existing transaction at start
   * Return existing transaction with HTTP 409 Conflict
   * No new database writes performed
5. **Insufficient Balance During Concurrent Transactions**:
   * Use row-level locking: `SELECT ... FOR UPDATE` on account
   * First transaction succeeds, second fails with insufficient balance
   * Ensures no overdraft
6. **Network Failure After Payment Gateway Success**:
   * Webhook from gateway will update status to PAID
   * If webhook fails, reconciliation process catches discrepancy
   * Manual or automated resolution via reconciliation service
7. **Reconciliation Discrepancies**:
   * Daily batch job compares internal ledger vs. Stripe settlement
   * Mismatches flagged in `reconciliation_records` table
   * Alert sent to operations team for investigation

***

**Reconciliation Process**

**Daily Batch Job (Scheduled at 02:00 UTC):**

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

#### 7. Security Considerations

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

#### 8. Monitoring & Observability

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

#### 9. Future Considerations

* Migration to microservices architecture as scale increases
* Support for additional payment gateways (PayPal, Square)
* Multi-currency support and FX conversion
* Advanced fraud detection with ML models
* Real-time reconciliation instead of daily batch
* GraphQL API for flexible client queries

***

#### 10. Appendix

**Glossary**

* **Minor Units**: Smallest currency unit (cents for USD, sen for IDR)
* **Optimistic Locking**: Concurrency control that assumes conflicts are rare
* **Idempotency Key**: Unique identifier to prevent duplicate operations
* **FSM**: Finite State Machine - formal model for transaction lifecycle
* **CQRS**: Command Query Responsibility Segregation - separate read/write models
* **Double-Entry Bookkeeping**: Accounting system where every debit has corresponding credit

**References**

* Stripe API Documentation: [https://stripe.com/docs/api](https://stripe.com/docs/api)
* PostgreSQL Optimistic Locking: [https://www.postgresql.org/docs/current/mvcc.html](https://www.postgresql.org/docs/current/mvcc.html)
* PCI DSS Compliance: [https://www.pcisecuritystandards.org/](https://www.pcisecuritystandards.org/)
