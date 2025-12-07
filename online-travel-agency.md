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

* Search Cache (Redis):
  * Key Strategy: `flight:s:{Origin}:{Dest}:{Date}:{Cabin}:{PaxCount}` (Broad Key).
  * Optimization: Stores compressed (Snappy/Zstd) lists of _all_ airlines for that route.
  * Logic: Filtering (by Airline, Time, Stops) happens in the application layer, not the cache layer.
* Booking DB (PostgreSQL):
  * `bookings` table: `id`, `user_id`, `status` (INIT, PAID, TICKETED, REFUND\_NEEDED), `snapshot_price` (JSON - exact price user saw), `pnr_ref`.
  * `booking_segments` table: Stores immutable details of the flight legs booked.

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
