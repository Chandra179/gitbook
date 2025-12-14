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

#### Request Coalescing

Let's say the endpoint has a million incoming identical requests from multiple users, which we forward to an external API. Surely, this will be slow and result in high latency. Since it's the same request, we can use Request Coalescing.

How it works: When a request comes in for "Data ID=50":

1. Check is there already an ongoing HTTP request to the external API for "ID=50"?
2. If No launch the request.
3. If Yes do not make a new request. Instead, "subscribe" to the existing one. Pause and wait for that first request to finish.
4. When the one request finishes, the result is copied and returned to all waiting listeners instantly.

```go
import (
    "fmt"
    "net/http"
    "golang.org/x/sync/singleflight"
)

var requestGroup singleflight.Group

func HandleRequest(w http.ResponseWriter, r *http.Request) {
    key := r.URL.Query().Get("id") // e.g., "user_123"

    // singleflight.Do ensures that for a given 'key', the function 
    // is executed only once at a time.
    // All concurrent calls with the same key wait for the return of this one function.
    v, err, shared := requestGroup.Do(key, func() (interface{}, error) {
        // This logic runs ONLY ONCE per concurrent batch
        return CallSlowExternalAPI(key)
    })

    if err != nil {
        http.Error(w, err.Error(), 500)
        return
    }

    // 'v' is the result shared among all simultaneous requests
    fmt.Fprintf(w, "Result: %v (Shared? %v)", v, shared)
}
```
