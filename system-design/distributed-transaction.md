# Distributed Transaction

#### System Context and Objective

We are architecting a distributed financial transaction system designed to handle sensitive money movement operations, including payments, refunds, and ledger management. The primary non-negotiable requirements for this system are **Data Consistency, Idempotency, and Auditability.** While high performance is required, it must never come at the cost of financial accuracy. The system will serve as the "source of truth" for user balances and transaction histories, interacting with external payment gateways while maintaining an internal immutable ledger.

#### Identity Management and Security Control

To ensure complete control over user data and decouple our system from external providers, we will utilize a mapped internal identification strategy. While we may accept authentication via OIDC (Google, Apple), we will map these to a unique internal `user_id` (UUID or BigInt) as the primary key. This ensures account continuity even if a user changes their external provider or loses access.&#x20;

For transaction identifiers, we will utilize a distributed ID generator (such as Twitter Snowflake or KSUID) rather than standard UUIDs; this provides time-sortable, 64-bit integers that significantly improve database indexing performance. Furthermore, to prevent "card testing" fraud and brute-force attacks, we will implement multi-layered rate limiting based on IP address, user ID, and device signature.

#### Financial Data Structure and Precision

All monetary values within the database will be stored as Integers representing minor units (e.g., storing $10.50 as `1050` cents) rather than `FLOAT` or `DOUBLE`. This eliminates the risk of floating-point rounding errors inherent in binary arithmetic.&#x20;

We will rely on `BIGINT` for these fields to accommodate large transaction volumes. We will also enforce a strict schema where a value of `0` has a distinct functional meaning (such as a free trial or full promo redemption), as opposed to `NULL`, which indicates missing data. This structured data will be housed in a relational SQL database (PostgreSQL or MySQL) to leverage ACID properties and structured querying capabilities.

#### The Immutable Ledger and Double-Entry Accounting

To achieve the highest level of data integrity and auditability, the transaction data must be strictly immutable. We will adopt an "Append-Only" strategy where transaction rows are never updated. If a correction or refund is needed, a new transaction row is inserted to offset the previous one. To enforce correctness, we will implement a Double-Entry Bookkeeping schema. Every financial event must record a debit from one account and a credit to another, ensuring that the sum of all transactions across the system always equals zero. This provides a mathematical guarantee of consistency and simplifies the detection of anomalies during audits.

#### 5. Idempotency and Transaction Lifecycle

To handle network failures and prevent duplicate charges, we will implement a robust idempotency mechanism. The client must generate a unique `idempotency_key` (UUID) for every transaction request. The server will check this key against a high-speed store (Redis) or the database before processing; if the key exists, the server returns the previous result without re-processing the payment. Additionally, the transaction lifecycle will be managed via a formal Finite State Machine (FSM). Transactions will move through strict states—`CREATED`, `PENDING`, `PAID`, `SETTLED`, `FAILED`, `REFUNDED`—enforcing logic that prevents illegal transitions, such as moving directly from `FAILED` to `PAID` without a new initiation.

#### 6. Concurrency Control and Isolation

While high isolation levels (like `SERIALIZABLE`) guarantee consistency, they often cause database deadlocks under high load. To balance consistency with low latency, we will implement Optimistic Locking. We will add a `version` number column to account balances. When updating a balance, the query will check that the version matches the one read at the start of the transaction (e.g., `UPDATE accounts SET balance = new_balance, version = version + 1 WHERE id = x AND version = current_version`). If the version has changed during processing, the transaction fails safely and triggers a retry, ensuring data consistency without locking the entire table.

#### 7. Authorization and Step-Up Authentication

Standard login is insufficient for financial movement. We will enforce Step-Up Authentication immediately prior to the transaction execution. This requires the user to input a high-entropy credential—such as a PIN or Biometric signature—to sign the transaction request. This verification payload should be processed by a secure, isolated service or Hardware Security Module (HSM) to ensure that the entity initiating the payment is the verified account holder, mitigating risks associated with session hijacking.

#### 8. System Architecture and Availability

To satisfy the requirements for high throughput and partition tolerance (as per the CAP theorem), we will employ a CQRS (Command Query Responsibility Segregation) pattern. Write operations (payments) will be directed to the master database to ensure immediate consistency, while Read operations (history, analytics) will be served by read replicas or a dedicated search index (e.g., Elasticsearch) to ensure high availability. We will use efficient binary protocols like gRPC for internal microservice communication (e.g., between the Payment Service and Ledger Service) to minimize latency, while exposing standard REST or GraphQL APIs for client compatibility. Database replication will be configured across geographic zones to ensure durability and disaster recovery.

#### 9. Operational Resilience: Reconciliation and Notification

Recognizing that distributed systems eventually drift, we will implement an automated Reconciliation Process. A daily batch job will ingest settlement reports from external payment vendors (e.g., Stripe, PayPal) and match them row-by-row against our internal ledger to identify discrepancies. For asynchronous operations like push notifications (payment success/fail) and refund processing, we will utilize message queues. Crucially, we will implement Dead Letter Queues (DLQ); if a notification or background process fails repeatedly, the event is moved to a DLQ for manual inspection or automated retry, ensuring no transaction state is ever "lost" in the void.
