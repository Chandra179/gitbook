# API Design

* Only unmarshal or deserialize the fields required from response bodies to reduce processing cost and memory footprint.
* Avoid relying on default native values (e.g., int defaulting to 0) without validating whether the returned value is meaningful in the business logic. Treat null, empty, and default values explicitly, especially in domains where numeric values such as `0` may represent a valid state (e.g., financial or loan calculations). Use precise decimal types when handling money to prevent rounding or floating-point errors.
* Apply rate limiting at both infrastructure and application levels. Use infrastructure rate limiting to prevent brute force or abuse and application-level rate limiting to enforce business rules (e.g., limit attempts on specific operations).
* For file or image transfer over HTTP, use streaming or `multipart/form-data` for uploads and return files with the correct `Content-Type` for downloads. Avoid Base64 encoding for large files due to performance overhead and increased payload size.
* Enforce authorization for controlling and restricting access to endpoints based on user roles, permissions, or context. Ensure authentication occurs before authorization.
* Use efficient serialization to reduce outgoing payload size and improve performance. Consider using formats like Protobuf for gRPC or high-throughput services.
* Ensure idempotency for critical or irreversible operations (e.g., financial transactions, purchase orders). Use an idempotency key to prevent duplicate processing when clients retry requests.
* Maintain clear and complete API documentation for every use case, describing request/response structures, behaviors, and edge cases. Documentation should reflect real behavior, not aspirational behavior.
* Use reserved and conventional HTTP status codes consistently. A request with valid input should not return client error codes, even if no data is found. Return empty data or alternative response representations as appropriate.
* Implement request retry mechanisms with careful consideration of retry conditions, maximum retry count, delay strategy, and fallback behavior. Combine retries with idempotency to prevent unintended repeated operations.
* Use API versioning (v1, v2, ...) to avoid breaking changes. Expose versioning through URLs or headers depending on API design.
* Standardize a consistent error response structure for internal APIs to simplify client handling. External APIs may adopt different structures depending on requirements.
* Validate incoming requests strictly according to expected rules. Ensure invalid requests are rejected early with meaningful error messages.
* Apply request timeouts to prevent indefinite waiting and cascading failures. Timeout values should align with upstream service SLAs rather than arbitrary limits.
* Include structured logging, tracing, and metrics collection to enable observability and troubleshooting in distributed environments. Use trace IDs or correlation IDs for end-to-end request tracking.
* Provide pagination, filtering, and sorting support for endpoints returning collections to avoid excessive payload sizes and reduce server load.
* Use consistent naming conventions and data formats across APIs (e.g., camelCase or snake\_case, ISO8601 for timestamps, UTC for time storage).
* Prefer schema-first API design using OpenAPI (for REST) or protobuf schema (for gRPC) to ensure contract clarity and automatic stub generation.
* Design APIs to be easily testable by separating business logic from transport concerns and supporting mockable external dependencies.
* Apply circuit breaker mechanisms to prevent cascading failures when downstream systems are slow or unavailable.
