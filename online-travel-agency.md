# Online Travel Agency

#### What's the Core Feature?

* Real-time Integration: Aggregating flight and hotel inventory from disparate API sources (airlines, GDS, bedbanks) with varying speeds and protocols.
* High-Performance Search: Handling massive traffic spikes (Black Friday) using caching and request coalescing to prevent system crashes.
* Data Accuracy: Complex rules engine for calculating fares, baggage, and cancellations; "Verify" step to ensure price validity before payment.
* Dynamic Packaging: Intelligent bundling of flights and hotels using opaque pricing logic to offer competitive rates.
* Async Fulfillment: Decoupling payment from ticketing to keep the user interface responsive, with automated recovery (refunds) for failed bookings.
* Post-Booking Services: Online check-in support and management of rescheduling/cancellations.

#### How Big is the System?

* Traffic:
  * Normal: \~1,000 Requests Per Second (RPS).
  * Peak (Black Friday): Up to 20,000 RPS.
* Users: \~1 Million Daily Active Users (DAU).
* Ratios: Massive Search-to-Book ratio (\~1000:1), making the system extremely Read-Heavy.
* Consistency:
  * Search: Eventual Consistency. Prices cached with dynamic TTL (Time-To-Live) based on flight proximity (e.g., 5 mins standard, 1 min if flight is soon).
  * Booking: Strong Consistency. ACID transactions required to prevent double-spending or double-booking.

#### What's the User Journey?

1. Search: User queries "Jakarta to Tokyo". System hits Redis Cache (Superset data).
2. Filter: User applies "Direct Only". System filters the cached master list in-memory (Go) instantly.
3. Verify (Crucial): User selects a flight. System pauses to hit the Live Airline API to confirm the seat and price still exist.
4. Pay: User pays. System creates a `PENDING_TICKET` record.
5. Async Ticketing: System displays "Processing...". A background worker talks to the airline to issue the ticket (PNR).
6. Confirmation: User receives the e-ticket via email.

#### What's the Data Model?

Search Cache (Redis):

* Key Strategy: `flight:s:{Origin}:{Dest}:{Date}:{Cabin}:{PaxCount}` (Broad Key).
* Optimization: Stores compressed (Snappy/Zstd) lists of _all_ airlines for that route.
* Logic: Filtering (by Airline, Time, Stops) happens in the application layer, not the cache layer.

Booking DB (PostgreSQL):

* Use versioning because if we have update operation and we running multiple machines so the row could be accessed at the same time. We can use locking mechanism for the alternatives but in high traffic it will become slow.&#x20;

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- The main account holder making the booking
    
    -- Status Management
    status VARCHAR(50) NOT NULL DEFAULT 'INIT', -- e.g., INIT, PENDING_PAYMENT, PAID, TICKETED, REFUNDED, CANCELLED
    
    -- Financials
    total_amount BIGINT NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'IDR', -- ISO Currency Code
    
    -- The "Lean" Data Fields (Storing complex data as JSON)
    -- Structure: [{"type": "ADT", "title": "Mr", "name": "John Doe", "passport": "..."}]
    passengers JSONB NOT NULL, 
    
    -- Structure: [{"flight_code": "GA871", "src": "CGK", "dst": "NRT", "dep_time": "..."}]
    flight_segments JSONB NOT NULL, 
    
    -- Contact info for this specific booking
    contact_details JSONB NOT NULL, -- {"email": "john@email.com", "phone": "+6281..."}

    -- Concurrency Control (CRITICAL)
    -- Application must increment this on every update. 
    -- WHERE version = read_version
    version INT NOT NULL DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for "My Orders" page
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
-- Index for finding bookings by status (e.g., finding expired unpaid bookings)
CREATE INDEX idx_bookings_status ON bookings(status);


CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    
    -- What happened?
    event_type VARCHAR(50) NOT NULL, -- e.g., PAYMENT_INITIATED, PAYMENT_SUCCESS, REFUND_REQUESTED, REFUND_COMPLETED
    
    -- Money Flow
    -- Positive (+) for Charging user, Negative (-) for Refunds
    amount BIGINT NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'IDR',
    
    -- External Reference (Reconciliation)
    payment_provider VARCHAR(50) NOT NULL, -- e.g., 'STRIPE', 'XENDIT', 'MIDTRANS'
    external_ref_id VARCHAR(255), -- The Transaction ID or VA Number from the provider
    
    -- Audit Trail
    -- Store the full raw Webhook/Response from the provider here for debugging
    payload JSONB, 
    
    -- When it happened (Immutable)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_external_ref ON transactions(external_ref_id);
```

#### Big Picture (Component Diagram)

* Gateway: Rate Limiting (Token Bucket) & Auth.
* Read Path (Go):
  * Search Service: Uses `singleflight` to merge 500 identical Black Friday requests into 1 request to the airline.
  * Redis Cluster: Stores the "Superset" flight data.
* Write Path (Go):
  * Booking Service: Writes state to PostgreSQL.
  * Kafka/Queue: Buffers paid bookings to protect the system from slow airline APIs.
* Workers:
  * Fulfillment Worker: Consumes Kafka -> Calls Airline XML/SOAP API -> Updates DB.
  * Compensating Worker: Auto-refunds user if Airline API returns "Sold Out" after payment.
