# Staleness Report: Google Spanner Internals
**Source:** /home/koala/Work/gitbook/dist/database/deep-dives/spanner.md
**Checked:** 2026-06-07 10:30

## Summary
This page is **partially stale**. The core internals (TrueTime, Paxos per shard, directory-based sharding, interleaved tables, 2PC, schema changes) remain accurate and well-explained. However, the page misses **several major new features released in 2025-2026** that fundamentally expand what Spanner can do — notably Spanner Graph, the Columnar Engine, Vector Index/ANN, AI functions in SQL, optimistic concurrency control, and repeatable read isolation. The CockroachDB comparison table is also **significantly outdated** (CockroachDB is now on v26.x with major changes since that comparison was drafted).

## What's Still Accurate
- **TrueTime description** — ε = 1–7ms uncertainty, commit wait, external consistency — all correct and well explained.
- **Directory-based sharding** — directories as contiguous key ranges, the unit of placement/replication — still accurate.
- **Interleaved tables** — physical colocation of parent-child tables for single-Paxos-group transactions — still core to Spanner schema design.
- **Paxos per shard** — leader/follower model across datacenters — still accurate.
- **2PC for cross-shard transactions** — coordinator/participant model with Paxos group handling coordinator failure — still accurate.
- **Schema change process** — non-blocking multi-phase (Start → Prepare → Apply → Broadcast) — still accurate.
- **Read-write vs read-only vs snapshot read transaction breakdown** — still accurate.
- **Performance characteristics table** (point reads 1–5ms, writes 10–50ms, etc.) — still in the right ballpark.

## Potential Updates Needed

### 1. Spanner Graph (major missing feature)
- **What's new:** Spanner now supports property graph queries using GQL/ISO Graph Query Language standard. As of May 2026, it includes built-in graph algorithms (fraud detection, entity resolution, recommendations) and factorized execution for optimization. Visual schema modeling is available in Preview.
- **Source:** https://cloud.google.com/spanner/docs/release-notes (May 27, 2026; May 18, 2026; April 20, 2026)
- **Priority:** High — completely new capability not mentioned at all.

### 2. Columnar Engine (major missing feature)
- **What's new:** GA since April 2026 (PostgreSQL dialect) and earlier for GoogleSQL. Speeds up analytical scans up to 200× on live operational data without affecting transactional workloads. Includes major compaction API and vectorized execution.
- **Source:** https://cloud.google.com/spanner/docs/columnar-engine (April 17, 2026 GA announcement)
- **Priority:** High — transforms Spanner's analytical capabilities.

### 3. Vector Index & Approximate Nearest Neighbor (ANN)
- **What's new:** Vector indexes and ANN distance functions are GA for PostgreSQL-dialect databases (May 2026). Enables semantic search and AI/ML workloads natively in Spanner.
- **Source:** https://cloud.google.com/spanner/docs/vector-indexes (May 4, 2026)
- **Priority:** High — major new workload type.

### 4. AI Functions in SQL
- **What's new:** `AI.CLASSIFY`, `AI.IF`, `AI.SCORE` functions (March 2026) that run LLM operations directly in SQL queries for classification, evaluation, and ranking.
- **Source:** https://cloud.google.com/spanner/docs/reference/standard-sql/ml-functions (March 19, 2026)
- **Priority:** Medium — important for ML/AI integration patterns.

### 5. Optimistic Concurrency Control
- **What's new:** Spanner now supports optimistic concurrency control (March 2026) for low-contention workloads, as an alternative to the pessimistic locking described in this page. Reads/queries within a read-write transaction proceed without acquiring locks.
- **Source:** https://cloud.google.com/spanner/docs/concurrency-control (March 10, 2026)
- **Priority:** Medium — the page only describes pessimistic locking with wound-wait.

### 6. Repeatable Read Isolation
- **What's new:** GA since April 2026. Reduces latency and transaction failure rates for read-heavy workloads with fewer writes. A new isolation level between snapshot read and serializable.
- **Source:** https://cloud.google.com/spanner/docs/isolation-levels#repeatable-read (April 17, 2026)
- **Priority:** Medium — fills a gap in the isolation/transaction discussion.

### 7. Full-Text Search
- **What's new:** Dedicated search indexes with `SEARCH`, `SCORE`, `SNIPPET` functions, custom dictionaries (April 2026), pattern matching acceleration for `LIKE`/`STARTS_WITH`/`REGEXP_CONTAINS`, substring search with emoji support.
- **Source:** https://cloud.google.com/spanner/docs/full-text-search (January 13, 2026; April 21, 2026)
- **Priority:** Medium — useful capability, especially for text-heavy applications.

### 8. New SQL Features
- **What's new:** `ON CONFLICT DO NOTHING/UPDATE` for upsert semantics (March 2026); UUID data type (January 2026); `ON UPDATE` clause for auto-updating timestamps (February 2026); `GENERATE_SERIES` for PostgreSQL; `ZSTD_COMPRESS`/`ZSTD_DECOMPRESS` functions (January 2026).
- **Source:** Various release notes, Jan–Mar 2026
- **Priority:** Low–Medium — incremental SQL improvements worth noting in a reference.

### 9. Query Optimizer v8
- **What's new:** Version 8 became the default in November 2025. May affect query planning behavior for existing workloads.
- **Source:** https://cloud.google.com/spanner/docs/query-optimizer/versions (November 20, 2025)
- **Priority:** Low — minor, but could matter if someone is troubleshooting performance.

### 10. Managed Autoscaler
- **What's new:** Spanner can now automatically add/remove compute capacity based on total CPU utilization targets (February 2026). Includes support for instance partitions (Preview).
- **Source:** https://cloud.google.com/spanner/docs/managed-autoscaler (February 25, 2026)
- **Priority:** Low — operational feature, not core internals.

### 11. CockroachDB Comparison Table — Outdated
- **CockroachDB version:** The comparison implies an old CockroachDB release. Current CockroachDB is at **v26.2** (calendar versioning). Key changes not reflected:
  - Uses "leader leases" (combining Raft leader and leaseholder roles).
  - Pebble storage engine has had significant performance improvements.
  - CockroachDB now offers Serverless and Standard/Basic/Advanced cluster tiers.
  - CockroachDB's clock skew tolerance is still 500ms, but operational mitigations have improved.
  - "Unavailable during clock skew > 500ms" is still technically true but with better monitoring and alerts.
  - Should also note: both Spanner and CockroachDB now support PostgreSQL wire protocol.
- **Priority:** Medium — the comparison table is likely to be read by decision-makers and could mislead.

### 12. MCP Server & AI Agent Integration
- **What's new:** Spanner has a native MCP server for LLM/AI agent interaction (GA April 2026). Also has a Database Insights MCP server for performance analysis.
- **Source:** https://cloud.google.com/spanner/docs/use-spanner-mcp (April 20, 2026)
- **Priority:** Low — niche but cutting-edge.

### 13. Data Boost
- **What's new:** Data Boost allows running analytical queries and data exports with near-zero impact on transactional workloads by using separate resources. Includes milli-operation granularity quotas.
- **Source:** https://cloud.google.com/spanner/docs/databoost/databoost-overview (December 11, 2025)
- **Priority:** Low–Medium — relevant for operational patterns.

## Suggested Next Actions

1. **Add a new section on Spanner Graph** — this is the single biggest missing capability. Cover graph schema modeling, GQL queries, built-in graph algorithms, and use cases (fraud detection, recommendations).

2. **Add a section on the Columnar Engine** — explain how it enables HTAP (hybrid transactional/analytical processing) workloads, how it differs from the standard row-based storage, and the 200× speedup claim for scans.

3. **Update the Transaction Types section** — add Optimistic Concurrency Control and Repeatable Read isolation alongside the existing pessimistic locking description.

4. **Add Vector Indexes and ANN search** — cover semantic search workloads and how Spanner now competes with dedicated vector databases for some use cases.

5. **Mention AI functions** (`AI.CLASSIFY`, `AI.IF`, `AI.SCORE`) briefly as an example of Spanner's evolving SQL capabilities.

6. **Revise the CockroachDB comparison table** — update CockroachDB version to current (v26.x), add rows for PostgreSQL compatibility, CDC changefeeds, serverless deployment options. Consider whether the comparison belongs in a deep-dive internals page or should be a separate document.

7. **Add a brief "Recent Developments" callout** at the end summarizing features added since the page was written (Graph, Columnar Engine, Vector Index, AI functions) with links to official docs.
