# Database Storage Engines

## B-Tree vs LSM-Tree

The two dominant storage engine architectures:

| Property | B-Tree (InnoDB, SQL Server, Oracle) | LSM-Tree (Cassandra, RocksDB, LevelDB) |
|---|---|---|
| Read speed | Fast — single path to leaf | Slower — check multiple SSTables + MemTable |
| Write speed | Slower — random I/O, page splits | Fast — sequential append |
| Space amplification | Low — in-place updates | High — obsolete versions until compaction |
| Write amplification | Moderate | High (compaction merges) |
| Concurrency | Page-level locking | Append-only, no in-place overwrite |

**B-Tree** (used by MySQL/InnoDB, PostgreSQL): Optimized for read-heavy workloads. Data in fixed-size pages in a balanced tree. Updates find the page and modify in place. Page full = split, causing write amplification and random I/O. Fast reads (consistent O(log n) lookup), slower under massive concurrent writes.

**LSM-Tree** (used by Cassandra, RocksDB, LevelDB): Optimized for high-throughput writes. Append-only — new data goes to MemTable (RAM), flushed to immutable SSTable on disk (sequential I/O). A record may exist in multiple files. Background compaction merges files, discarding obsolete versions. Writes are fast, reads are slower (check MemTable, then SSTables newest→oldest).

## InnoDB (MySQL)

- **Clustered primary key**: The table *is* the index. Data rows are stored in the leaf pages of the primary key B+Tree.
- **Secondary indexes**: Store the primary key value as a pointer. Requires two lookups (secondary index → PK → data).
- **Buffer Pool**: Caches index and data pages in memory (LRU). Page size = 16KB.
- **Change Buffer**: Merges secondary index changes into the buffer pool for deferred writes.
- **Redo Log**: Circular write-ahead log for crash recovery (ib_logfile). Records physical page-level changes.
- **Undo Log**: Stores old row versions for MVCC and rollback.

## PostgreSQL Heap Engine

- **Heap storage**: Rows are stored in heap pages (8KB), not in any index order. Each row has a `CTID = (page, offset)`.
- **No clustered index**: The heap is always a heap. `CLUSTER` physically reorders the heap once but is not maintained.
- **TOAST**: Large values (>2KB) are compressed and stored in a separate TOAST table, with a pointer in the main tuple.
- **Visibility Map**: Tracks which pages have all-visible tuples — enables index-only scans and efficient vacuum.
- **Free Space Map**: Tracks available space in each heap page for new tuple placement.
- **VACUUM**: Removes dead tuples, updates visibility map, prevents transaction ID wraparound.

## SQL Server Storage Engine

- **Page**: 8KB. Extent = 8 contiguous pages (64KB). Allocation is extent-based.
- **Clustered index**: Data rows stored in leaf pages of the B-Tree (like InnoDB).
- **Heap**: No clustered index — data unordered, uses Index Allocation Map (IAM) for page tracking.
- **Non-clustered index**: Leaf pages store either clustering key or RID (for heaps).
- **Transaction Log** (.ldf): Write-ahead log, records logical operations. Uses VLF (Virtual Log File) segments.
- **TempDB**: Global temporary storage for sorts, hash joins, temporary tables, version store.
- **Buffer Pool Extension**: Allows using SSD as an extension of the buffer pool.

## WiredTiger (MongoDB)

- **Dual engine**: Supports both B-Tree (default for most workloads) and LSM (for write-heavy workloads). Configurable per collection.
- **Snapshot isolation**: Uses MVCC with multi-version concurrency. Readers do not block writers.
- **Block compression**: Snappy, Zlib, or Zstd compression. Pages are compressed on disk, decompressed into cache.
- **Checkpoints**: Periodic consistent snapshots of the data store. Recovery replays the WAL since the last checkpoint.

## RocksDB / LevelDB

- **Pure LSM**: Log-structured merge-tree from Google LevelDB, forked and optimized by Facebook (RocksDB).
- **Dynamic tiered compaction**: Level-based (L0 → L1 → L2 → ...) or size-tiered. L0 is overlapping SSTables from MemTable flushes. Deeper levels are non-overlapping, sorted, and merged.
- **Bloom filters per SSTable**: Speed up point lookups by skipping files that cannot contain the key.
- **Prefix encoding**: Keys are compressed by sharing common prefixes within an SSTable.
- **Write rate limiter**: Throttles compaction to avoid impacting foreground writes.
- **Used by**: CockroachDB (Pebble is a Go rewrite), MySQL MyRocks, Kafka Streams, TiKV.

## On-Disk File Layout

All databases store data as files on disk. Each engine defines its own binary format — page layout, checksums, compression, naming — because they make different tradeoffs. Here is what each engine actually writes to disk:

| Engine | Data files | WAL / Log | Page size | Notes |
|---|---|---|---|---|
| **InnoDB** | `*.ibd` (one per table) | `ib_logfile0..N` (redo, circular) | 16 KB | Each file is a B+Tree stored as a sequence of 16KB pages. First page is the FSP header. |
| **PostgreSQL** | `base/<dbid>/<relfilenode>` (no extension) | `pg_wal/` (16MB segments, recycled) | 8 KB | Each file is a heap of 8KB pages with PageHeaderData. A 1GB file is a "segment" — tables >1GB get multiple segments. |
| **SQL Server** | `*.mdf` (primary), `*.ndf` (secondary) | `*.ldf` (transaction log) | 8 KB | Pages grouped into extents (8 pages = 64KB). Allocation bitmap pages (GAM, SGAM, PFS) track free space. |
| **Cassandra** | `*.db` per SSTable component: Data, Index, Filter, Summary, CompressionInfo | CommitLog | SSTable (varies) | Each SSTable is a set of companion files. Immutable — writes create new files, compaction deletes old ones. |
| **RocksDB** | `*.sst` (SSTable files) | `MANIFEST-*`, `CURRENT`, `LOG`, `OPTIONS-*` | Configurable (4KB–64KB) | MANIFEST tracks the live set of SSTable files and their key ranges. CURRENT points to the active MANIFEST. |
| **WiredTiger** | `collection-*.wt`, `index-*.wt` | `WiredTigerLog.*` (journal) | Configurable (4KB–32KB) | Each `.wt` file is a B-Tree or LSM tree with page-level compression (Snappy/Zlib/Zstd). |
| **SQLite** | Single `*.db` (or `.sqlite`, `.sqlite3`) | Optional `*-wal` and `*-shm` | 4 KB (default) | Entire database in one file. Pages are B-Tree nodes. WAL mode creates a separate WAL file. |

**What every engine's data file looks like at the page level:**

```
┌─────────────────────────────────────┐
│  Page Header (checksum, LSN, type)  │  ← every page has metadata
├─────────────────────────────────────┤
│  Slot Array (offset ptrs to rows)   │  ← grows downward from header
├─────────────────────────────────────┤
│                                     │
│  Free Space                         │  ← between slot array and rows
│                                     │
├─────────────────────────────────────┤
│  Row Data / Keys & Pointers         │  ← grows upward from bottom
└─────────────────────────────────────┘
```

The page header contains at minimum: a checksum (detect corruption), an LSN (tells crash recovery if this page is newer than the checkpoint), and the page type (leaf, internal, meta, etc.). The slot array is how the engine finds individual rows within the page — each slot is a `(offset, length)` pair into the row data area.

All engines do **some form of this layout**. The differences are in page size, checksum algorithm, compression, and what metadata lives in the header.

**PostgreSQL example** — a table's directory listing:
```
$ ls -la /var/lib/postgresql/16/main/base/16384/
1255      16767_fsm  16767_vm   16768   16771   ...
```
- `16767` = the actual data file (heap pages)
- `16767_fsm` = Free Space Map (which pages have room for new tuples)
- `16767_vm` = Visibility Map (which pages have all-visible tuples for index-only scans)

**InnoDB example** — a MySQL data directory:
```
$ ls -la /var/lib/mysql/test/
db.opt    country.ibd    city.ibd    country.frm
```
- `*.ibd` = the table's clustered B+Tree + secondary indexes, all in one file
- `*.frm` = schema metadata (removed in MySQL 8.0+, moved to Data Dictionary)
