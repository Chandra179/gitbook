# MySQL InnoDB Internals

## Storage Engine: Clustered B+Tree

InnoDB uses a **clustered B+Tree** as its primary storage structure. The table *is* the index — data rows are stored in the leaf pages of the primary key B+Tree.

```mermaid
graph TD
    subgraph "Clustered B+Tree"
        R[Root Page<br/>internal] --> I1[Internal Page]
        R --> I2[Internal Page]
        I1 --> L1[Leaf Page<br/>rows A-D]
        I1 --> L2[Leaf Page<br/>rows E-H]
        I2 --> L3[Leaf Page<br/>rows I-L]
        I2 --> L4[Leaf Page<br/>rows M-P]
    end
```

### Page Structure

InnoDB pages are 16KB. Each page has:

| Component | Size | Description |
|---|---|---|
| FIL Header | 38 bytes | Page checksum, LSN, page type, space ID, page number |
| Page Header | 56 bytes | Index ID, number of records, free space pointer |
| Infimum + Supremum | 26 bytes | Artificial boundary records |
| User Records | Variable | Actual row data, ordered by primary key |
| Free Space | Variable | Between user records and page directory |
| Page Directory | Variable | Slot array for binary search within page |
| FIL Trailer | 8 bytes | Checksum matching FIL Header (torn page detection) |

**Page types**: INDEX (B-Tree node), UNDO_LOG, INODE, IBUF_BITMAP, FSP_HDR, TRX_SYS, etc.

### Row Formats

| Format | Header | Features |
|---|---|---|
| COMPACT | 5 bytes | Variable-length length array, NULL bitmap |
| REDUNDANT (legacy) | 6 bytes | Longer header, first 768 bytes of overflow stored inline |
| DYNAMIC (default since 5.7) | 5 bytes | Overflow values stored fully off-page (BLOB, TEXT) |
| COMPRESSED | 5 bytes | Page-level compression (zlib/lz4) + DYNAMIC overflow |

**Off-page storage**: For DYNAMIC and COMPRESSED, values > 767 bytes are stored in overflow pages. The B-Tree leaf stores a 20-byte pointer to the overflow.

## Clustered Index

- **Primary key required**: If no explicit PK, InnoDB uses the first UNIQUE NOT NULL column, or generates a hidden 6-byte `DB_ROW_ID`.
- **Rows in PK order**: Physical layout follows primary key order on page (logical, not necessarily physical on disk).
- **Insertion**: Appends near the end of the B+Tree for auto-increment PKs (sequential writes). Random PKs (UUID) cause page splits and fragmentation.

## Secondary Indexes

- Store `(indexed columns, primary key)` in a separate B+Tree.
- **Lookup**: Search secondary index B+Tree → get PK → search clustered B+Tree → get full row. This is why covering indexes matter.
- **No heap pointer**: Unlike PostgreSQL's CTID, InnoDB always uses the PK as the row locator. PK updates cascade to all secondary indexes.

## Buffer Pool

The buffer pool caches index pages, data pages, undo pages, and change buffer entries:

```mermaid
flowchart LR
    subgraph "Buffer Pool"
        LRU[LRU List<br/>young + old]
        F[Free List<br/>empty pages]
        U[Unzip LRU<br/>compressed pages]
    end
    Disk[(Disk)] <--> LRU
    LRU -->|page evicted| F
```

- **LRU with midpoint insertion**: Pages are inserted at the 3/8 point (old block). Accessed pages move to the young sublist (5/8). This prevents full table scans from flooding the cache.
- **Page hash table**: O(1) lookup by (space_id, page_no) — avoids LRU scan.
- **Read-ahead**: Linear (sequential pattern detected) and random (same extent pages) to prefetch.
- **Flushing**: Clean pages evicted immediately. Dirty pages flushed by page cleaner threads (adaptive flushing based on redo log generation rate).

## Change Buffer

Merges secondary index modification into the buffer pool **deferred**:

1. A DML modifies a secondary index page not in the buffer pool
2. Instead of reading the page from disk, InnoDB records the change in the change buffer (persistent in system tablespace)
3. When the page is eventually read into the buffer pool, buffered changes are merged
4. Also merges periodically in the background

**Types cached**: INSERT, DELETE-MARK, UNDO. UPDATE is mapped to DELETE-MARK + INSERT.

**Benefit**: Reduces random I/O for secondary indexes. Disproportionately helpful for indexes with low cache hit rates.

## Redo Log (ib_logfile)

Circular write-ahead log for crash recovery:

```mermaid
flowchart LR
    Tx[Transaction] -->|1. Write redo| RL[(Redo Log<br/>circular buffer)]
    Tx -->|2. Modify page| BP[Buffer Pool]
    BP -->|3. Checkpoint: flush<br/>dirty pages to disk| DF[(Data Files)]
    RL -->|4. On crash: replay<br/>from last checkpoint| Recovery
```

- **Physical logging**: Records physical page-level changes (page number, offset, data). Not logical row operations.
- **Group commit**: Multiple transactions flush their redo together for efficiency.
- **Log sequence number (LSN)**: Every redo record has an LSN. Each page stores the LSN of the last modification (`FIL_PAGE_LSN`). During recovery, pages with LSN ≥ checkpoint LSN are skipped.
- **Doublewrite buffer**: Before writing a page from the buffer pool to its data file location, InnoDB writes it to a contiguous 2MB area (128 pages × 16KB). This prevents torn pages — if a partial page write occurs during crash, InnoDB recovers from the doublewrite copy.

## Undo Log

Stores old row versions for MVCC and rollback:

- **Stored in system tablespace** or separate undo tablespace (MySQL 8.0+).
- **Two types**: INSERT undo (can be discarded after transaction commits) and UPDATE undo (needed for MVCC until no active transaction needs it).
- **Rollback segment**: 1024 undo slots per segment. Multiple segments for concurrency.
- **MVCC**: A reader traverses the undo chain (`DB_ROLL_PTR`) to reconstruct the row version visible to its read view.

## Adaptive Hash Index (AHI)

InnoDB can build a hash index over frequently accessed B-Tree pages:

- **Built automatically**: Monitors index lookups. When a pattern emerges (same page accessed repeatedly via the same prefix), a hash table is constructed.
- **Stored in buffer pool**: Uses ~1% of buffer pool for hash table entries.
- **Not persistent**: Rebuilt on restart.
- **Limitation**: Only equality lookups (no range). Single column prefix only.
- **Contention issue**: AHI uses a single btr_search_latch. On high-concurrency systems, disabling AHI can improve performance.

## Locking

| Lock Type | Granularity | Description |
|---|---|---|
| Table-level | Table | Intention locks (IS, IX), AUTO-INC, LOCK TABLES |
| Record lock | Index record | Locks a single index entry (always an index, even for heap-like access) |
| Gap lock | Gap between records | Precludes phantom rows in REPEATABLE READ |
| Next-key lock | Record + gap | Record lock + gap lock before it (default in REPEATABLE READ) |
| Insert intention lock | Gap | Special gap lock for INSERT — multiple inserters can coexist if inserting to different positions |
| Predicate lock | Page | For spatial indexes |

- **Row-level locking**: InnoDB locks **index entries**, not rows. A table without a PK uses the hidden `DB_ROW_ID` index.
- **Deadlock detection**: Waits-for graph is traversed. Victim chosen by transaction weight. `innodb_deadlock_detect` can be disabled for high-concurrency workloads.
- **MVCC**: Consistent reads (SELECT without FOR SHARE/UPDATE) are non-locking — they read from the undo snapshot based on the transaction's read view.

## Transaction Isolation

| Level | Dirty Read | Non-repeatable Read | Phantom | Implementation |
|---|---|---|---|---|
| READ UNCOMMITTED | Possible | Possible | Possible | Reads latest version |
| READ COMMITTED | Prevented | Possible | Possible | Reads committed version per statement |
| REPEATABLE READ (default) | Prevented | Prevented | Possible in theory | Consistent read view per transaction |
| SERIALIZABLE | Prevented | Prevented | Prevented | All reads are locking (SELECT ... FOR SHARE) |

- REPEATABLE READ uses **consistent read** — a read view opened at the first read persists for the entire transaction.
- Phantom rows are prevented in practice by **next-key locking** (gap locks block inserts).

## Performance Characteristics

| Operation | Latency (p99) | Notes |
|---|---|---|
| Point lookup (PK, cached) | 10-100μs | Buffer pool hit |
| Point lookup (PK, uncached) | 1-5ms | Single random I/O |
| Range scan (100 rows) | 50-200μs | Sequential within page |
| Write (single row, cached) | 100-500μs | Redo log + page modification |
| Write (sync, `innodb_flush_log_at_trx_commit=1`) | 1-10ms | fsync on commit |
| INSERT with auto-increment | 100-500μs | Near-sequential write |

**Key factors**:
- **Buffer pool hit ratio**: Most important metric. Target > 99% for read-heavy workloads.
- **Redo log size**: Too small causes frequent checkpoints (stalls writes). Rule of thumb: allow 30-60 minutes of writes.
- **Innodb_flush_log_at_trx_commit**: `1` (fsync each commit, safe), `2` (fsync once per second, lose 1s on crash).
- **Doublewrite buffer**: Adds ~5-10% write overhead but prevents data corruption. Can disable on FS with atomic page writes (ZFS, some SSDs).
