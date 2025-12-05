# Database

```
Q: What are the ACID properties?
Q: What is a "Race Condition" in a database context?
Q: What is the difference between Vertical Scaling (Scaling Up) and Horizontal Scaling (Scaling Out)?
Q: Why shouldn't we just use the "Serializable" isolation level for everything to be safe? 
Q: What is the difference between Optimistic and Pessimistic Locking, and when should I use which?
Q: What specific data anomalies occur if we choose the wrong locking strategy or isolation level?
Q: How do we handle transactions when data is sharded or split across different services (Microservices)?
Q: What is the "Cardinality" of a column, and how does it affect index effectiveness?
Q: How do you identify and fix the N+1 Query Problem?
Q: What is the Write-Ahead Log (WAL), and why is it critical for durability?
Q: What is the difference between Synchronous and Asynchronous Replication?
Q: How do "Eventual Consistency" and "Strong Consistency" differ in practice?
```

**Q**: What are the ACID properties?

ACID stands for Atomicity (all-or-nothing execution), \
Consistency (data always follows rules/constraints), \
Isolation (concurrent transactions don't interfere with each other), \
Durability (saved data survives power loss).&#x20;

In a high-throughput environment, Isolation is the property most frequently "negotiated" or relaxed because perfect isolation (Serializability) is incredibly expensive. To guarantee that every transaction appears to happen one after another, the database must employ aggressive locking or validation, which forces transactions to wait in line. This creates a massive bottleneck that kills performance. Therefore, engineers often deliberately choose weaker isolation levels (like _Read Committed_ or _Repeatable Read_) to allow higher concurrency and speed, accepting the risk of specific data anomalies (like Phantom Reads) as the "price" for scale.

***

**Q**: What is a "Race Condition" in a database context?

A Race Condition occurs when the final outcome of a process depends on the uncontrollable timing or ordering of concurrent events. For example, imagine two users trying to withdraw $10 from a shared wallet that has $100.

1. User A reads balance: $100.
2. User B reads balance: $100 (before A saves).
3. User A calculates $100 - $10 = $90 and saves.
4. User B calculates $100 - $10 = $90 and saves. The final balance is $90, but it should be $80. The second update "raced" the first and overwrote it, causing a Lost Update anomaly. The system failed because it didn't block User B from reading the stale value while User A was working on it.

***

**Q**: What is the difference between Vertical Scaling (Scaling Up) and Horizontal Scaling (Scaling Out)?

Vertical Scaling (Scaling Up) means making a single server stronger by adding more CPU, RAM, or faster storage (e.g., upgrading from an AWS `t3.medium` to an `m5.2xlarge`). It is simple because you keep your data in one place, preserving ACID properties easily. However, you cannot buy a bigger computer, because it introduces a Single Point of Failure.&#x20;

Horizontal Scaling (Scaling Out) means adding _more_ servers (nodes) to handle the load, splitting the data across them (Sharding). This offers infinite scale and high availability (if one node dies, others survive). The trade-off is massive complexity: you lose ACID guarantees across nodes (requiring patterns like Sagas or 2PC) and must manage complex data distribution logic.

***

**Q**: Why shouldn't we just use the "Serializable" isolation level for everything to be safe?&#x20;

While `Serializable` guarantees the highest data integrity by strictly ordering transactions (making them appear sequential), it comes with a massive performance penalty. To achieve this, databases often employ aggressive locking or abort transactions frequently due to serialization anomalies. In a high-concurrency Fintech environment (e.g., thousands of payment requests per second), using `Serializable` acts as a bottleneck, drastically reducing Throughput. We need to choosing the lowest isolation level that still guarantees correctness for your specific use case (e.g., using `Read Committed` for general browsing but `Repeatable Read` or explicit locking for ledger updates).

***

**Q**: What is the difference between Optimistic and Pessimistic Locking, and when should I use which?

Isolation levels control how the DB handles locks implicitly, but sometimes you need explicit control.

* Pessimistic Locking (`SELECT ... FOR UPDATE`): You assume a conflict _will_ happen. You lock the row immediately when you read it. No one else can touch it until you commit. Use this for high-contention data (e.g., a central generic wallet).
* Optimistic Locking: You assume a conflict _probably won't_ happen. You don't lock the row on read. Instead, you read a version number (e.g., `version: 1`). When updating, you check if the version is still 1. If someone else changed it to 2 in the meantime, your update fails, and you retry. Use this for lower contention to avoid blocking database connections.

***

**Q**: What specific data anomalies occur if we choose the wrong locking strategy or isolation level?

Locks prevent conflicts, but it is important to understand _what specific errors_ occur when those locks are absent or too loose. In database theory, these errors are called "Read Phenomena." The first is the **Dirty Read**, which happens when a transaction reads uncommitted data from another transaction. If the other transaction rolls back, your application has processed data that "never existed."&#x20;

The second is the **Non-Repeatable Read**. This occurs when you read a row (e.g., balance = 100), and before your transaction finishes, someone else updates it and commits. If you read that same row again within the same transaction, the value has changed. This breaks consistency in financial calculations where you expect inputs to remain static during a logical operation.

The third is the **Phantom Read**. This is distinct from a Non-Repeatable read because the _rows you read didn't change_, but the _set of rows_ matching your criteria changed. For example, if you run `SELECT * FROM Orders WHERE Value > 1000` and get 5 records, but a split second later another user inserts a new order for $2000, a repeat of your query would return 6 records. The new record is a "phantom." Understanding these three phenomena is the prerequisite for configuring `TRANSACTION ISOLATION LEVELS` (Read Committed, Repeatable Read, Serializable) correctly in your Go applications.

***

**Q**: How do we handle transactions when data is sharded or split across different services (Microservices)?

Once you move to Sharding or Microservices, you lose the ability to use a single database's ACID properties. If you need to update a `Wallet` database and a `Loan` database simultaneously, you face the distributed consistency problem. The traditional solution is Two-Phase Commit (2PC). In 2PC, a coordinator tells all databases to "Prepare" (lock resources and verify they can commit). If everyone says "Yes," the coordinator sends a "Commit" command. The downside is that this is a "blocking" protocol; if the coordinator crashes or the network fails, resources remain locked, freezing the system.

The modern standard for high-volume Fintech systems is the Saga Pattern. Instead of a single ACID transaction, a business process is broken down into a sequence of local transactions. Each step updates its own database and publishes an event to trigger the next step. Crucially, Sagas handle failure through Compensating Transactions. If the "Deduct Money" step succeeds but the "Disburse Loan" step fails, the system triggers a "Refund Money" transaction to undo the first step. This embraces "Eventually Consistency" rather than "Strong Consistency," allowing the system to remain highly available and performant even when parts of the network are slow.

***

**Q**: What is the "Cardinality" of a column, and how does it affect index effectiveness?

Cardinality refers to the number of _unique_ values contained in a specific column relative to the total number of rows in the table. A column with "High Cardinality" contains mostly unique values (e.g., `User_ID`, `Email`, `UUID`), while a column with "Low Cardinality" contains very few unique values repeated many times (e.g., `Gender`, `Is_Active`, `Status`).

Impact on Index Effectiveness: Cardinality is the primary metric the Database Optimizer uses to decide whether to use an index or ignore it.

* High Cardinality: Indexes are extremely effective here. The B-Tree structure can rapidly narrow down millions of rows to the specific one you need.
* Low Cardinality: Indexes are often ignored. If you index a `Status` column (Active/Inactive) and query for "Active" users (where 90% of users are active), using the index is actually slower than a full table scan. This is because the database would have to jump back and forth between the index and the table data (random I/O) for 90% of the records. A sequential read of the whole table (Full Table Scan) is much faster in this scenario.

> Rule of Thumb: If a query returns more than \~30% of the total rows, the optimizer will likely ignore your index.

***

**Q**: How do you identify and fix the N+1 Query Problem?

The N+1 Query Problem is a performance issue that occurs primarily when using ORMs (like GORM in Go or Hibernate in Java). It happens when code fetches a parent record (1 query) and then iterates through a loop to fetch related child records for _each_ parent (N queries). For example, fetching 100 `Users` and then executing a new SQL query inside a loop to get the `Address` for each user results in 101 total database calls. This introduces massive network latency, often killing application performance under load.

How to Identify & Fix:

* Identify: Look at your database logs or APM tools (like Datadog or New Relic). If you see a waterfall of identical `SELECT` statements executing milliseconds apart (e.g., `SELECT * FROM addresses WHERE user_id = ?`), you have an N+1 problem.
* The solution is Eager Loading or Batch Fetching. Instead of fetching the child inside the loop, you instruct the database to fetch all required data in a single go (or two optimized queries).
  * In SQL, this is done via a `JOIN`.
  * In Application Logic (like Go), you fetch the list of User IDs first, and run one query: `SELECT * FROM addresses WHERE user_id IN (1, 2, 3...)`. Most ORMs support this via methods like `.Preload()` or `.With()`.

***

**Q**: What is the Write-Ahead Log (WAL), and why is it critical for durability?

The Write-Ahead Log (WAL) is an append-only file where the database records changes (inserts, updates, deletes) _before_ they are written to the actual database data files. When a transaction is committed, the database first writes the details of that transaction to the WAL on the disk. Only after the WAL entry is safely stored does the database acknowledge the transaction as "Success" to the client. The actual data tables (B-Trees/Heaps) are updated later in memory and flushed to disk asynchronously (a process called "checkpointing").

Why it is critical: The WAL ensures Durability (the 'D' in ACID) and performance.

1. Performance: Writing to the main data file requires "Random I/O" (finding the exact spot in the B-Tree on the disk), which is slow. Writing to the WAL is "Sequential I/O" (appending to the end of a file), which is incredibly fast.
2. Crash Recovery: If the database server loses power immediately after a commit but before the main data files are updated, the data in memory is lost. However, upon restart, the database reads the WAL, "replays" the events recorded there, and restores the database to the consistent state it was in right before the crash.

***

**Q**: What is the difference between Synchronous and Asynchronous Replication?

This distinction defines the trade-off between Data Integrity and Performance in a distributed system.

**Synchronous Replication**: When the primary node receives a write, it sends the data to the replica node and _waits_ for the replica to acknowledge receipt before telling the client "Success." This guarantees Zero Data Loss (RPO = 0) because the data exists in two places. However, it increases write latency (you must wait for the network round-trip) and reduces availability (if the replica goes down, the primary cannot accept writes).

**Asynchronous Replication**: The primary node writes the data locally, immediately tells the client "Success," and then sends the data to the replica in the background. This is much faster and the primary keeps working even if the replica is down. However, if the primary crashes before it forwards the latest data to the replica, that data is permanently lost (Replication Lag).

***

**Q**: How do "Eventual Consistency" and "Strong Consistency" differ in practice?

These concepts describe when a read operation is guaranteed to see the results of a write operation.

**Strong Consistency**: This guarantees that once a write is confirmed, _any_ subsequent read from any node will return that new value. However, achieving this requires coordination (locking or synchronous consensus like Paxos/Raft), which increases latency and reduces scalability.

* _Use Case:_ Financial ledgers, inventory counts, or password changes. If you transfer money, the balance must update immediately everywhere.

**Eventual Consistency**: This guarantees that if no new updates are made, all reads will _eventually_ return the last updated value. However, for a short period (milliseconds to seconds), a user might read stale data. This allows the system to remain highly available and fast, as it doesn't need to block writes while syncing data.

* _Use Case:_ Social media feeds, DNS records, or analytics. If you "Like" a post, it is acceptable if your friend doesn't see that "Like" for 2 seconds.

***

