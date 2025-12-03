# Database

### Snapshot Isolation (Read)

A transaction isolation level id for allowing transactions to read a consistent view of the database at the exact moment the transaction began

**How it works?**

It uses Row Versioning (Multi-Version Concurrency Control or MVCC). When transaction performs a `SELECT`, it never places locks on the rows it reads. It reads from its own "snapshot" of the data, and therefore, it is NOT blocked by other transactions modifying the original data.

**Example**

```sql
-- This command is executed by the application before the business logic starts
SET TRANSACTION ISOLATION LEVEL SNAPSHOT; 

BEGIN TRANSACTION;
    -- All SELECTs in this transaction will read data versions
    -- from the moment the BEGIN TRANSACTION started.
    SELECT * FROM Accounts WHERE CustomerID = 123;
    
COMMIT;
```

### Locking Mechanism for `SELECT`

When you run a `SELECT` statement, most major database systems (SQL Server, PostgreSQL, Oracle) use **Read Committed (RC)** as their default isolation level. However, they implement it differently.

In **Locking-Based Databases** (e.g., Default SQL Server) it uses Pessimistic Concurrency Control.

* &#x20;When your `SELECT` runs, it acquires a Shared Lock (S-Lock) on the rows it reads.
* The S-Lock prevents other transactions from writing (acquiring an Exclusive Lock or X-Lock) to those rows while your `SELECT` is active. This prevents "Dirty Reads."
* The S-Lock is usually released immediately after the row has been read and the query moves to the next row.

In **MVCC Databases** (e.g., PostgreSQL, Oracle, SQL Server with RCSI): These systems uses Optimistic Concurrency Control. They do not take Shared Locks for standard `SELECT` statements. Therefore, in these systems, _Readers do not block Writers, and Writers do not block Readers._

### Hotspot Problem

Imagine massive number of concurrent transactions (1 million) all attempt to read or modify the exact same row (or a small page of data) at the same time. This creates a bottleneck, even if the database has plenty of resources (CPU, RAM), because every transaction must wait in a single-file line (queue) for the lock on that specific "hot" data to be released.

**Pessimistic Locking**

* In locking-based databases (like default SQL Server), a writer holds an Exclusive Lock (X-Lock) that blocks all readers. If thousands of users try to read a row while it is being updated, they all freeze.
* **Solution**: Enable Snapshot Isolation (MVCC): This allows readers to read the _last committed version_ of the row without waiting for the writer to finish, bypassing the lock entirely.

**Sequential Inserts**

* Inserting data with sequential keys (e.g., `1, 2, 3...` or timestamps) forces all new writes to hit the _last page_ of the database index physically. This causes "Latch Contention" on that single page.
* **Solution**: Hash Partitioning or Sharding: Distribute the writes across different physical pages or servers by using non-sequential keys (like UUIDs) or partitioning the table by a hash of the ID.

**Global Counter Design**

* Application logic that updates a single row frequently (e.g., `UPDATE Stats SET Hits = Hits + 1`). This row becomes a serialized choke point.
* **Solution**: Redis or In-Memory Buffering: Move the high-frequency counter to a cache (like Redis) and only flush the final total to the database periodically (e.g., every 5 seconds).

### Locking level&#x20;

#### **Granularity (What gets locked?)**&#x20;

This refers to the _size_ of the object being locked. Databases try to use the smallest lock possible (Row) to allow more users to work at the same time. If they run out of memory, they move up the hierarchy (Lock Escalation).

* **Database Level :** Locks the entire database. No one else can connect or read/write anything.
* **Table Level :** Locks one specific table (e.g., `Users`). No one can read/write to that table, but they can access `Orders`.
* **Page Level :** A "Page" is a block of memory (usually 8KB) that holds multiple rows (e.g., rows 1-50). Locking a page locks all 50 rows at once.
* **Row Level :** Locks a single specific record (e.g., `UserID = 101`).&#x20;
* **Column Level** : Rare, most standard databases (SQL Server, Postgres, Oracle) DO NOT support true column-level locking.

#### Lock Modes (Read vs. Write)

* **Read lock** : I am reading this. Others can read with me, but no one can change it until I finish.
* **Write lock** : I am changing this. No one else can read OR write to this until I commit
* **Update lock** : If you do `SELECT * FROM Table WITH (UPDLOCK)`, you are telling the DB, "I am reading this now, but I intend to update it in a millisecond."
* **Intent lock :** These are "warning signs" placed on higher levels (Table/Page) to warn others that a lower level (Row) is locked.<br>

and Mode (How strictly is it locked?).

### Indexing

Outbox Pattern or Change Data Capture (CDC).
