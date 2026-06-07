# Staleness Report: MongoDB Internals
**Source:** /home/koala/Work/gitbook/dist/database/deep-dives/mongodb.md
**Checked:** 2026-06-07 12:30

## Summary

This page is **partially stale**. It covers core MongoDB concepts (WiredTiger, document model, CRUD, indexes, replica sets, sharding, change streams, consistency) accurately at a conceptual level, but the version references and several key defaults are significantly outdated. The page references MongoDB 3.2, 4.0, and 4.2 as recent/current — while the actual current stable release is **MongoDB 8.3** (released December 2025). Several defaults have changed, major new features are missing, and the page lacks coverage of the past 4 major version lines (5.0 through 8.3).

## What's Still Accurate

- **WiredTiger as default storage engine** — still correct, and the B-Tree vs LSM mode descriptions are accurate.
- **B-Tree page-level compression** (Snappy/Zlib/Zstd) and the cache/checkpoint/journal architecture — all still accurate.
- **Document model** (BSON, 16MB limit, dynamic schema, JSON Schema validation) — all still correct.
- **CRUD operations and update operators** — the listed operations (`$set`, `$push`, `$inc`, etc.) continue to work identically.
- **Aggregation pipeline stages** — `$match`, `$project`, `$group`, `$sort`, `$lookup`, `$unwind`, `$bucket`, `$facet` are all still current.
- **Pipeline optimization** (stage reordering, projection coalescing, early `$limit` insertion) — still accurate.
- **Index types** (`_id`, single, compound, multikey, text, geospatial, hashed, TTL, wildcard) — all still correct.
- **ESR rule** (Equality-Sort-Range) for compound index design — still best practice.
- **Replica set architecture** (primary, secondary, arbiter, oplog, elections, rollbacks) — all still accurate at a high level.
- **Sharding model** (mongos routers, config servers, shards, chunks, balancer) — still the same architecture.
- **Change streams** basics (oplog-based, resume tokens) — still accurate.
- **Consistency model** (single-document strong consistency, multi-document transactions, causal consistency) — still correct.

## Potential Updates Needed

1. **Version references are 6+ years old** — The page says "since MongoDB 3.2" (2015), "MongoDB 4.0" (2018), and "MongoDB 4.2" (2019). The current version is **MongoDB 8.3** (Dec 2025). These should be updated to put the features in proper historical context, and a "What's New Since 4.2" section would be valuable. ([MongoDB Release Notes](https://www.mongodb.com/docs/manual/release-notes/))

2. **Default write concern is now `w:majority`** — The page mentions `w:1` as default without noting that since **MongoDB 5.0** (2021), the default write concern was elevated to `w:majority`. This is a significant change that affects durability guarantees. ([Source: Jepsen analysis confirmed in MongoDB 5.0 release](https://www.mongodb.com/docs/manual/reference/write-concern/))

3. **Default chunk size may have changed** — The page states default chunk size as 64MB. In MongoDB 7.0+, the default chunk size became configurable in more granular ways. Also, `numInitialChunks` option was **removed in MongoDB 7.2** — the server now auto-creates chunks on every shard for hashed sharding. ([MongoDB 8.0 release notes](https://www.mongodb.com/docs/manual/release-notes/8.0/))

4. **WiredTiger cache size formula** — The page says default is "50% of (RAM - 1GB) or 256MB". While this was correct for a long time, the formula has been refined in newer versions and now has a more nuanced calculation depending on deployment type. The 60-second checkpoint interval also changed to be more adaptive in recent versions.

5. **Missing: Unsharding support** — Since **MongoDB 8.0**, you can unshard collections and move unsharded collections between shards. This is a major new capability not covered. ([MongoDB 8.0 release notes](https://www.mongodb.com/docs/manual/release-notes/8.0/))

6. **Missing: Change Streams pre-images** — Since **MongoDB 6.0**, change streams support pre-images (document state before the change). The page doesn't mention this or the `fullDocument: "required"` / `fullDocumentBeforeChange` options. ([MongoDB 6.0 release notes](https://www.mongodb.com/docs/manual/release-notes/6.0/))

7. **Missing: Time Series Collections** — MongoDB added native time-series collections in **MongoDB 5.0** (GA in 5.1) with columnar compression. This is a significant feature category completely absent from the page.

8. **Missing: Atlas Search and Vector Search** — MongoDB has invested heavily in **Atlas Search** (Lucene-based) and **Vector Search** (for AI/embeddings). While these are Atlas-specific, they represent a major direction for the product.

9. **Missing: Queryable Encryption** — MongoDB 7.0 introduced **Queryable Encryption** (range queries on encrypted data). The page only mentions basic in-use encryption. ([MongoDB 7.0 release notes](https://www.mongodb.com/docs/manual/release-notes/7.0/))

10. **Ingress Queue (admission control)** — **MongoDB 8.0** introduced an ingress queue for admission control to limit concurrent operations. This is relevant for the performance characteristics section. ([MongoDB 8.0 release notes](https://www.mongodb.com/docs/manual/release-notes/8.0/))

11. **OCSF Schema for Audit Logs** — Since **MongoDB 8.0**, audit logs can use the OCSF schema for standardized log format.

12. **`queryHash` deprecated → `planCacheShapeHash`** — In **MongoDB 8.0**, `queryHash` was deprecated in favor of `planCacheShapeHash`. The page doesn't mention query hashing at all.

13. **"MongoBleed" security exploit (Dec 2025)** — A major MongoDB exploit ("MongoBleed") was discovered in December 2025, leading to many compromised servers. Any security section should reference this event and mitigations. ([Wikipedia](https://en.wikipedia.org/wiki/MongoDB))

14. **Kernel 6.19 incompatibility** — MongoDB 8.0+ has a known incompatibility with Linux kernel 6.19 that can cause crashes on startup due to TCMalloc issues.

15. **Performance characteristics estimates** — The latency/throughput table (p99: 1-5ms for point reads, etc.) was likely written for older versions. MongoDB 7.0+ and 8.0+ introduced significant performance improvements; these numbers should be re-evaluated.

16. **Journal file size changed?** — The page says journal files are 100MB per file. This default may have changed in newer versions to be more adaptive.

17. **Read concern "snapshot" on capped collections** — Since **MongoDB 8.0**, read concern "snapshot" now works on capped collections. The page's consistency section doesn't mention this.

18. **Majority write concern performance improvement** — MongoDB 8.0 changed majority writes to acknowledge when the majority has *written the oplog entry* (not applied it), improving performance. This changes the semantics vs. older versions. ([MongoDB 8.0 release notes](https://www.mongodb.com/docs/manual/release-notes/8.0/))

19. **Default write concern `w:majority` is now the default since MongoDB 5.0**, which contradicts the page's implication that `w:1` is default.

20. **Missing: `$lookup` improvements** — The aggregation `$lookup` stage has been significantly optimized in recent versions, including allowing `$lookup` within transactions targeting sharded collections (MongoDB 7.0+). 

## Suggested Next Actions

1. **Rewrite the version context section** — Replace "since MongoDB 3.2" / "MongoDB 4.0" / "MongoDB 4.2" with a clear timeline showing what was introduced when. Add a note that current stable is **8.3** (as of Dec 2025).

2. **Update default write concern** — Change the Journal/WAL section to note that `w:majority` has been the default since MongoDB 5.0, and explain the 8.0 improvement to majority write acknowledgment semantics.

3. **Add a Time Series Collections section** — This is a major feature category that deserves its own subsection.

4. **Add a "What's New Since 4.2" appendix or update the version footnotes** through each major version (5.0, 6.0, 7.0, 8.0, 8.2, 8.3) with the most impactful changes.

5. **Update performance estimates** — If possible, source current benchmarks from the MongoDB performance team's published numbers for 8.0+.

6. **Add sharding improvements** — Cover unsharding (8.0), move unsharded collections, and the removal of `numInitialChunks`.

7. **Add Change Streams pre-images** — Cover the `fullDocumentBeforeChange` option available since MongoDB 6.0.

8. **Update security section** — Add Queryable Encryption (7.0), OCSF audit schema (8.0), and note the MongoBleed incident (Dec 2025).

9. **Add ingress queue and admission control** — Mention the new ingress queue in MongoDB 8.0 for the performance characteristics section.
