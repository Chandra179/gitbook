# Event Processing

## Problem

We need to listen to a single queue (Pub/Sub) that triggers the core process for updating Order Status (paid, cancelled, or refunded) and sending multiple notification emails. The current challenge arises when the publisher is delayed, the queue piles up, or the process handler takes too long. This latency creates a poor user experience, as the application displays inconsistent statuses to the user.

The goal is to optimize the consumer service to handle incoming data more efficiently, ensuring high data consistency for order statuses and reducing the time it takes for users to receive emails.

## Database-backed Cron Job (Outbox Pattern)

Use a database-backed job to separate the critical order status update from the time-consuming email delivery process. By persisting the email "intent" within the same database transaction as the order status update, we ensure both actions are handled atomically.

For the emails, the status is stored in the database as "pending." A scheduled Cron Job then reads these unsent records every few minutes and attempts to send them in batches, updating their status to "success" or "failed". This approach prioritizes at-least-once delivery and system stability; even during high traffic or email provider downtime, the primary order flow remains fast, and side effects eventually catch up without clogging the messaging infrastructure.

```mermaid
sequenceDiagram
    participant Client as Client
    participant OrderSvc as Order Service
    participant DB as Database
    participant Cron as Cron Job
    participant EmailProv as Email Provider

    Client->>OrderSvc: POST /orders (pay, cancel, refund)
    OrderSvc->>DB: BEGIN TRANSACTION
    OrderSvc->>DB: Update order status
    OrderSvc->>DB: INSERT email (status=pending)
    OrderSvc->>DB: COMMIT
    OrderSvc-->>Client: 200 OK

    Note over Cron: Runs every 60s
    Cron->>DB: SELECT * FROM emails WHERE status='pending'
    DB-->>Cron: [email_1, email_2, ...]
    loop For each pending email
        Cron->>EmailProv: Send email
        alt Success
            EmailProv-->>Cron: 200 OK
            Cron->>DB: UPDATE email SET status='success'
        else Failure
            EmailProv-->>Cron: 5xx / timeout
            Cron->>DB: UPDATE email SET status='failed'
        end
    end
```

#### Tradeoff

* Pro (Atomicity): Guaranteed consistency. If the database update succeeds, the email intent is saved in the same transaction. If the email provider is down, the record simply stays "pending" for a future retry.
* Con (Polling Latency): If the Cron runs every 60 seconds, a user might wait a full minute for their "Success" email.
* Con (DB Load): Running the job too frequently (e.g., every second) risks putting unnecessary IOPS load on the database just to check for empty rows.

## Change Data Capture & Message Relay

The **CDC** approach offers near-instant execution by using a listener (such as Debezium) to monitor the database transaction logs (WAL). A relay then pushes the captured data to a dedicated Email Queue, where a specialized Worker consumes and processes the messages. This approach results in minimal latency between the database update and email delivery, high throughput without additional database IOPS from polling, and a completely decoupled architecture that ensures the main application logic remains lightweight.

```mermaid
sequenceDiagram
    participant Client as Client
    participant OrderSvc as Order Service
    participant DB as Database
    participant CDC as CDC Listener (Debezium)
    participant Queue as Email Queue
    participant Worker as Email Worker
    participant EmailProv as Email Provider

    Client->>OrderSvc: POST /orders (pay, cancel, refund)
    OrderSvc->>DB: Update order status
    DB-->>OrderSvc: OK
    OrderSvc-->>Client: 200 OK

    Note over DB,CDC: Database writes to WAL
    CDC->>DB: Read transaction log (WAL)
    DB-->>CDC: "order_updated", "email_pending"
    CDC->>Queue: Push email event
    Queue-->>Worker: Deliver message
    Worker->>Worker: Build email from event
    Worker->>EmailProv: Send email
    EmailProv-->>Worker: 200 OK
```

#### Why this is often better:

* Near-instant execution: No waiting for a Cron schedule.
* Decoupling: Your Order Service database doesn't get hammered by "check" queries; the relay reads from logs.

#### Tradeoffs

* **Pro (Near-instant Execution)**: Provides real-time delivery without waiting for a Cron schedule.
* **Pro (Decoupling)**: The primary database is not burdened by frequent "check" queries; the relay reads directly from logs.
* **Con (Infrastructure Complexity)**: Requires managing additional middleware, which adds a new layer to the tech stack needing its own monitoring and scaling.
* **Con (Operational Risk)**: If the relay service fails, transaction logs can accumulate rapidly on the DB server, potentially consuming all disk space.
* **Con (Fragility)**: CDC tools are tightly coupled to database internals; major version upgrades or schema changes can break the relay or cause data misinterpretation.
