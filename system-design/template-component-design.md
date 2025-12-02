# \[Template] Component Design

#### 1. Purpose

One-sentence description of what this service does.&#x20;

**Example:** Handles order creation, validation, and lifecycle management.

***

#### 2. Interface Contract

**2.1 How to Communicate**

**Protocol:** REST / gRPC / GraphQL

**Rest examples:**

| Method | Path                  | Purpose                |
| ------ | --------------------- | ---------------------- |
| POST   | /orders               | Create new order       |
| GET    | /orders/{id}          | Retrieve order details |
| PATCH  | /orders/{id}/status   | Update order status    |
| GET    | /orders?user\_id={id} | List user orders       |

**Events Consumed:**

Think this through do we need event?

* `PaymentCompleted` (from Kafka topic: `payments`)
* `InventoryReserved` (from Kafka topic: `inventory`)

**2.2 Request/Response Schema**

**POST /orders**

```json
Request:
{
  "user_id": "string",
  "items": [{"product_id": "string", "quantity": number}],
  "shipping_address": {...}
}

Response (201):
{
  "order_id": "string",
  "status": "pending",
  "total": number,
  "created_at": "timestamp"
}
```

**Event: PaymentCompleted**

```json
{
  "order_id": "string",
  "payment_id": "string",
  "amount": number,
  "status": "completed"
}
```

***

#### 3. Module Abstraction

interfaces for the implementation for abstraction and avoid vendor locked in. Do not abuse abstraction, think first do we need it or not

#### 4. Module Implementation

pseudocode for each module interface functions
