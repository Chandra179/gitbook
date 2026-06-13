# PostgreSQL Internals

## Data Model

PostgreSQL is a **relational** (SQL) database with a rich type system and strict schema enforcement.

| Concept | Detail |
|---|---|
| **Schema** | Namespaces (`public`, `pg_catalog`, `information_schema`, user-defined). Tables live inside schemas. |
| **Tables** | Strict schema — every column has a fixed type. Supports constraints: `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, `NOT NULL`, `EXCLUDE`. |
| **Data types** | `INTEGER`, `BIGINT`, `NUMERIC(p,s)`, `VARCHAR(n)`, `TEXT`, `BOOLEAN`, `DATE`, `TIMESTAMP`, `TIMESTAMPTZ`, `INTERVAL`, `UUID`, `JSON`, `JSONB`, `ARRAY`, `ENUM`, `RANGE`, `POINT`/geometry, and user-defined types via `CREATE TYPE`. |
| **Generated columns** | `GENERATED ALWAYS AS (...) STORED` (PG 12+). Virtual generated columns are supported (virtual is the default). |
| **Default values** | Literals, sequences (`SERIAL`, `IDENTITY`), or any variable-free expression (including volatile functions such as `nextval()`, `random()`, `CURRENT_TIMESTAMP`). |
| **TOAST** | Values > 2KB are compressed and/or moved to a separate TOAST table transparently. |
| **NULL handling** | NULLs sort last by default (can be changed with `NULLS FIRST/LAST`). Three-valued logic in comparisons. |
| **OIDs** | Object Identifiers (32-bit) used internally for system catalog rows. `WITH OIDS` is deprecated. |

## Storage Engine

### Heap Storage

PostgreSQL uses a **heap-based** storage model — rows are stored in heap pages (8KB each) without any particular order.

```mermaid
graph TD
    subgraph "Heap Page (8KB)"
        H[PageHeaderData<br/>24 bytes] --> I[ItemIdData Array<br/>(offset, length) pairs]
        I --> FS[Free Space]
        FS --> T1[Tuple 1]
        FS --> T2[Tuple 2]
        FS --> T3[Tuple 3]
    end
```

**Page layout**: Each 8KB page has:
- **PageHeaderData** (24 bytes): LSN, checksum, free space pointer, page flags
- **ItemIdData array**: `(offset, length)` pointers to each tuple, grows from the start
- **Free space**: Between the ItemId array and tuples
- **Tuples**: Grow from the end toward the free space

**CTID**: Each row has a `CTID = (page_number, tuple_index)` — a direct pointer to its location on disk. This is the fastest way to locate a row.

**TOAST** (The Oversized-Attribute Storage Technique): Values > 2KB are compressed and stored in a separate TOAST table. The main tuple holds a pointer to the TOAST chunk. Out-of-line values are divided into chunks of at most ~2,000 bytes so that four chunks fit on a page. Compression is attempted first for `EXTENDED` storage.

### Heap File Layout

The heap file is a flat array of 8KB blocks. Each block is a page containing tuples:

```
Heap file (8KB blocks)

Index  Contents
────── ────────────────────────────────────────────
[0]    CTID(0,1): id=1, name=Alice,  email=a@x.com
       CTID(0,2): id=2, name=Bob,    email=b@x.com
       CTID(0,3): id=3, name=Charlie ...
[1]    CTID(1,1): id=11, name=Diana ...
       CTID(1,2): id=12, name=Eve ...
[2]    CTID(2,1): id=21, name=Frank ...
[3]    ...
```

When the heap file reaches 1GB, PostgreSQL closes it and creates a new segment:

```
Directory listing for a large table:
  base/16384/16767     → segment 0 (0-1GB)
  base/16384/16767.1   → segment 1 (1-2GB)
  base/16384/16767.2   → segment 2 (2-3GB)
```

**CTIDs don't link rows together.** Each tuple has a `t_ctid` field, but it only tracks versions of the **same logical row** (HOT updates). Independent rows like Alice and Bob have no pointer between them:

```
After INSERT:   Tuple for id=1 → t_ctid=(0,1)  (points to itself)
                Tuple for id=2 → t_ctid=(0,2)  (points to itself)

After UPDATE id=1 SET name='Alice2':
                Old tuple 1 → t_ctid=(3,5)     (points to new version)
                New tuple   → t_ctid=(3,5)     (points to itself)
```

The only "links" in a heap are `t_ctid` chains for the same row. The heap itself is just a bag of tuples — no ordering, no cross-row pointers.

**Multiple segment files don't point to each other.** PG tracks the segment list in `pg_class` metadata, not in the files themselves. When it needs block 150,000:

1. Look up segment list: `[16767, 16767.1, 16767.2, ...]`
2. 150,000 × 8KB = 1.17GB → past the 1GB boundary
3. Open `16767.1` (second segment)
4. Read at offset `(150,000 - 131,072) × 8KB` within that segment

CTIDs are absolute within the relation. The file switch is invisible to queries — a CTID of `(150000, 5)` keeps working even after the relation spans 3 segment files. The 1GB limit is a historical 32-bit filesystem constraint.

### MVCC (Multi-Version Concurrency Control)

PostgreSQL implements MVCC by keeping multiple row versions (tuples) in the heap. Each tuple has hidden system columns:

| Column | Size | Purpose |
|---|---|---|
| `xmin` | 4 bytes | Transaction ID that created this tuple |
| `xmax` | 4 bytes | Transaction ID that deleted/updated this tuple (0 if live) |
| `t_cid` | 4 bytes | Command ID (overlaps with `t_xvac`); used for `cmin`/`cmax` in the logical view |
| `ctid` | 6 bytes | Pointer to next tuple version (for HOT updates) |

**Tuple visibility**:
- A tuple is visible if `xmin` is committed AND (`xmax` is not committed OR `xmax` exceeds current snapshot)
- A transaction sees tuples where `xmin ≤ txid` and (`xmax = 0` or `xmax > txid`)

**HOT (Heap-Only Tuples)**: When a row is updated and the new version fits on the same page, PostgreSQL creates a HOT chain — the new ctid points to the next version on the same page. This avoids updating indexes. If the new version doesn't fit, indexes must be updated.

### VACUUM

Dead tuples accumulate over time. VACUUM reclaims space and prevents transaction ID wraparound:

- **Concurrent VACUUM**: Runs alongside normal operations. Scans pages, removes dead tuples, updates the Free Space Map and Visibility Map.
- **Visibility Map**: A bitmap tracking which pages have all-visible tuples. Enables index-only scans (skip heap fetch if page is all-visible) and efficient vacuum (skip all-visible pages).
- **Free Space Map**: Tracks available space per page for new tuple placement.
- **Transaction ID Wraparound**: Transaction IDs are 32-bit (~4 billion). After more than 4 billion transactions, IDs wrap around. `VACUUM FREEZE` marks tuples with a special "frozen" xmin that never needs comparison. The `2^31` figure is the safety margin for required vacuuming, not the wraparound point itself.
- **Autovacuum**: Background daemon that automatically triggers vacuum based on dead tuple thresholds.

## Write-Ahead Log (WAL)

PostgreSQL's WAL is the foundation for durability, replication, and point-in-time recovery:

```mermaid
flowchart LR
    Tx[Transaction] -->|1. Write WAL record| WAL[(WAL segment<br/>16MB each)]
    WAL -->|2. Flush to disk<br/>at COMMIT| WAL
    Tx -->|3. Modify heap page| BP[Buffer Pool<br/>shared_buffers]
    BP -->|4. Checkpoint<br/>(dirty pages flushed)| DF[(Data Files)]
    WAL -->|5. On crash: replay| Recovery
```

**LSN (Log Sequence Number)**: Each WAL record has a unique LSN — the byte position in the WAL stream. Every data page stores the LSN of the last WAL record that modified it (`pd_lsn`). During crash recovery, pages with LSN ≥ the checkpoint redo point are already up-to-date and skipped.

**WAL segments**: Stored in `pg_wal/`, each 16MB. Segments are recycled (not deleted) to avoid file creation overhead.

**Full Page Writes**: At the first modification after a checkpoint, the entire page is written to the WAL. This prevents "torn pages" — partial writes that leave a page in an inconsistent state after a crash.

**Checkpoints**: A background process that flushes all dirty buffers to disk and advances the redo point. `checkpoint_completion_target` spreads the I/O over time to avoid spikes.

**WAL Archiving**: Completed WAL segments can be copied to a safe location. Enables Point-in-Time Recovery (PITR) — replay WAL from a base backup to any point in time.

## Index System

PostgreSQL has the most extensive index system of any open-source database:

| Index Type | Use Case | Storage |
|---|---|---|
| B-Tree (default) | Equality + range queries, ordering | Balanced tree, stores (key, CTID) |
| GiST | Full-text, geometry, ranges | Generalized Search Tree |
| GIN | Arrays, JSONB, tsvector | Inverted index (value → rows) |
| BRIN | Time-series, naturally ordered data | Block range min/max |
| SP-GiST | k-d trees, quad-trees, network addresses | Space-partitioned tree |
| Hash | Equality-only (rarely used) | Hash table |

**B-Tree internals**: Stores `(key, CTID)` pairs in a balanced tree. Supports deduplication (compressing duplicate keys). Pages are 8KB (default), can be up to 32KB with non-default block sizes.

**Index-Only Scan**: If the visibility map shows a page is all-visible, PostgreSQL can answer queries from the index alone without fetching the heap tuple.

## Query Execution

```mermaid
flowchart LR
    SQL[SQL Query] --> Parser
    Parser -->|Parse Tree| Rewriter
    Rewriter -->|Query Tree| Planner
    Planner -->|Plan Tree| Executor
    Executor -->|Result| Output
```

**Parser**: Converts SQL text to a parse tree using a LALR(1) grammar. Validates syntax and permissions.

**Rewriter**: Applies rules (views, rules) to transform the query tree. `CREATE VIEW` creates a rewrite rule that expands views at query time.

**Planner / Optimizer**: The heart of PostgreSQL. Cost-based optimizer with three join strategies:

1. **Nested Loop Join** — O(n*m). Best when one relation is small. Can use an index on the inner relation.
2. **Hash Join** — O(n+m). Builds a hash table on the smaller relation, probes with the larger. Best for equi-joins on unsorted data.
3. **Merge Join** — O(n+m). Sorts both relations on the join key, then merges. Best for sorted data or when ORDER BY matches the join key.

### Scan Methods

PostgreSQL offers these scan methods, chosen by the optimizer based on cost:

| Scan Type | Cost Formula | When Used |
|---|---|---|
| **Sequential Scan** | `seq_page_cost × num_pages` | No index, large portion of table |
| **Index Scan** | `(index_height + matching_pages) × random_page_cost` | Highly selective queries |
| **Index-Only Scan** | Index height + matching index pages | Index covers all needed columns + page is all-visible (Visibility Map) |
| **Bitmap Scan** | Bitmap creation + heap fetch | Combination of conditions, moderate selectivity |
| **TID Scan** | Page fetch cost | Direct row access by known CTID |

**Bitmap Scan** works in steps:

```mermaid
graph TD
    T[Table] -->|Page 1| BM[Bitmap<br/>bit array of heap pages]
    I1[Index A: status='active'] -->|Bits for matching rows| BM
    I2[Index B: created > 2024'] -->|Bits for matching rows| BM
    BM -->|1, 3, 5, 7| RS[Recheck + Fetch heap tuples]
```

1. Multiple indexes are scanned independently
2. Each produces a bitmap of candidate heap pages
3. Bitmaps are merged (AND/OR) based on the query
4. Only the needed pages are fetched from the heap

### Cost Estimation

Statistics are stored in `pg_class` and `pg_stats`, populated by `ANALYZE`:

```sql
SELECT reltuples, relpages FROM pg_class WHERE relname = 'orders';
-- reltuples = 1,000,000 rows
-- relpages = 100,000 pages

SELECT * FROM pg_stats WHERE tablename = 'orders' AND attname = 'status';
-- n_distinct = 3  (active, pending, completed)
-- most_common_vals = {completed, active, pending}
-- most_common_freqs = {0.60, 0.30, 0.10}
```

**Selectivity estimation**:
- Equality on unique column: `1/reltuples`
- Equality on low-cardinality column: `most_common_freqs[i]`
- Range query: Based on histogram bounds
- `LIKE` / pattern: Based on correlation and string length

**Cost parameters**:

| Parameter | Default | Description |
|---|---|---|
| `seq_page_cost` | 1.0 | Cost of reading one page sequentially |
| `random_page_cost` | 4.0 | Cost of reading one page randomly |
| `cpu_tuple_cost` | 0.01 | CPU cost per row |
| `cpu_index_tuple_cost` | 0.005 | CPU cost per index row |
| `cpu_operator_cost` | 0.0025 | CPU cost per expression evaluation |

### Reading Query Plans

Key signs in `EXPLAIN (ANALYZE, BUFFERS)` output:
- **Seq Scan on large table + filter**: Missing an index
- **Nested Loop with many rows**: Wrong join order (should use hash join)
- **Sort with large memory**: Missing index on ORDER BY column
- **Bitmap Heap Scan with many rows**: Might be cheaper as a seq scan
- **Subquery Scan on CTE**: CTE is a materialization fence

**Executor**: Iterates over plan nodes. Each node produces tuples for the parent node (Volcano-style pull model). Supports parallel nodes — Gather/Gather Merge distribute work to parallel workers.

**JIT (Just-In-Time Compilation)**: Using LLVM, PostgreSQL compiles expression evaluation, tuple deforming, and filter functions into machine code. Can reduce query execution time considerably for CPU-bound queries with complex expressions.

### Join Strategies

| Strategy | When optimal | Memory | Complexity |
|---|---|---|---|
| Nested Loop | One side very small | O(1) | O(n*m) |
| Hash Join | Medium tables, equi-join | O(min(n,m)) | O(n+m) |
| Merge Join | Large sorted tables | O(n+m) | O(n+m) |

## Replication

**Streaming Replication (physical)**: Primary streams WAL to replicas in real-time. Synchronous: commit waits for at least one replica (RPO=0). Asynchronous: replicas may lag (RPO > 0).

```mermaid
flowchart LR
    P[Primary] -->|WAL stream| SR[Sync Replica<br/>ack required]
    P -.->|WAL stream| AR[Async Replica<br/>no ack]
```

**Logical Replication**: Publishes changes at the row level (INSERT, UPDATE, DELETE) rather than physical WAL blocks. Supports selective replication (specific tables) and cross-version replication.

**Hot Standby**: Replicas can serve read queries while receiving WAL. Uses snapshot conflict resolution — if a query conflicts with a WAL replay operation, the query is either cancelled or waits (`max_standby_archive_delay`, `max_standby_streaming_delay`).

## Performance Tuning

| Parameter | Default | Description |
|---|---|---|
| `shared_buffers` | 128MB | Cache for data pages. Typically 25% of RAM |
| `effective_cache_size` | 4GB | OS cache estimate for planner cost |
| `work_mem` | 4MB | Memory per sort/hash operation |
| `maintenance_work_mem` | 64MB | Memory for VACUUM, CREATE INDEX |
| `wal_buffers` | -1 (auto-tunes to ~1/32 of `shared_buffers`, min 64kB, max one WAL segment) | WAL buffer before flush |
| `max_parallel_workers` | 8 | Max parallel workers for queries |
| `random_page_cost` | 4.0 | Cost of random I/O vs sequential |

## Advanced Features

- **CTEs / WITH queries**: Non-recursive CTEs referenced once are folded into the parent query by default; only materialized by default when referenced more than once. Use `NOT MATERIALIZED` (PG12+) to force inline.
- **Window functions**: `ROW_NUMBER()`, `RANK()`, `LAG()`, `LEAD()` — evaluated after joins, before ORDER BY
- **Recursive CTEs**: `WITH RECURSIVE` for graph traversal, tree queries
- **Triggers**: `BEFORE/AFTER/INSTEAD OF`, row-level or statement-level, `FOR EACH ROW/STATEMENT`
- **Foreign Data Wrappers (FDW)**: Query external databases (postgres_fdw, mysql_fdw, etc.) as local tables
- **Extensions**: PostGIS (spatial), pgvector (vector search), pg_partman (partition management), pg_stat_statements (query performance)
- **Table Partitioning**: Range, list, hash — with partition pruning at planning time
- **Parallel Query**: Parallel seq scan, parallel index scan, parallel join, parallel aggregation, partial aggregation
- **SSI (Serializable Snapshot Isolation)**: True serializability using predicate locks and conflict detection — prevents all anomalies including phantoms

## Storage Size Analysis

| Object | Size |
|---|---|
| Heap page | 8 KB |
| Tuple header | 23 bytes (plus alignment) |
| B-Tree internal page | 8 KB (hundreds of keys) |
| WAL segment | 16 MB |
| Transaction ID | 32-bit (4 billion wrap limit) |

---

*Last verified against official PostgreSQL documentation: 2026-06-13*
