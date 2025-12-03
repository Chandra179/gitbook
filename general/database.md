# Database

### Locking Fundamentals

What gets locked? This refers to the size of the object being locked. Databases try to use the smallest lock possible (Row) to allow more users to work at the same time. If they run out of memory, they move up the hierarchy (Lock Escalation).

* Database Level: Locks the entire database. No one else can connect.
* Table Level: Locks one specific table (e.g., Users). Good for bulk loads/schema changes.
* Page Level: A "Page" is a block of memory (usually 8KB) holding multiple rows. Locking a page locks all \~50 rows on it.
* Row Level: Locks a single specific record. Maximum concurrency.
* Column Level: Rare/Myth. Most standard databases DO NOT support this.

**Lock Modes**

* Read Lock (S-Lock): Allows high concurrency. "I am reading, others can read, but no one can change it."
* Write Lock (X-Lock): Strictest mode. "I am changing this. No one else can read OR write."
* Intent Lock: "Warning signs" placed on higher levels (Table/Page) to warn others that a lower level (Row) is locked.

### How SELECT Works (Locking vs. MVCC)

When you run a `SELECT`, databases behave differently based on their engine:

In **Locking-Based Databases** (e.g., Default SQL Server)

* Mechanism: Pessimistic Concurrency Control.
* Process: SELECT acquires a Shared Lock (S-Lock).
* Effect: Prevents others from writing (X-Lock) while you read. Blocks "Dirty Reads."

In **MVCC** **Databases** (e.g., PostgreSQL, Oracle, SQL Server with RCSI)

* Mechanism: Optimistic Concurrency Control.
* Process: Uses Row Versioning.
* Effect: Readers do not take locks. Readers do not block Writers, and Writers do not block Readers.

### Snapshot Isolation (The MVCC Implementation)

A transaction isolation level allowing transactions to read a consistent view of the database at the exact moment the transaction began. It uses **Row Versioning (MVCC)**. When a transaction performs a SELECT, it never places locks. It reads from its own "snapshot" of the data.

```sql
SET TRANSACTION ISOLATION LEVEL SNAPSHOT; 
BEGIN TRANSACTION;
   -- All SELECTs read data versions from the moment BEGIN started.
   SELECT * FROM Accounts WHERE CustomerID = 123;
COMMIT;
```

### The Hotspot Problem

A massive number of concurrent transactions (e.g., 1 million) attempting to read or modify the exact same row/page, creating a queue. Causes & Solutions:

**Pessimistic Locking**

* Writers block readers.
* _Solution:_ Enable Snapshot Isolation (MVCC) so readers bypass locks.

**Sequential Inserts**

* Keys like `1, 2, 3...` force all writes to the last physical page (Latch Contention).
* _Solution:_ Hash Partitioning or Sharding (use UUIDs or hashed keys to spread writes).

**Global Counter**

* Frequent updates to a single row (e.g., `Hits + 1`).
* _Solution:_ Redis / In-Memory Buffering (flush to DB periodically).

### The "Read-Modify-Write" Deadlock (Update Locks)

Alice and Bob both read a row (S-Lock). Alice tries to update (needs X-Lock) but waits for Bob's read lock. Bob tries to update (needs X-Lock) but waits for Alice's read lock. it becomes **Deadlock**.

**Solution**\
Update Lock (U-Lock) Used via `WITH (UPDLOCK)`. It forces users to declare intentions upfront: "I am reading now, but I intend to write."

**Rules**

1. Compatibility: If Charlie wants to just read (SELECT), the U-Lock allows him (Performance is saved).
2. Exclusivity: If Bob also wants to update (UPDLOCK), the database blocks him immediately before he reads.
3. Result: Writers are serialized (queued), preventing the deadlock circle.
