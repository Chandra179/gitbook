# Rate Limit

Before building, we must define the boundaries of the system:

* Support from 1,000 to 1,000,000+ concurrent users.
* Direction:
  * Inbound: Protecting our public APIs from users.
  * Outbound: Throttling calls to external 3rd party APIs to avoid contract violations.
* Differentiation between Free and Paid users (tiered limits).
* Unique identification via `user_id`, `API_key`, or `IP_address`.

#### Multi-Layer Architecture

We use a "Defense in Depth" strategy by placing limits at different levels:

<table><thead><tr><th width="186.20001220703125">Layer</th><th>Implementation</th><th>Purpose</th></tr></thead><tbody><tr><td>Infrastructure (L7)</td><td>Kubernetes Ingress / Nginx / WAF</td><td>IP-based limiting and DDoS protection.</td></tr><tr><td>Application Layer</td><td>Domain Service or Independent Service</td><td>Business logic limits (e.g., Tiered access, $10M caps).</td></tr></tbody></table>

**Integrated (Domain Service)**: Logic resides within the service. Lower latency, simpler deployment, but harder to share limits across different services.

**Independent Service**: High complexity and latency (extra network hop), but provides a centralized "Global" view of user activity.

#### Data Storage & Consistency

Storage: Distributed cache (Redis) is the primary store.

Schema: Key-Value pair where Key = `{user_id}:{operation}` and Value = `{count, ttl}`.

Consistency:&#x20;

* Strong Consistency: Required for critical data (e.g., financial withdrawals). Handled at the application level using atomic operations (Redis Lua scripts).
* Eventual Consistency: Acceptable for general API throttling to reduce latency.

#### Traffic & Reliability Strategies

To handle massive spikes and system failures, we implement the following:

**Thundering Herd Protection**: When returning a `429 Too Many Requests` error, add a Random Delay (Jitter) of 1–2 seconds to the `Retry-After` header. This prevents a million users from retrying at the exact same millisecond
