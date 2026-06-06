# Database

Comprehensive reference on database internals: taxonomy, indexing, storage engines, core algorithms, transaction concurrency, scaling, and deep dives into distributed databases.

## Files

### Overview

- [taxonomy-and-indexing.md](./taxonomy-and-indexing.md) — Database types (SQL, NoSQL, Wide-Column, Document, Key-Value, Graph, Object, Time-Series, NewSQL) and per-DB indexing mechanisms (B+Tree, LSM, Hash, Inverted, GiST, GIN, BRIN, Bloom Filters)
- [storage-and-algorithms.md](./storage-and-algorithms.md) — Storage engines (InnoDB, PostgreSQL Heap, SQL Server, WiredTiger, RocksDB) and core algorithms (B+Tree, LSM-Tree, MVCC, WAL, Consensus, Gossip, Consistent Hashing, Merkle Trees, Bloom Filters)
- [concurrency-and-scaling.md](./concurrency-and-scaling.md) — Transactions, isolation, locking, performance, replication, scaling, distributed transactions
- [query-and-optimization.md](./query-and-optimization.md) — Query pipeline, scan methods, join algorithms, parallel execution, cost estimation
- [specialized-databases.md](./specialized-databases.md) — Vector databases (pgvector, Pinecone, Milvus), Search engines (Elasticsearch), Embedded (SQLite, DuckDB), Streaming, Time-Series internals
- [operations-and-patterns.md](./operations-and-patterns.md) — Caching strategies, backup & recovery, data warehousing, migration patterns, connection pooling

### Deep Dives (per database)

- [deep-dives/postgresql.md](./deep-dives/postgresql.md) — Heap storage, MVCC, WAL, indexes, query execution, replication, performance tuning
- [deep-dives/mongodb.md](./deep-dives/mongodb.md) — WiredTiger engine, document model, aggregation, indexes, replica sets, sharding, change streams
- [deep-dives/redis.md](./deep-dives/redis.md) — Data structures & encodings, persistence, replication, cluster, eviction, transactions
- [deep-dives/cassandra.md](./deep-dives/cassandra.md) — SSTable structure, compaction, bloom filters, read/write paths, gossip, repair, LWTs
- [deep-dives/spanner.md](./deep-dives/spanner.md) — TrueTime, Paxos per shard, directory-based sharding, interleaved tables, 2PC, F1 SQL
- [deep-dives.md](./deep-dives.md) — CockroachDB, TigerBeetle (additional distributed databases)
