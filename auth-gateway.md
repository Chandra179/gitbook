# Auth Gateway

#### Table of Contents

1. [Introduction](https://claude.ai/chat/be0d074b-b118-41cc-ac8e-68e5b4ebcba8#introduction)
2. [High-Level Architecture](https://claude.ai/chat/be0d074b-b118-41cc-ac8e-68e5b4ebcba8#high-level-architecture)
3. [Data Design](https://claude.ai/chat/be0d074b-b118-41cc-ac8e-68e5b4ebcba8#data-design)
4. [Building Blocks (Components)](https://claude.ai/chat/be0d074b-b118-41cc-ac8e-68e5b4ebcba8#building-blocks-components)
5. [API Design](https://claude.ai/chat/be0d074b-b118-41cc-ac8e-68e5b4ebcba8#api-design)
6. [Observability](https://claude.ai/chat/be0d074b-b118-41cc-ac8e-68e5b4ebcba8#observability)

***

### 1. Introduction

#### **1.1 Context**

This system provides customer-facing authentication by integrating with external OAuth2/OIDC providers (Google, GitHub, Facebook, etc.). The service acts as a centralized authentication gateway that abstracts multiple identity providers, manages user sessions, and issues internal tokens for downstream services. The goal is to provide a unified authentication experience while supporting social login, session management, and standard OIDC discovery for client applications.

**Goals:**

* Enable users to authenticate via multiple social identity providers
* Abstract provider-specific implementations behind a consistent API
* Manage user sessions and token lifecycle securely
* Support standard OAuth2 flows for client applications
* Provide OIDC-compliant endpoints for interoperability

#### **1.2 Functional Requirements**

* FR-1: User Login & Federated Identity: The system must allow users to log in directly via the system's own credentials or by using external identity providers (like Google, GitHub).
* FR-2: Internal Account Management: The system must securely create or link external user accounts to internal user profiles.
* FR-3: Secure Authorization for Apps: The system must provide secure access tokens for client applications (web and mobile) to access protected APIs.
* FR-4: Token and Session Lifecycle: The system must manage the full session lifecycle, including issuing, refreshing, and revoking tokens to ensure continuous and secure access.
* FR-5: Standardization and Discovery: The system must provide standard endpoints that allow client applications to automatically discover configuration details and retrieve core user profile information.

#### **1.3 Non-Functional Requirements**

* **Performance**: P95 latency < 500ms for authentication flows, token operations < 100ms
* **Availability**: 99.5% uptime target (acceptable downtime for MVP)
* **Scalability**: Horizontally scalable to handle 50K users with 10% concurrent active sessions
* **Durability**: User data and tokens must survive service restarts
* **Consistency**: Eventual consistency acceptable for user profile updates, strong consistency for token operations
* **Security**: Secure token storage, encrypted sensitive data at rest, HTTPS only, PKCE mandatory for public clients

***

### 2. High-Level Architecture

#### **2.1 Architecture Style**

**Microservices with API Gateway pattern. Reasons:**

* authentication logic isolated from business services
* Independent scaling of authentication components
* Flexibility to add/remove identity providers without affecting core services
* API Gateway provides centralized entry point, rate limiting, and routing

#### **2.2 Component Diagram**

**Component Responsibilities:**

* **API Gateway**: Entry point, request routing, rate limiting, TLS termination
* **Authentication Service**: Core OAuth2/OIDC logic, provider orchestration, token lifecycle
* **PostgreSQL**: Persistent storage for users, client registrations, refresh tokens
* **Redis**: Session storage, token caching, rate limiting counters
* **External Providers**: Third-party identity sources (Google, GitHub, Facebook)

#### **2.3 Communication Patterns**

<figure><img src=".gitbook/assets/image (23).png" alt=""><figcaption></figcaption></figure>

**Synchronous (HTTP/REST):**

* Client ↔ API Gateway: RESTful endpoints for authentication flows
* Authentication Service ↔ External Providers: OAuth2 protocol exchanges (HTTPS)
* Authentication Service ↔ PostgreSQL: JDBC/SQL queries
* API Gateway ↔ Authentication Service: Internal REST APIs

#### **2.4 Design Considerations & Tradeoffs**

**Decision 1: PostgreSQL for persistent storage**

* **Pros**: ACID compliance for token operations, mature ecosystem, relational model fits user-client-token relationships
* **Cons**: Vertical scaling limits, potential bottleneck at high scale
* **Rationale**: Strong consistency critical for refresh tokens, 50K users well within PostgreSQL capacity

**Decision 2: Redis for session storage**

* **Pros**: Sub-millisecond read/write, TTL-based expiration, high throughput
* **Cons**: In-memory cost, data volatility (mitigated by persistence config)
* **Rationale**: Session reads dominate authentication checks, Redis caching reduces database load

**Decision 3: Stateless JWT access tokens**

* **Pros**: No database lookup for validation, horizontally scalable, standard format
* **Cons**: Cannot revoke before expiry (mitigation: short TTL + refresh tokens), larger token size
* **Rationale**: Performance over revocation granularity, refresh tokens provide control

**Decision 4: Multi-provider abstraction layer**

* **Pros**: Single integration point for clients, easy to add providers, consistent error handling
* **Cons**: Additional abstraction complexity, potential impedance mismatch
* **Rationale**: Business requirement for multiple providers, abstraction prevents client-side complexity

**Decision 5: PKCE mandatory for Authorization Code flow**

* **Pros**: Protects against authorization code interception, industry best practice
* **Cons**: Older clients may not support (negligible in 2025)
* **Rationale**: Security requirement, modern OAuth2 standard

***

### 3. Data Design

#### **3.1 Storage Technologies**

**Primary Store: PostgreSQL**

* **Use case**: Users, client applications, refresh tokens, provider mappings
* **Rationale**: Transactional integrity for token issuance, referential integrity between users and tokens, mature backup/recovery

**Cache/Session Store: Redis**

* **Use case**: Active sessions, authorization codes (short-lived), rate limit counters, UserInfo cache
* **Rationale**: High-speed in-memory operations, built-in TTL for ephemeral data, reduces database reads

**Secret Management: HashiCorp Vault / AWS Secrets Manager**

* **Use case**: OAuth2 provider client secrets, JWT signing keys
* **Rationale**: Centralized secret rotation, audit logging, encryption at rest

#### **3.2 DB Schema**

```sql
-- Users table: Internal user accounts linked to external identities
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' -- active, suspended, deleted
);

-- Provider identities: External provider accounts linked to users
CREATE TABLE provider_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- google, github, facebook
    provider_user_id VARCHAR(255) NOT NULL, -- External provider's user ID
    provider_email VARCHAR(255),
    provider_refresh_token_encrypted TEXT, -- ONLY refresh token from provider (to re-fetch user data)
    provider_token_expires_at TIMESTAMP,
    profile_data JSONB, -- Cached provider profile (name, avatar, etc.)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

-- NOTE: We do NOT store external provider access tokens because:
-- 1. They're only needed during the initial OAuth flow
-- 2. We immediately exchange them for user profile data
-- 3. Storing them increases security risk with minimal benefit
-- We ONLY store provider refresh tokens to optionally re-sync user profile data in the future

-- OAuth2 clients: Registered applications
CREATE TABLE oauth_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(255) UNIQUE NOT NULL,
    client_secret_hash VARCHAR(255), -- NULL for public clients (PKCE)
    client_name VARCHAR(255) NOT NULL,
    redirect_uris TEXT[] NOT NULL, -- Allowed redirect URIs
    grant_types VARCHAR(50)[] NOT NULL, -- authorization_code, refresh_token, client_credentials
    is_public BOOLEAN DEFAULT FALSE, -- True for SPAs/mobile (requires PKCE)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Refresh tokens: Long-lived tokens for obtaining new access tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(255) UNIQUE NOT NULL, -- SHA256 hash of token (NOT the token itself)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
    scope VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    -- For refresh token rotation (optional security enhancement)
    previous_token_hash VARCHAR(255), -- Links to replaced token for rotation detection
    rotation_count INT DEFAULT 0 -- Track how many times this token family has been rotated
);

-- Indexes for performance
CREATE INDEX idx_provider_identities_user_id ON provider_identities(user_id);
CREATE INDEX idx_provider_identities_provider_lookup ON provider_identities(provider, provider_user_id);
CREATE INDEX idx_refresh_tokens_user_client ON refresh_tokens(user_id, client_id);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens(expires_at) WHERE NOT revoked;
```

#### **3.3 Caching Strategy**

**Redis Cache Structure:**

1.  **Sessions** (Key: `session:{session_id}`, TTL: 24 hours)

    ```json
    {
      "user_id": "uuid",
      "client_id": "uuid",
      "scope": "openid profile email",
      "created_at": "timestamp",
      "ip_address": "x.x.x.x"
    }
    ```
2.  **Authorization Codes** (Key: `authz_code:{code}`, TTL: 5 minutes)

    ```json
    {
      "user_id": "uuid",
      "client_id": "uuid",
      "redirect_uri": "https://...",
      "scope": "openid profile",
      "code_challenge": "...",
      "code_challenge_method": "S256"
    }
    ```
3. **Rate Limiting** (Key: `ratelimit:{ip}:{endpoint}`, TTL: 1 minute)
   * Sliding window counter for requests per IP/endpoint

**Cache Invalidation:**

* Sessions: TTL expiry or explicit logout
* Authorization codes: Single-use (delete after exchange) or TTL expiry

***

### 4. Building Blocks (Components)

**Component: `API Gateway`**

**Purpose:** Entry point for all client requests, responsible for routing, rate limiting, TLS termination, and request validation.

**Responsibilities:**

* Route requests to Authentication Service or downstream Resource Services
* Apply rate limiting (100 req/min per IP for auth endpoints)
* Terminate TLS and enforce HTTPS-only
* Add correlation IDs for distributed tracing
* Basic request validation (malformed payloads, oversized requests)

**APIs / Interfaces:**

* Public REST endpoints (proxied to backend services)
* No direct business logic, pure routing layer

**Data Owned:**

* None (stateless routing)

**Design Tradeoffs:**

* **Choice**: Nginx + Lua / Kong / AWS API Gateway
* **Rationale**: Nginx for simplicity in MVP, Kong for advanced features if needed
* **Tradeoff**: Centralized gateway = potential bottleneck, mitigated by horizontal scaling

**Failure Modes & Mitigations:**

* **Gateway down**: Deploy multiple instances behind load balancer (AWS ALB/NLB)
* **Backend service timeout**: Circuit breaker pattern, fallback error responses

***

**Component: `Authentication Service`**

**Purpose:** Core service implementing OAuth2/OIDC flows, managing provider integrations, issuing internal tokens, and handling session lifecycle.

**Responsibilities:**

* Implement Authorization Code flow with PKCE
* Implement Client Credentials flow
* Implement Refresh Token flow (token rotation)
* Integrate with external OAuth2 providers (Google, GitHub, Facebook)
* Provide OIDC Discovery endpoint
* Provide UserInfo endpoint
* Manage user sessions (create, validate, destroy)
* Link external provider identities to internal user accounts

**APIs / Interfaces:**

**Public REST Endpoints:**

1. **GET /authorize**
   * Initiates Authorization Code flow
   * Query params: `response_type=code`, `client_id`, `redirect_uri`, `scope`, `state`, `code_challenge`, `code_challenge_method`, `provider` (google|github|facebook)
   * Response: 302 redirect to external provider login
   * Errors: 400 (invalid params), 401 (unknown client)
2. **GET /callback**
   * OAuth2 callback from external provider
   * Query params: `code`, `state`
   * Response: 302 redirect to client with authorization code
   * Errors: 400 (invalid state/code), 500 (provider error)
3. **POST /token**
   * Exchanges authorization code or refresh token for access token
   * Body: `grant_type`, `code` (for authorization\_code), `refresh_token` (for refresh\_token), `client_id`, `client_secret` (confidential clients), `code_verifier` (PKCE), `redirect_uri`
   * Response: JSON with `access_token`, `refresh_token`, `token_type`, `expires_in`, `id_token` (if openid scope)
   * Errors: 400 (invalid grant), 401 (invalid client)
4. **POST /revoke**
   * Revokes refresh token
   * Body: `token`, `token_type_hint=refresh_token`, `client_id`, `client_secret`
   * Response: 200 OK
   * Errors: 400 (invalid token)
5. **GET /userinfo**
   * Returns OIDC user claims
   * Header: `Authorization: Bearer <access_token>`
   * Response: JSON with `sub`, `email`, `name`, `picture`, etc.
   * Errors: 401 (invalid token), 403 (insufficient scope)
6. **GET /.well-known/openid-configuration**
   * OIDC Discovery metadata
   * Response: JSON with `issuer`, `authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`, `jwks_uri`, `scopes_supported`, etc.
7. **GET /jwks**
   * Public keys for JWT verification
   * Response: JSON Web Key Set (JWKS)
8. **POST /logout**
   * Terminates user session
   * Body: `id_token_hint` (optional), `post_logout_redirect_uri` (optional)
   * Response: 302 redirect or 200 OK

**Versioning:** All endpoints prefixed with `/v1/` for future compatibility

**Data Owned:**

* Users (internal accounts)
* Provider identities (external account mappings)
* OAuth clients (registered applications)
* Refresh tokens (persistent)
* Sessions (Redis)
* Authorization codes (Redis)

**Design Tradeoffs:**

**Why abstraction over direct provider SDKs:**

* **Pro**: Uniform error handling, easier to add providers, testability
* **Con**: Additional code complexity
* **Decision**: Abstract provider logic into interfaces (ProviderAdapter pattern), implement Google/GitHub/Facebook adapters

**JWT vs Opaque tokens for access tokens:**

* **Choice**: JWT (self-contained)
* **Pro**: No database lookup for validation, stateless scaling
* **Con**: Cannot revoke (mitigated by short TTL: 15 minutes)
* **Decision**: JWT for access tokens, database-backed refresh tokens for revocation control

**Token signing algorithm:**

* **Choice**: RS256 (RSA signatures)
* **Pro**: Public key verification, key rotation without client updates
* **Con**: Slower than HMAC (negligible for scale)

**Failure Modes & Mitigations:**

* **External provider unavailable**: Return 503, retry with exponential backoff, cache last-known working state
* **Database connection failure**: Circuit breaker pattern, return 503, health check endpoint alerts monitoring
* **Redis unavailable**: Degrade gracefully (skip caching, direct DB reads), alert operations
* **Token validation race condition**: Use atomic operations (Redis SETNX for authorization codes)
* **Replay attack on authorization code**: Single-use codes (delete after exchange), PKCE validation

***

**Component: `Provider Adapters`**

**Purpose:** Abstraction layer for integrating with external OAuth2/OIDC providers (Google, GitHub, Facebook), normalizing provider-specific APIs into a common interface.

**Responsibilities:**

* Build provider-specific authorization URLs
* Exchange authorization codes for access tokens with providers
* Fetch user profile data from provider APIs
* Refresh provider access tokens
* Normalize provider responses into internal user model

**APIs / Interfaces:**

**Internal Interface (implemented per provider):**

```java
interface ProviderAdapter {
    String buildAuthorizationUrl(String redirectUri, String state, List<String> scopes);
    TokenResponse exchangeCode(String code, String redirectUri);
    UserProfile getUserProfile(String accessToken);
    TokenResponse refreshToken(String refreshToken);
}
```

**Data Owned:**

* None (stateless transformation layer)

**Design Tradeoffs:**

**Adapter pattern vs unified SDK:**

* **Choice**: Adapter pattern with provider-specific implementations
* **Pro**: Clear separation, easy to test, incremental provider support
* **Con**: Code duplication across adapters
* **Decision**: Accept duplication for clarity and maintainability in MVP

**Failure Modes & Mitigations:**

* **Provider API changes**: Version-specific adapters, automated integration tests
* **Rate limiting by provider**: Exponential backoff, queue requests, notify user of delay
* **Inconsistent provider data**: Schema validation, default values for missing fields

***

**Component: `Token Manager`**

**Purpose:** Handles lifecycle of internal tokens (access, refresh, ID tokens), including generation, validation, and revocation.

**Responsibilities:**

* Generate JWT access tokens with claims (sub, scope, exp, iat, iss)
* Generate OIDC ID tokens with user claims
* Generate cryptographically secure refresh tokens
* Validate JWT signatures and expiration
* Store refresh tokens in database
* Revoke refresh tokens
* Rotate signing keys (manual in MVP, automated in future)

**APIs / Interfaces:**

**Internal methods:**

* `generateAccessToken(userId, clientId, scope) -> JWT`
* `generateIdToken(userId, nonce) -> JWT`
* `generateRefreshToken(userId, clientId, scope) -> String`
* `validateAccessToken(jwt) -> Claims`
* `revokeRefreshToken(token) -> boolean`

**Data Owned:**

* Refresh tokens (PostgreSQL)
* Signing keys (Secrets Manager)

**Design Tradeoffs:**

**Key rotation strategy:**

* **Choice**: Manual rotation for MVP, prepare for automated rotation
* **Pro**: Simplicity in MVP
* **Con**: Operational burden, security risk if delayed
* **Future**: Automated monthly rotation with grace period for old keys

**Refresh token storage:**

* **Choice**: Hashed tokens in PostgreSQL
* **Pro**: Token theft requires database breach + hash cracking
* **Con**: Database dependency for validation
* **Decision**: Security over performance for refresh tokens

**Failure Modes & Mitigations:**

* **Key compromise**: Immediate rotation, revoke all tokens, notify users
* **Clock skew**: Allow 5-minute clock drift tolerance in JWT validation
* **Database write failure on refresh token storage**: Retry with idempotency key, return 503 if persistent

***

**Component: `Session Manager`**

**Purpose:** Manages user session lifecycle, including creation, validation, and termination.

**Responsibilities:**

* Create sessions after successful authentication
* Store sessions in Redis with TTL
* Validate active sessions
* Extend session TTL on activity (sliding window)
* Terminate sessions on logout
* Clean up expired sessions

**APIs / Interfaces:**

**Internal methods:**

* `createSession(userId, clientId, scope, ipAddress) -> sessionId`
* `getSession(sessionId) -> Session`
* `extendSession(sessionId) -> boolean`
* `terminateSession(sessionId) -> boolean`

**Data Owned:**

* Sessions (Redis)

**Design Tradeoffs:**

**Session storage:**

* **Choice**: Redis with TTL
* **Pro**: Fast reads, automatic expiry, reduces database load
* **Con**: Loss of session data if Redis fails (mitigated by Redis persistence)
* **Decision**: Redis for performance, PostgreSQL fallback for critical failure

**Session duration:**

* **Choice**: 24-hour TTL with sliding window (extends on activity)
* **Pro**: Balance security and UX
* **Con**: Long sessions increase hijack risk
* **Mitigation**: Implement IP address validation, user-agent fingerprinting

**Failure Modes & Mitigations:**

* **Redis unavailable**: Fallback to database sessions (slower), alert operations
* **Session hijacking**: Bind sessions to IP + user-agent (with fingerprint), detect suspicious activity patterns

***

#### 5. API Design

**Authentication Flow Examples**

**Authorization Code Flow with PKCE (SPA/Mobile):**

1. Client generates `code_verifier` and `code_challenge`
2. Client redirects user to `/authorize?response_type=code&client_id=xxx&redirect_uri=https://client/callback&scope=openid+profile+email&state=random&code_challenge=yyy&code_challenge_method=S256&provider=google`
3. Service redirects to Google OAuth
4. User authenticates with Google, consents
5. Google redirects to `/callback?code=abc&state=random`
6. Service validates state, exchanges Google code for tokens
7. Service creates/links user account, generates authorization code
8. Service redirects to `https://client/callback?code=xyz&state=random`
9. Client POSTs to `/token` with `grant_type=authorization_code&code=xyz&redirect_uri=https://client/callback&client_id=xxx&code_verifier=zzz`
10. Service validates PKCE, returns `access_token`, `refresh_token`, `id_token`

**Client Credentials Flow (Service-to-Service):**

1. Service POSTs to `/token` with `grant_type=client_credentials&client_id=xxx&client_secret=yyy&scope=api.read`
2. Service validates credentials, returns `access_token` (no refresh token)

**Refresh Token Flow:**

1. Client POSTs to `/token` with `grant_type=refresh_token&refresh_token=zzz&client_id=xxx&client_secret=yyy` (if confidential client)
2. Service validates refresh token, returns new `access_token` (optionally rotates refresh token)

**API Conventions**

* **Base URL**: `https://auth.example.com/v1`
* **Content-Type**: `application/json` for POST bodies (except `/token` uses `application/x-www-form-urlencoded` per OAuth2 spec)
* **Authentication**: Bearer tokens in `Authorization` header
*   **Error format** (RFC 6749 compliant):

    ```json
    {  "error": "invalid_request",  "error_description": "Missing required parameter: code_verifier",  "error_uri": "https://docs.example.com/errors/invalid_request"}
    ```
* **Rate limiting headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

***

#### 6. Observability

**Strategy**

Distributed tracing with correlation IDs propagated through all service calls to track end-to-end authentication flows. Structured logging for debugging, metrics for operational insights, and alerting for proactive incident response.

**Data to carry in logs:**

* `correlation_id`: UUID generated at API Gateway, passed to all downstream services
* `request_id`: Unique per API request
* `user_id`: Internal user ID (if authenticated)
* `client_id`: OAuth client application ID
* `provider`: External identity provider (google, github, etc.)
* `ip_address`: Client IP for security analysis
* `timestamp`: ISO 8601 format with timezone
* `duration_ms`: Request processing time

**Logging**

**Format**: Structured JSON logs for machine parsing

**Example log entry:**

```json
{
  "timestamp": "2025-12-01T10:30:45.123Z",
  "level": "INFO",
  "service": "authentication-service",
  "correlation_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "request_id": "req-xyz123",
  "user_id": "user-uuid",
  "client_id": "client-uuid",
  "provider": "google",
  "ip_address": "192.168.1.1",
  "action": "token_exchange",
  "duration_ms": 345,
  "message": "Successfully exchanged authorization code for access token"
}
```

**Log levels:**

* ERROR: Failed operations requiring immediate attention (provider errors, database failures)
* WARN: Recoverable issues (rate limit approaching, token near expiry)
* INFO: Successful operations (user login, token issued)
* DEBUG: Detailed flow information (disabled in production)

**Sensitive data handling:**

* NEVER log tokens, secrets, passwords, authorization codes
* Hash or redact user emails/IPs in compliance with privacy requirements

**Metrics**

**Key metrics per service:**

**Authentication Service:**

* `auth_requests_total` (counter): Total authentication requests by provider, status
* `auth_request_duration_seconds` (histogram): Latency distribution (p50, p95, p99)
* `token_issued_total` (counter): Tokens issued by grant type
* `token_refresh_total` (counter): Refresh token usage
* `provider_api_calls_total` (counter): External provider API calls by provider, endpoint
* `provider_api_errors_total` (counter): Provider API failures by provider, error type
* `active_sessions_total` (gauge): Current active user sessions
* `redis_connection_errors_total` (counter): Cache layer failures
* `database_query_duration_seconds` (histogram): Database operation latency

**API Gateway:**

* `gateway_requests_total` (counter): Total requests by endpoint, status code
* `gateway_request_duration_seconds` (histogram): Gateway latency
* `rate_limit_exceeded_total` (counter): Rate limit violations by IP

**Target SLIs:**

* P95 latency < 500ms for complete auth flows
* P95 latency < 100ms for token operations
* Error rate < 1% (excluding user errors like invalid credentials)
* Availability > 99.5%

**Exporters**: Prometheus exposition format at `/metrics` endpoint, OpenTelemetry collector for future extensibility

**Tracing**

**Implementation**: OpenTelemetry with Jaeger backend

**Trace structure:**

* Root span: API Gateway request
* Child spans: Authentication Service operations (provider call, database query, token generation)
* Grandchild spans: External provider HTTP calls

**Trace attributes:**

* Standard: `http.method`, `http.status_code`, `http.url`
* Custom: `user_id`, `client_id`, `provider`, `grant_type`

**Sampling policy**:

* 100% sampling for MVP (low traffic volume)
* Future: Adaptive sampling (100% errors, 10% success) or tail-based sampling

**Trace retention**: 7 days for debugging recent issues

***

### Appendix

#### Security Considerations

* All communication over HTTPS (TLS 1.3)
* PKCE mandatory for public clients
* Refresh tokens single-use (rotate on use) for high-security clients
* Rate limiting: 100 req/min per IP on auth endpoints, 10 req/min on token endpoint
* Input validation on all endpoints (max length, allowed characters)
* SQL injection prevention via prepared statements
* XSS prevention: no user input rendered in HTML responses
* CSRF protection via state parameter in OAuth flows
* Token binding (optional future): bind tokens to TLS client certificates

#### Deployment Architecture

* Kubernetes cluster with 3 replicas of Authentication Service (horizontal scaling)
* PostgreSQL RDS with Multi-AZ for HA
* Redis Cluster (3 nodes) with persistence enabled
* API Gateway: Nginx/Kong with 2+ instances behind load balancer
* Secret rotation via CI/CD pipeline (manual trigger in MVP)

#### Future Enhancements

* Multi-factor authentication (TOTP, SMS)
* Passwordless authentication (WebAuthn, magic links)
* Consent management UI for granular scope approval
* Admin dashboard for user/client management
* Advanced session management (concurrent session limits, device tracking)
* Risk-based authentication (IP reputation, device fingerprinting)
* SAML 2.0 support for enterprise SSO
* Dynamic client registration (RFC 7591)
