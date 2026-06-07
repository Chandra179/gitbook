# Staleness Report: Redis Internals
**Source:** /home/koala/Work/gitbook/dist/database/deep-dives/redis.md
**Checked:** 2026-06-06 11:45 UTC

## Summary
This page is **partially stale**. Its core architectural coverage (single-threaded command processing, persistence, replication, cluster, eviction) remains largely accurate, but several structural internals and feature listings are outdated to the point of being misleading. The page describes internal encodings that were replaced in Redis 7.0 (2022), omits the I/O threading layer added in Redis 6.0, misses the new Array data type from Redis 8.8 (released 2 weeks ago), and makes no mention of the Redis→Valkey fork (2024), which is a significant ecosystem change. The page appears to document an ~Redis 6.x-era codebase.

## What's Still Accurate
- **Single-threaded command execution model** — the main event loop still processes all commands sequentially on one thread. No race conditions, no locking overhead for data structures.
- **I/O multiplexing (epoll/kqueue)** — still how Redis handles many concurrent connections.
- **RDB persistence** (SAVE, BGSAVE, fork+cow) — unchanged in fundamentals.
- **AOF persistence** (fsync policies, rewrite via BGREWRITEAOF) — still accurate.
- **RDB+AOF hybrid persistence** — still works since Redis 4.0.
- **Replication (PSYNC2)** — partial resync still works as described.
- **Cluster (hash slots, gossip protocol, MOVED/ASK redirect, failover)** — all still accurate.
- **Eviction policies** (LRU/LFU/TTL sampling) — still correct.
- **MULTI/EXEC transactions & Lua scripting via EVAL** — still the same mechanism.
- **Memory overhead approximations** — in the right ballpark (though exact byte counts vary by version/allocator).
- **Streams (consumer groups, PEL, MAXLEN, range queries)** — core concepts unchanged; XNACK is a new addition.

## Potential Updates Needed

### 1. I/O Threading (Missing major feature since Redis 6.0)
The page presents Redis as purely single-threaded, but since Redis 6.0 (2020) Redis supports **I/O threads** (`io-threads` config) that handle reading from/writing to client sockets in parallel. The main command-processing thread remains single-threaded, so data structures still have no race conditions, but the page's blanket "single-threaded" claim misses a critical performance feature. This is a major omission for any internals page.

### 2. Internal encodings — ziplist replaced by listpack (Redis 7.0)
The page repeatedly references `ziplist` as the current encoding for List nodes (quicklist), Hash, and Sorted Set. Since Redis 7.0 (April 2022), **listpack** replaced ziplist as the compact encoding in:
- **quicklist nodes** (List) — now use listpack, not ziplist
- **Hash** — small hashes use listpack instead of ziplist
- **Sorted Set** — small sorted sets use listpack instead of ziplist

The `embstr`/`raw`/`int` string encodings remain unchanged.

### 3. New Array data type (Redis 8.8 — released May 25, 2026)
Redis 8.8 introduced a **native Array data type** (contributed by @antirez). The page lists "11 data types" but doesn't enumerate them clearly; the list needs updating to include Array as a first-class type with its own encoding and operations. The new type is likely optimized with listpack encoding for small arrays.

Source: https://github.com/redis/redis/releases/tag/8.8.0

### 4. New commands missing
- **INCREX** (Redis 8.8) — window counter rate limiter combining INCR/INCRBY/INCRBYFLOAT with bounds and expiration. Relevant to anyone using Redis for rate limiting.
- **XNACK** (Redis 8.8) — allow consumers to explicitly release pending messages in a stream. Extends the Streams section meaningfully.
- Various other new commands from Redis 7.x–8.x.

### 5. Redis Licensing change (March 2024) — ecosystem shift
In March 2024, Redis Ltd. changed the open-source license from BSD 3-Clause to a dual license (RSALv2 + SSPL). This is not a technical internals issue, but given this is a "deep dive" page, readers should be aware of the licensing change and the existence of the **Valkey** fork (Linux Foundation, BSD-3-Clause licensed, latest release: **9.1.0**, May 19, 2026). Many Linux distributions have packaged Valkey instead of Redis OSS. The page should at minimum note this in a sidebar or introduction.

Source: https://github.com/valkey-io/valkey/releases/tag/9.1.0

### 6. Version numbers and context
The page references "Redis 3.2" (quicklist introduction) and "Redis 4.0+" (hybrid persistence, PSYNC2, LFU) as the ceiling, implying the content may be 5–10 years behind. A version note at the top ("this page reflects Redis 6.x internals; check latest versions for changes") would set reader expectations.

### 7. Redis 8.x vector database / search capabilities
The page doesn't cover that Redis now has native vector database functionality (through the Search/JSON modules, which are bundled with Redis Stack / Redis OSS 8.x). FT.HYBRID with KNN, vector search, and the VADD/VSET commands are all missing. These are increasingly relevant given the AI/embeddings trend.

### 8. Performance numbers
The throughput table (100K–200K ops/sec) is conservative for modern hardware. With I/O threading and modern CPU/RAM, Redis on a single node can push **500K–1M+ ops/sec** for simple GET/SET. The numbers should be annotated as "per single-threaded core" or updated.

## Suggested Next Actions
1. **Add an I/O Threading section** — explain `io-threads` config, that command execution is still single-threaded but network I/O is parallelized.
2. **Update all internal encoding sections** — replace `ziplist` → `listpack` for quicklist, hash, and sorted set compact encodings.
3. **Add Array data type** — new type in Redis 8.8 with its own operations section.
4. **Update Streams section** — add XNACK command for releasing pending messages.
5. **Add a note about Redis licensing & the Valkey fork** — at the top of the page, noting the 2024 shift and that Valkey (9.1.0) is the fully open-source continuation under BSD-3-Clause.
6. **Increase the version ceiling** — reference "Redis 8.8" as current GA, not "Redis 4.0+".
7. **Add a Vector/Search capabilities section** — brief coverage of vector similarity search (FT.SEARCH, FT.HYBRID, VADD) as a major modern Redis use case.
8. **Annotate the performance table** — clarify the numbers are per-core, and note that IO-threads dramatically improve throughput on multi-core machines.
