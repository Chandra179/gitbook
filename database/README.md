# Database

Comprehensive reference on database internals: taxonomy, indexing, storage engines, core algorithms, transaction concurrency, scaling, and deep dives into distributed databases.

## Files

### Overview

- [taxonomy.md](./taxonomy.md) — Database type classification: SQL, NoSQL, Document, Key-Value, Wide-Column, Graph, Object, Time-Series, NewSQL
- [indexing.md](./indexing.md) — Index fundamentals, B+Tree structure, composite index rules, per-engine indexing (PostgreSQL, SQL Server, MongoDB, Cassandra, Redis)
- [storage-engines.md](./storage-engines.md) — B-Tree, LSM-Tree, and Heap storage structures with comparison table, anatomy, search/insert algorithms, and on-disk file layout
- [algorithms.md](./algorithms.md) — Cross-cutting algorithms: MVCC, Write-Ahead Log, Merkle Trees, Bloom Filters (with pseudocode)
- [concurrency-and-scaling.md](./concurrency-and-scaling.md) — Transactions, isolation, locking, replication, scaling, distributed transactions, distributed consensus (Raft, Paxos, VSR), gossip protocol, consistent hashing
- [query-and-optimization.md](./query-and-optimization.md) — Query pipeline, scan methods, join algorithms, parallel execution, cost estimation
- [specialized-databases.md](./specialized-databases.md) — Vector databases (pgvector, Pinecone, Milvus), Search engines (Elasticsearch), Embedded (SQLite, DuckDB), Streaming, Time-Series internals
- [operations-and-patterns.md](./operations-and-patterns.md) — Caching strategies, backup & recovery, data warehousing, migration patterns, connection pooling

### Deep Dives (per database)

- [deep-dives/postgresql.md](./deep-dives/postgresql.md) — Heap storage, MVCC, WAL, indexes, query execution, replication, performance tuning
- [deep-dives/mongodb.md](./deep-dives/mongodb.md) — WiredTiger engine, document model, aggregation, indexes, replica sets, sharding, change streams
- [deep-dives/redis.md](./deep-dives/redis.md) — Data structures & encodings, persistence, replication, cluster, eviction, transactions
- [deep-dives/cassandra.md](./deep-dives/cassandra.md) — SSTable structure, compaction, bloom filters, read/write paths, gossip, repair, LWTs
- [deep-dives/spanner.md](./deep-dives/spanner.md) — TrueTime, Paxos per shard, directory-based sharding, interleaved tables, 2PC, F1 SQL
