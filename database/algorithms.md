# Database Algorithms

## MVCC (Multi-Version Concurrency Control)

MVCC allows concurrent readers and writers without blocking by maintaining multiple versions of each row:

```mermaid
flowchart LR
    T1[Transaction 1<br/>INSERT] --> V1[Version 1<br/>xmin=100<br/>xmax=null]
    T2[Transaction 2<br/>UPDATE] --> V1
    V1 --> V2[Version 2<br/>xmin=101<br/>xmax=null]
    T3[Transaction 3<br/>UPDATE] --> V2
    V2 --> V3[Version 3<br/>xmin=102<br/>xmax=null]
    subgraph ReadVsn[Transaction 100 reads]
        R[Read] -->|sees xmin=100, xmax=101| V1
    end
    subgraph ReadVsn2[Transaction 101 reads]
        R2[Read] -->|sees xmin=101| V2
    end
    V1 -.->|xmax=101| V2
```

Each row has hidden metadata:
- **xmin**: Transaction ID that created this version.
- **xmax**: Transaction ID that deleted/updated this version (or null if live).
- A transaction sees a row version if `xmin ≤ tx_id` and `xmax > tx_id OR xmax = null`.

```pseudocode
function IsVisible(tuple, snapshot)
    // snapshot bounds: the reading transaction's xmin..xmax window
    if not IsCommitted(tuple.xmin)
        return false                                    // creator never committed
    if tuple.xmin > snapshot.xmax
        return false                                    // created after reader's snapshot

    if tuple.xmax = null
        return true                                     // no deleter

    if not IsCommitted(tuple.xmax)
        return true                                     // deleter not yet committed

    if tuple.xmax ≤ snapshot.xmax
        return false                                    // deleted before reader

    return true
```

**PostgreSQL**: Versions stored in heap (same page). Dead tuples are cleaned by `VACUUM`. Hot Standby uses a snapshot conflict mechanism.

**MySQL (InnoDB)**: Versions stored in the undo log. The current version is in the clustered index; older versions are reconstructed from undo records. Purge thread cleans obsolete undo entries.

**Cassandra**: Uses `tombstones` for deletes and a timestamp per cell. Compaction reconciles versions — the highest timestamp wins. No VACUUM needed; compaction handles cleanup.

## Write-Ahead Log (WAL)

The WAL is an append-only file where every change is recorded *before* it reaches the data files. This guarantees durability without flushing data pages on every transaction:

```mermaid
flowchart LR
    Tx[Transaction<br/>BEGIN; UPDATE; COMMIT] -->|1. Write log entry| WAL[(WAL file<br/>append-only)]
    WAL -->|2. Acknowledge commit| Tx
    Tx -.->|3. Async| BP[Buffer Pool<br/>dirty pages]
    BP -->|4. Checkpoint| DF[(Data File<br/>B+Tree)]
    WAL -.->|5. On crash: replay| Recovery
    DF --> Recovery[Replay WAL from<br/>last checkpoint]
```

A `COMMIT` is not durable until the WAL flush completes. On crash recovery, the database:
1. Finds the last checkpoint (a consistent state).
2. Replays all committed transactions from the WAL since that checkpoint.
3. Rolls back uncommitted transactions using undo logs.

```pseudocode
function RecoverFromCrash()
    checkpoint ← ReadLastCheckpoint()
    committed ← ReadCommittedTransactions()             // from transaction log
    records ← WALEntriesSince(checkpoint.lsn)

    for record in records
        if record.tx ∈ committed
            Redo(record)                                // re-apply the change
        else
            Undo(record)                                // revert the change

    BuildNewCheckpoint()                                // new consistent state
```

- **MySQL (InnoDB)**: Redo log (`ib_logfile`). Circular, fixed-size. Handles redo (replay). Undo log handles rollback and MVCC.
- **PostgreSQL**: WAL in `pg_wal/`. Supports full recovery, point-in-time recovery (PITR), and replication streaming.
- **SQL Server**: Transaction log (`.ldf`). Log records contain the logical operation. Supports point-in-time restore and log shipping.

## Crash Safety & Write Integrity

The WAL guarantees durability in theory. In practice, getting a write safely to disk and detecting corruption on read involves several more layers.

### write() vs fsync() — The OS Buffer

`write(fd, buf, 4096)` doesn't write to disk — it copies bytes to the kernel's page cache. The kernel flushes dirty pages to disk whenever it feels like it (seconds to minutes later). If the power dies before that flush, the "committed" write is gone.

`fsync(fd)` forces the kernel to submit all dirty pages for that file to the disk and waits for the disk to confirm. Only after `fsync` returns is the write durable.

This is why:

```
write(fd, buf, 4096);          // fast — copies to kernel buffer
fsync(fd);                     // slow — waits for disk acknowledgment
```

Engines batch fsync calls for performance. A `COMMIT` forces an fsync of the WAL. Normal data page writes batch their fsync at checkpoint time.

### Torn Page (Partial Write)

A database page is typically 8KB–16KB. Disks write in 512-byte sectors. If the power dies halfway through writing a 16KB page, only some sectors made it:

```
Before:  [ AAAA AAAA AAAA AAAA ]   (16KB page, consistent)
After:   [ AAAA AAAA GARB GARB ]   (power loss at sector boundary)
```

The resulting page is **neither the old version nor the new version** — it's corrupt garbage. The WAL replay can't help because the page header might look valid (type flag, cell count are intact) while the data within is wrong. This is called a **torn page** or **partial page write**.

**Two solutions:**

- **Double-write buffer** (InnoDB): Before writing a page to its real location, write it to a scratch area (the doublewrite buffer). If power fails mid-write, the engine finds the clean copy in the doublewrite buffer on recovery, writes it to the real location, and replays the WAL from there.
- **Full-page writes** (PostgreSQL): At every checkpoint, PG writes the entire page image (not just the changed bytes) to the WAL. If a page is torn, recovery finds the full-page image in the WAL and overwrites the corrupt page before replaying incremental changes.

### Page Checksums

Every page header stores a checksum (CRC32, XXHASH, etc.) computed over the page contents when written. On read, the engine recomputes:

```
checksum_on_disk = page[0..3]
checksum_computed = CRC32(page[4..PAGE_SIZE])
if checksum_on_disk != checksum_computed:
    → page is corrupt → retry from WAL, replica, or report
```

Even without torn pages, checksums catch: media decay, RAM bit flips, kernel bugs, faulty disk controllers. All major engines have them (PG: `pd_checksum`, InnoDB: `FIL_PAGE_SPACE_OR_CHKSUM`, SQLite: `HEADER_CRC`).

### Magic Bytes — Rejecting Garbage

The first bytes of a database file are a **magic string** that identifies the format. On open, the engine checks it:

- SQLite: `"SQLite format 3\0"` at offset 0
- PostgreSQL: file header starts with a page whose `pd_pagesize_version` field encodes the PG major version
- InnoDB: `FIL_PAGE_TYPE` in the first page's header
- RocksDB SSTable: footer contains a magic number (`0x0000000000000088` or similar)

If the magic doesn't match — wrong file, corrupted header, garbage — the engine refuses to open the file. This is the last line of defense against silent corruption.

### LSM vs B-Tree — Crash Safety Differences

| | B-Tree (in-place) | LSM-Tree (append-only) |
|---|---|---|
| **Write unit** | Modify page in buffer pool, flush to same location | Append to WAL, flush MemTable to new SSTable |
| **Torn page risk** | High — overwriting a page mid-write creates a torn page | None — writing a new SSTable never overwrites an existing one |
| **Recovery** | Replay WAL + fix torn pages (doublewrite / full-page images) | Replay WAL to rebuild MemTable. Existing SSTables are always valid |
| **Checksum scope** | Per page | Per SSTable block + per file |

LSM-Trees have simpler crash safety because they never overwrite: an SSTable is either fully written or not. On crash, the partially-written SSTable is simply deleted and the WAL replays the MemTable flush. B-Trees must actively protect against torn pages because they overwrite data in place.

## Merkle Trees

Used by Cassandra, DynamoDB, and Git for **anti-entropy** (detecting out-of-sync data between replicas):

- Each partition's data is hashed into a Merkle tree (a binary hash tree).
- The root hash summarizes all data in that partition.
- Nodes exchange root hashes. If they match, the data is consistent.
- If they differ, they recursively compare child hashes to pinpoint the exact range that diverges.
- Only the divergent sub-range needs to be repaired (incremental repair).

## Bloom Filters

A probabilistic data structure used to answer "has this key been seen before?" with no false negatives and configurable false positive rate:

- A bit array of size `m` with `k` hash functions.
- On insert: set bits `h1(key)`, `h2(key)`, ..., `hk(key)` to 1.
- On lookup: if any of those bits is 0, the key is definitely not present.
- If all bits are 1, the key *might* be present (false positive possible).
- Cassandra stores a Bloom filter per SSTable in memory. Before reading an SSTable, check the Bloom filter — skip it if the key is definitely not present. This avoids unnecessary disk I/O.

```pseudocode
function BloomFilterNew(m, k)
    // m = bit array size (in bits), k = number of hash functions
    bits ← BitArray(m)
    seeds ← GenerateRandomSeeds(k)
    return (bits, seeds)

function BloomFilterAdd(filter, key)
    (bits, seeds) ← filter
    for each seed in seeds
        h ← Hash(key, seed) mod len(bits)
        bits[h] ← 1

function BloomFilterMaybeContains(filter, key) returns boolean
    (bits, seeds) ← filter
    for each seed in seeds
        h ← Hash(key, seed) mod len(bits)
        if bits[h] = 0
            return false                                // definitely not present
    return true                                         // might be present

function OptimalHashCount(bits_per_key)
    // k = (m/n) × ln(2)
    return round(bits_per_key × ln(2))
```
