---
title: "Cassandra — Architecture"
aliases: []
tags: [database/deep-dive]
created: "2026-06-13"
---

# Cassandra — Architecture

> For the underlying mechanics of LSM-Trees, Merkle Trees, and Bloom Filters,
> see [Storage Engines](../storage-engines.md) and [Database Algorithms](../algorithms.md).

## What Makes It Unique

- **Always-on, no single point of failure** — every node is identical; no master, no failover, no downtime for node loss
- **Linear write scalability** — throughput scales linearly as you add nodes; designed for write-heavy workloads
- **Multi-DC topology built in** — aware of data center boundaries; replication and consistency policies can differ per DC
- **Trades consistency for availability** — AP in the CAP theorem; eventual consistency is the default; strong consistency is opt-in and expensive

## Storage Model

Cassandra uses an **LSM-Tree** storage engine. Writes flow through:

```mermaid
flowchart LR
    W["Write: INSERT INTO orders<br/>VALUES (user_id=42, ...)"] --> CL["1. Commit Log<br/>(sequential append)"]
    W --> MT["2. MemTable<br/>(in-memory sorted)"]
    MT -->|"MemTable full<br/>→ flush"| SST["3. SSTable<br/>(immutable, sorted on disk)"]
    CL -->|"durability<br/>guarantee"| W
    SST1["SSTable (old)"] & SST2["SSTable (newer)"] -->|"4. Background<br/>compaction"| M["Merged SSTable<br/>(sorted, deduped)"]
    style W fill:#f0f0f0,stroke:#666
    style CL fill:#e8f5e9,stroke:#2e7d32
    style MT fill:#e3f2fd,stroke:#1565c0
    style SST fill:#fff3e0,stroke:#e65100
    style M fill:#f3e5f5,stroke:#6a1b9a
```

1. **Commit Log** (sequential append for durability)
2. **MemTable** (in-memory sorted structure)
3. **SSTable** (immutable sorted file on disk)

SSTables use a **multi-component format** (Cassandra 5.0 BTI format): `Data.db` (sorted rows),
`Partitions.db` (partition index), `Rows.db` (row index), `Filter.db` (bloom filter),
`Summary.db` (index sampling), and metadata/checksum files.

Data is distributed via **consistent hashing** — `Murmur3(partition_key)` maps each row to a node.
The **partition key** part of the PRIMARY KEY determines placement. All rows in a partition are stored
together on one node. **Clustering columns** determine sort order within a partition.

```mermaid
flowchart LR
    R["Read: SELECT * FROM orders<br/>WHERE user_id = 42<br/>AND order_time > '2026-01-01'"] --> C[Coordinator]
    C -->|"Murmur3(user_id)"| N["Node 3 owns this partition"]
    N --> BF["Check Bloom Filter<br/>per SSTable"]
    BF -->|"maybe present"| PI["Partition Index<br/>locate offset"]
    PI --> D["Read Data.db<br/>at that offset"]
    D -->|"merge across SSTables"| R2["Return latest<br/>version of each row"]
    N -->|"merge across replicas"| R2
    style R fill:#f0f0f0,stroke:#666
    style C fill:#e3f2fd,stroke:#1565c0
    style N fill:#fff3e0,stroke:#e65100
    style BF fill:#e8f5e9,stroke:#2e7d32
```

Compaction merges SSTables using one of three strategies:
**Size-Tiered** (merge N files of similar size), **Leveled** (L0 → L1 → L2, non-overlapping exponential levels),
or **Time-Window** (compact within time windows, drop expired windows).

(For LSM-Tree mechanics, see [LSM-Tree](../storage-engines.md#lsm-tree))

## Indexing Model

Cassandra's primary "index" is the partition key hash — it tells the coordinator which node owns the data.
**Clustering columns** act as an ordered index within a partition, enabling efficient range scans
(`WHERE partition_key = ? AND clustering_col > ?`).

Secondary indexes are limited and use SSTable-attached storage:
- **SAI (Storage-Attached Indexing)** — index files alongside SSTables. Supports prefix and numeric
  range queries. Better performance than legacy SASI.
- **Materialized Views** — automatic denormalization. Writes to the base table propagate to view tables
  on different partition keys, enabling different query patterns.

**Best practice**: design tables for your query patterns (one table per query) rather than relying on
secondary indexes.

**Key partition size consideration**: large partitions degrade compaction and repair performance.
Monitor partition sizes and use time-bucketing or composite keys to keep partitions manageable.

(For Bloom Filter and Merkle Tree mechanics, see [Bloom Filters](../algorithms.md#bloom-filters) and [Merkle Trees](../algorithms.md#merkle-trees))
