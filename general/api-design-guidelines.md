# API Design Guidelines

#### Data Integrity & Types

* Use **Integers** as currency to eliminate floating-point rounding errors. Always pair the value with a Currency Code (ISO 4217).
* Treat null, empty, and default values carefully. In Fintech, `0` is a valid balance, not "missing data."
* If you accept a partial payload (PATCH), ensure your validation logic explicitly rejects _unknown_ fields.

#### Performance & Efficiency

* Dont Base64 encode large files. Use `multipart/form-data` for uploads and binary streaming with correct `Content-Type` headers for downloads.
* Apply dual-layer limiting. Use Infrastructure-level limiting (e.g., Nginx, API Gateway) to stop DDoS, and Application-level limiting (e.g., Redis Token Bucket) for business rules per user/tenant.
* Use pagination (cursor-based preferred over offset-based for large datasets), filtering, and sorting on all collection endpoints.
* All internal APIs must accept and use standard Tracing Headers (e.g., W3C `traceparent` or B3 headers) to ensure we can debug a request across microservices
* Is it batch/Bulk operations. Is it Atomic Transaction or 'Partial Success'? If partial success is allowed, the response structure must explicitly map individual IDs to their success/error status.
* For long running operations do not block the HTTP request. Return `202 Accepted` with a `Location` header pointing to a status polling endpoint, or use Webhooks."

#### Reliability & Safety

* Use idempotency for state-changing operations (POST/PATCH). Cache the response result (200/422) with a TTL; if a client retries with the same key, return the cached response immediately without re-processing.
* Set endpoint timeouts, Implement Circuit Breakers to fail fast when downstream dependencies are unhealthy.
* Enforce PII/PCI in logs and traces." In Fintech, logging a raw request body that contains a credit card number or a refresh token is (you get fired), also do Log Sanitization

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
