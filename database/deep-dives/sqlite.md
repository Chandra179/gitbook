# SQLite Internals

## Storage Engine: B-Tree in a Single File

SQLite stores the entire database in a **single file** using a B-Tree structure. Pages are 4KB by default (configurable up to 64KB).

```mermaid
graph TD
    subgraph "Single Database File"
        H[Page 1: Header<br/>100 bytes]
        T[Schema Table<br/>sqlite_schema]
        U[User Table B-Tree]
        I[Index B-Tree]
    end
```

## Page Types

| Page Type | Description |
|---|---|
| **Lock-byte page** | Page 1 — reserved lock byte for concurrency |
| **Header page** | Page 1 — database header (100 bytes) |
| **Table B-Tree leaf** | Contains actual table row data |
| **Table B-Tree interior** | Contains key + pointer to child page |
| **Index B-Tree leaf** | Contains index key + rowid |
| **Index B-Tree interior** | Contains key + pointer to child page |
| **Overflow page** | Stores portion of a value too large for the row |
| **Pointer map page** | Tracks child pages of a page (for incremental vacuum) |
| **Free list page** | Unused page, linked to other free pages |

### Database Header (Page 1, first 100 bytes)

| Offset | Size | Field | Value |
|---|---|---|---|
| 0 | 16 | Header string | `SQLite format 3\0` |
| 16 | 2 | Page size | 512-65536 (power of 2) |
| 18 | 1 | Write version | 1 (legacy) or 2 (WAL) |
| 19 | 1 | Read version | 1 (legacy) or 2 (WAL) |
| 20 | 1 | Reserved space per page | Usually 0 |
| 24 | 4 | Max embedded payload fraction | 64 (default) |
| 28 | 4 | Min embedded payload fraction | 32 (default) |
| 32 | 4 | Leaf payload fraction | 32 (default) |
| 36 | 4 | File change counter | Increments on each modification |
| 40 | 4 | Database size in pages | 0 = unknown |
| 44 | 4 | First freelist trunk page | 0 = no free pages |
| 48 | 4 | Total free pages | Count for freelist |
| 52 | 4 | Schema cookie | Increments when schema changes |
| 56 | 4 | Schema format number | 1-4 |
| 60 | 4 | Default page cache size | Hint |
| 64 | 4 | Largest root B-Tree page number | Auto-vacuum mode |
| 68 | 4 | Text encoding | 1=UTF-8, 2=UTF-16le, 3=UTF-16be |
| 72 | 4 | User version | Application-defined |
| 76 | 4 | Incremental vacuum mode | 0 = no, 1 = yes |
| 80 | 4 | Application ID | Magic for file type detection |
| 84 | 20 | Reserved | Zeroes |
| 96 | 4 | Version-valid-for number | Must match file change counter |

## B-Tree Cell Structure

### Table B-Tree Leaf Cell

```
┌──────────────────────────────────────────┐
│  Varint: payload length                   │
│  Varint: rowid                            │
│  Payload: actual row data (header + body) │
└──────────────────────────────────────────┘
```

### Table B-Tree Interior Cell

```
┌───────────────────────────────────┐
│  Varint: left child page number   │
│  Varint: rowid of separator key   │
└───────────────────────────────────┘
```

### Index B-Tree Leaf Cell

```
┌──────────────────────────────────────────┐
│  Varint: payload length                   │
│  Payload: key data (no rowid field)       │
└──────────────────────────────────────────┘
```

## Record Format

Each row is stored as a **record** with a header and body:

```
┌──────────────────────────────────────┐
│  Header size (varint)                 │
│  Type 1 (varint)                      │  ← one per column
│  Type 2 (varint)                      │
│  ...                                  │
│  Data 1                               │  ← actual column values
│  Data 2                               │
│  ...                                  │
└──────────────────────────────────────┘
```

**Serial type codes**:

| Code | Value | Storage |
|---|---|---|
| 0 | NULL | 0 bytes |
| 1 | 8-bit signed int | 1 byte |
| 2 | 16-bit signed int | 2 bytes |
| 3 | 24-bit signed int | 3 bytes |
| 4 | 32-bit signed int | 4 bytes |
| 5 | 48-bit signed int | 6 bytes |
| 6 | 64-bit signed int | 8 bytes |
| 7 | 64-bit float | 8 bytes |
| 8 | 0 (integer zero) | 0 bytes |
| 9 | 1 (integer one) | 0 bytes |
| 10,11 | Reserved | Internal use |
| N ≥ 12 | If even: BLOB of (N-12)/2 bytes; if odd: TEXT of (N-13)/2 bytes |

## Schema Storage

The schema is stored in the `sqlite_schema` table (historically `sqlite_master`):

| Column | Type | Content |
|---|---|---|
| `type` | TEXT | `table`, `index`, `view`, `trigger` |
| `name` | TEXT | Object name |
| `tbl_name` | TEXT | Associated table name |
| `rootpage` | INT | Root B-Tree page number |
| `sql` | TEXT | CREATE statement that defines the object |

The schema table is **always** at root page 1 and is read once at database open.

## Transaction Control

SQLite uses a **rollback journal** or **WAL** (Write-Ahead Log) for atomic commit.

### Rollback Journal Mode

```mermaid
flowchart LR
    Tx[Begin Transaction] -->|1. Create journal| RJ[(rollback journal)]
    RJ -->|2. Copy original pages| RJ
    Tx -->|3. Modify DB pages| DB[(Database)]
    Commit[Commit] -->|4a. Delete journal| DB
    Crash[Crash] -->|4b. Restore journal| DB
```

- **DELETE**: Journal is deleted after commit (default)
- **TRUNCATE**: Journal is truncated (avoids directory I/O)
- **PERSIST**: Journal header is zeroed but file is retained (reduces fragmentation)
- **MEMORY**: Journal stored in memory (fast, no crash recovery)

### WAL Mode

```mermaid
flowchart LR
    W[Write Transaction] -->|1. Append| WAL[(WAL file<br/>-wal)]
    WAL -->|2. On commit: fsync| WAL
    R[Read Transaction] -->|3. Read from WAL + DB| R
    CP[Checkpoint] -->|4. Transfer WAL pages to DB| DB[(Database)]
    CP -->|5. Truncate WAL| WAL
```

- **Advantage**: Readers don't block writers, writers don't block readers.
- **WAL file**: Separate file (`database.sqlite-wal`). Grows until checkpoint.
- **Shared memory**: `database.sqlite-shm` for concurrent reader synchronization.
- **Checkpoint modes**: `PASSIVE` (don't block), `FULL` (block writers), `RESTART` (block + rotate WAL).

## CONCURRENCY

| Mode | Readers | Writers |
|---|---|---|
| Rollback journal | Multiple (shared lock) | One (reserved lock) |
| WAL | Multiple (snapshot isolation) | One (WAL append) |

**Lock states**:

```mermaid
graph LR
    UNLOCKED -->|BEGIN| SHARED
    SHARED -->|Reserve| RESERVED
    RESERVED -->|Get exclusive| PENDING
    PENDING -->|Wait for readers| EXCLUSIVE
    EXCLUSIVE -->|Commit| UNLOCKED
```

- **SHARED**: Read lock — multiple concurrent readers.
- **RESERVED**: Writer intends to write — reads still allowed.
- **PENDING**: Writer waiting for readers to drain.
- **EXCLUSIVE**: Exclusive write lock — no other access.

## Overflow Pages

When a value exceeds the **usable space on a B-Tree page** (page size - 4 bytes overhead), the excess is stored in **overflow pages**:

- First part of the value stays in the B-Tree cell (up to the local payload limit)
- Remaining data is stored as a linked list of 4KB overflow pages
- Each overflow page has a 4-byte pointer to the next overflow page

The local payload limit depends on the page size and the fraction settings in the database header.

## Free List

Deleted pages form a linked list of **freelist trunk pages**, each pointing to leaf pages:

```mermaid
graph LR
    H[Header: first freelist trunk] --> T1[Trunk Page 1<br/>count=N, leaf1, leaf2...]
    T1 --> L1[Leaf Page]
    T1 --> L2[Leaf Page]
    T1 -.-> T2[Trunk Page 2<br/>count=M, leaf3...]
```

Free pages are reused when new data is inserted, avoiding file growth.

## Vacuum

- `VACUUM` rebuilds the entire database file, packing pages tightly and reclaiming free list space.
- Creates a temporary file, copies all B-Tree pages, then swaps files.
- `PRAGMA auto_vacuum = 1 | 2` enables incremental vacuum (1 = FULL, 2 = INCREMENTAL).

## Performance Characteristics

| Operation | Latency | Notes |
|---|---|---|
| Point lookup (PK, cached) | 1-10μs | B-Tree page in cache |
| Point lookup (PK, uncached) | 100μs-1ms | Single page read |
| Range scan (100 rows) | 10-100μs | Sequential B-Tree traversal |
| INSERT (cached, no sync) | 1-10μs | Append to B-Tree leaf |
| INSERT (with PRAGMA synchronous=FULL) | 100μs-10ms | fsync on commit |
| CREATE INDEX | 10ms-10s | Full table scan + B-Tree build |
| VACUUM | seconds-minutes | Rewrite entire DB |

**Key factors**:
- **Page cache**: `PRAGMA cache_size = -64000` (64MB). Larger cache = fewer disk reads.
- **Synchronous mode**: `FULL` (safe, slow), `NORMAL` (safe at OS level), `OFF` (fast, corruption risk on crash).
- **Journal mode**: WAL is best for concurrent reads + writes.
- **mmap**: `PRAGMA mmap_size` enables memory-mapped I/O for large databases.
- **Prepared statements**: Avoid parsing overhead by reusing compiled statements.
