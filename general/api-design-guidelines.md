# API Design Guidelines

#### Data Integrity & Types

* Store and transmit monetary values as **Integers** representing the lowest currency unit (e.g., cents, sen, or satoshis) to absolutely eliminate floating-point rounding errors. Always pair the value with a Currency Code (ISO 4217).
* Treat null, empty, and default values explicitly. In Fintech, `0` is a valid balance, not "missing data."
* When consuming data, **only** unmarshal/deserialize fields required for logic to save memory. And validate _incoming_ request payloads (length, regex, noramlization, etc..) to avoid malformed data

#### Performance & Efficiency

* Use efficient serialization. Prefer JSON for public APIs for readability, but use Protobuf for internal gRPC high-throughput services.
* Never Base64 encode large files. Use `multipart/form-data` for uploads and binary streaming with correct `Content-Type` headers for downloads.
* Apply dual-layer limiting. Use Infrastructure-level limiting (e.g., Nginx, API Gateway) to stop DDoS, and Application-level limiting (e.g., Redis Token Bucket) to enforce business rules per user/tenant.
* Use pagination (cursor-based preferred over offset-based for large datasets), filtering, and sorting on all collection endpoints.

#### Reliability & Safety

* Use idempotency for state-changing operations (POST/PATCH), especially payments. Require an `Idempotency-Key` header. Cache the response result with a TTL; if a client retries with the same key, return the cached response immediately without re-processing.
* Set endpoint timeouts, Implement Circuit Breakers to fail fast when downstream dependencies are unhealthy, preventing cascading system failures.
* Use Optimistic Locking (via `ETags` or `version` fields) to prevent "Lost Update" problems when multiple users modify the same resource simultaneously.

#### HTTP Semantics & Status Codes

* **Collections:** A search that finds nothing (e.g., `GET /transactions?date=today`) is a success. Return `200 OK` with an empty list `[]`.
* **Resources:** A request for a specific entity that is missing (e.g., `GET /transactions/tx-123`) must return `404 Not Found`.
* **Consistent Errors:** Standardize error responses (e.g., RFC 7807 Problem Details) across internal APIs so clients can parse `code`, `message`, and `details` uniformly.

#### Security

* Authenticate (who are you?) before Authorizing (what can you do?). Enforce Role-Based (RBAC) or Attribute-Based (ABAC) access control at the endpoint level.
* Enforce TLS 1.2+ and use strict CORS policies.

#### Lifecycle & Versioning

* Never break a live API. When introducing v2, deploy it alongside v1. Mark v1 as deprecated (via headers), monitor traffic until it hits zero, and then remove.
* Use explicit versioning in the URL (`/v1/`) or Header (`Accept-Version`). With their own tradeoffs
* Document the _actual_ behavior, including edge cases and error responses. Use schema-first design (OpenAPI/Swagger) to ensure implementation matches documentation.
