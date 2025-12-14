# Database

```
Q: What are the ACID properties?
Q: What is the column Cardinality?
Q: How does a Composite Index work, and what is the "Leftmost Prefix" rule?
Q: How do you identify and fix the N+1 Query Problem?
Q: When should you use Normalization (3NF) versus Denormalization
Q: What is Connection Pooling and why is it critical for high-throughput applications?
Q: What is a "Race Condition" in a database context?
Q: What is the difference between Optimistic and Pessimistic Locking, and when should I use which?
Q: What specific data anomalies occur if we choose the wrong locking strategy or isolation level?
Q: What is the Write-Ahead Log (WAL), and why is it critical for durability?
Q: What is the difference between Synchronous and Asynchronous Replication?
Q: What is the difference between Vertical Scaling (Scaling Up) and Horizontal Scaling (Scaling Out)?
Q: How do "Eventual Consistency" and "Strong Consistency" differ in practice?
Q: How do we handle transactions when data is sharded or split across different services (Microservices)?

```

#### **Q**: What are the ACID properties?

ACID stands for Atomicity (all-or-nothing execution), \
Consistency (data always follows rules/constraints), \
Isolation (concurrent transactions don't interfere with each other), \
Durability (saved data survives power loss).&#x20;

In a high-throughput environment, Isolation mostly relaxed because perfect isolation (Serializability) is incredibly expensive. To guarantee that every transaction appears to happen one after another, the database must employ aggressive locking or validation, which forces transactions to wait in line. This creates a massive bottleneck that kills performance. Therefore, engineers often choose weaker isolation levels (like _Read Committed_ or _Repeatable Read_) to allow higher concurrency and speed, accepting the risk of specific data anomalies (like Phantom Reads) as the "price" for scale.

***

#### **Q**: What is the "Cardinality" of a column, and how does it affect index effectiveness?

Cardinality refers to the number of _unique_ values contained in a specific column relative to the total number of rows in the table. A column with "High Cardinality" contains mostly unique values (e.g., `User_ID`, `Email`, `UUID`), while a column with "Low Cardinality" contains very few unique values repeated many times (e.g., `Gender`, `Is_Active`, `Status`).

Impact on Index Effectiveness: Cardinality is the primary metric the Database Optimizer uses to decide whether to use an index or ignore it.

* High Cardinality: Indexes are extremely effective here. The B-Tree structure can rapidly narrow down millions of rows to the specific one you need.
* Low Cardinality: Indexes are often ignored. If you index a `Status` column (Active/Inactive) and query for "Active" users (where 90% of users are active), using the index is actually slower than a full table scan. This is because the database would have to jump back and forth between the index and the table data (random I/O) for 90% of the records. A sequential read of the whole table (Full Table Scan) is much faster in this scenario.

***

#### **Q**: What is the difference between B-Tree and LSM Tree (Log-Structured Merge-tree) storage engines?

The **B-Tree** (used by MySQL/InnoDB, PostgreSQL) its optimized for read-heavy workloads. It organizes data into fixed-size pages in a balanced tree structure. When you modify data, the engine finds the specific page and updates it in place. If a page is full, it splits, which can cause "write amplification" and random I/O operations. This makes B-Trees incredibly fast for reads (consistent lookup speed) but potentially slower for massive, concurrent write streams.

The **LSM Tree** (used by Cassandra, RocksDB, LevelDB) is optimized for high-throughput write workloads. Instead of updating existing files, it treats storage as append-only. New data is written to a "MemTable" (in RAM) and eventually flushed to an immutable "SSTable" on disk (Sequential I/O). Because data is never overwritten, a single record might exist in multiple files. Background processes run "Compaction" to merge these files and discard obsolete data. This makes LSM trees incredibly fast for writes, but reads can be slower because the engine may need to check several files to find the latest version of a key.

***

#### **Q**: How does a Composite Index work, and what is the "Leftmost Prefix" rule?

A Composite Index is a single index acting on multiple columns, ordered by the sequence in which you define them (e.g., `CREATE INDEX idx_name ON Table (A, B, C)`). The database sorts the data first by column A; then, _only_ where A is identical, it sorts by B; and _only_ where both A and B are identical, it sorts by C.

The Leftmost Prefix Rule states that the database can only utilize the index if the query search terms follow the index order from left to right without skipping. Using the example `(A, B, C)`:

* Querying on A works (the index is sorted by A).
* Querying on A and B works.
* Querying on B or C alone _fails_ to use the index efficiently because, without knowing A, the values of B are scattered randomly throughout the index structure.

***

#### **Q**: How do you identify and fix the N+1 Query Problem?

The N+1 Query Problem is a performance issue that occurs primarily when using ORMs (like GORM in Go or Hibernate in Java). It happens when code fetches a parent record (1 query) and then iterates through a loop to fetch related child records for _each_ parent (N queries). For example, fetching 100 `Users` and then executing a new SQL query inside a loop to get the `Address` for each user results in 101 total database calls. This introduces massive network latency, often killing application performance under load.

How to Identify & Fix:

* Identify: Look at your database logs or APM tools (like Datadog or New Relic). If you see a waterfall of identical `SELECT` statements executing milliseconds apart (e.g., `SELECT * FROM addresses WHERE user_id = ?`), you have an N+1 problem.
* The solution is Eager Loading or Batch Fetching. Instead of fetching the child inside the loop, you instruct the database to fetch all required data in a single go (or two optimized queries).
  * In SQL, this is done via a `JOIN`.
  * In Application Logic (like Go), you fetch the list of User IDs first, and run one query: `SELECT * FROM addresses WHERE user_id IN (1, 2, 3...)`. Most ORMs support this via methods like `.Preload()` or `.With()`.

***

#### Q: When should you use Normalization (3NF) versus Denormalization?

**Normalization** (specifically 3rd Normal Form or 3NF) is the standard design strategy for write-heavy applications (OLTP) like banking systems, e-commerce order management, or inventory systems. The primary goal is to reduce data redundancy and ensure data integrity. By breaking data into smaller, related tables, you ensure that every piece of data lives in exactly one place. This eliminates "anomalies"—for example, if you update a customer's address, you only do it in the `Users` table, not in every single `Order` they’ve ever placed. You should use 3NF when your priority is data accuracy and optimizing for fast, consistent writes (INSERT/UPDATE/DELETE).

**Denormalization**, is an optimization technique used for read-heavy workloads or analytics systems (OLAP). It duplicating data across tables to avoid expensive "JOIN" operations during queries. For example, in a high-traffic social media feed, you might store the `username` directly in the `Posts` table rather than just the `user_id`. This means the system can retrieve the post and the author's name in a single lookup without joining the `Users` table. You should use denormalization when your application suffers from slow read performance due to complex joins and you are willing to accept the trade-off of slower, more complex writes (since you now have to update the username in multiple places if it changes).

***

#### Q: What is Connection Pooling and why is it critical for high-throughput applications?

Connection Pooling is a mechanism that maintains a cache of open, reusable database connections instead of opening and closing a new connection for every single user request. In a typical flow without pooling, every API call requires the application to:

1. Open a TCP socket (Network 3-way handshake).
2. Perform a TLS/SSL handshake (Encryption setup).
3. Authenticate with the database (Password check).
4. Execute the query.
5. Close the connection

For high-throughput applications, steps 1–3 are incredibly expensive and slow. If you have 10,000 users per second, performing the handshake 10,000 times will overwhelm both your application server and the database CPU, leading to massive latency. Connection pooling solves this by keeping a set of connections "alive." When a request comes in, it "borrows" an existing connection, executes the query, and immediately returns the connection to the pool for the next request to use.

***

#### **Q**: What is a "Race Condition" in a database context?

A Race Condition occurs when the final outcome of a process depends on the uncontrollable timing or ordering of concurrent events. For example, imagine two users trying to withdraw $10 from a shared wallet that has $100.

1. User A reads balance: $100.
2. User B reads balance: $100 (before A saves).
3. User A calculates $100 - $10 = $90 and saves.
4. User B calculates $100 - $10 = $90 and saves. The final balance is $90, but it should be $80. The second update "raced" the first and overwrote it, causing a Lost Update anomaly. The system failed because it didn't block User B from reading the stale value while User A was working on it.

***

#### **Q**: What is the difference between Optimistic and Pessimistic Locking, and when should I use which?

Isolation levels control how the DB handles locks implicitly, but sometimes you need explicit control.

* Pessimistic Locking (`SELECT ... FOR UPDATE`): You assume a conflict _will_ happen. You lock the row immediately when you read it. No one else can touch it until you commit. Use this for high-contention data (e.g., a central generic wallet).
*   Optimistic Locking: You assume a conflict _probably won't_ happen. You don't lock the row on read. Instead, you read a version number (e.g., `version: 1`). When updating, you check if the version is still 1. If someone else changed it to 2 in the meantime, your **update fails**, and you retry. Use this for lower contention to avoid blocking database connections.<br>

    <pre class="language-sql"><code class="lang-sql">value = 100, version = 1

    User 1 reads: value = 100, version = 1
    User 2 reads: value = 100, version = 1

    User 1 tries update:
    UPDATE ... WHERE version = 1 → SUCCESS
    <strong>value = 120 version = 2
    </strong>
    User 2 tries update using old version:
    UPDATE ... WHERE version = 1 → FAIL (0 rows updated)

    User 2 retries by reading latest:
    value = 120, version = 2

    User 2 recomputes and updates:
    UPDATE ... WHERE version = 2 → SUCCESS
    value = 150 version = 3
    </code></pre>

***

#### **Q**: How many transaction lock level are there and when to use them?

**Read Uncommitted** is the lowest level, where a transaction can read data that has been modified by another transaction but not yet committed. This allows for "**dirty reads**," meaning if the other transaction rolls back, your transaction has processed invalid data. You should use this level only for non-critical logging or analytics tasks where absolute accuracy is less important than raw speed, and where blocking other transactions is unacceptable.

**Read Committed** is the most common default level (e.g., in PostgreSQL, Oracle, SQL Server). It guarantees that a transaction can only read data that has been permanently committed. This prevents dirty reads but still allows "non-repeatable reads"—if you query the same row twice in one transaction, the data might change if someone else commits an update in between. You should use this for most standard web applications where you need a balance of strong concurrency and reasonable data integrity.&#x20;

* _(if someone update the data it reads the updated data)_

**Repeatable Read** ensures that if you read a row once, you will see the exact same data if you read it again within the same transaction, effectively "locking" that version of the row for your session. This prevents non-repeatable reads but can still allow "phantom reads," where new rows added by others might appear in your range queries. You should use this for reporting dashboards or financial calculations where numbers must remain consistent throughout the duration of operation.&#x20;

* _(updated data is not reads by the transaction but new data can be still read)_

**Serializable** is the strictest level. It effectively forces transactions to run as if they were happening one after another, preventing all concurrency anomalies (dirty reads, non-repeatable reads, and phantoms). However, this comes at a massive performance cost due to heavy locking or frequent transaction retries. You should use this only for critical operations where data integrity is non-negotiable, such as preventing double-booking in a reservation system or processing sensitive banking transfers

***

#### **Q**: What is the Write-Ahead Log (WAL), and why is it critical for durability?

Write-Ahead Log (WAL) is an append-only file where the database records changes (inserts, updates, deletes) _before_ they are written to the actual database data files. When a transaction is committed, the database first writes the details of that transaction to the WAL on the disk. Only after the WAL entry is safely stored does the database acknowledge the transaction as "Success" to the client. The actual data tables (B-Trees/Heaps) are updated later in memory and flushed to disk asynchronously (a process called "checkpointing").

***

#### **Q**: What is the difference between Synchronous and Asynchronous Replication?

This distinction defines the trade-off between Data Integrity and Performance in a distributed system.

**Synchronous Replication**: When the primary node receives a write, it sends the data to the replica node and _waits_ for the replica to acknowledge receipt before telling the client "Success." This guarantees Zero Data Loss (RPO = 0) because the data exists in two places. However, it increases write latency (you must wait for the network round-trip) and reduces availability (if the replica goes down, the primary cannot accept writes).

**Asynchronous Replication**: The primary node writes the data locally, immediately tells the client "Success," and then sends the data to the replica in the background. This is much faster and the primary keeps working even if the replica is down. However, if the primary crashes before it forwards the latest data to the replica, that data is permanently lost (Replication Lag).

***

#### **Q**: What is the difference between Vertical Scaling (Scaling Up) and Horizontal Scaling (Scaling Out)?

Vertical Scaling (Scaling Up) means making a single server stronger by adding more CPU, RAM, or faster storage (e.g., upgrading from an AWS `t3.medium` to an `m5.2xlarge`). However, you cannot buy a bigger computer, because it introduces a Single Point of Failure.&#x20;

Horizontal Scaling (Scaling Out) means adding _more_ servers (nodes) to handle the load, splitting the data across them (Sharding). This offers infinite scale and high availability (if one node dies, others survive). The trade-off is massive complexity: you lose ACID guarantees across nodes (requiring patterns like Sagas or 2PC) and must manage complex data distribution logic.

***

#### **Q**: How do "Eventual Consistency" and "Strong Consistency" differ in practice?

**Strong Consistency**: This guarantees that once a write is confirmed, _any_ subsequent read from any node will return that new value. However, achieving this requires coordination (locking or synchronous consensus like Paxos/Raft), which increases latency and reduces scalability.

* _Use Case:_ Financial ledgers, inventory counts, or password changes. If you transfer money, the balance must update immediately everywhere.

**Eventual Consistency**: This guarantees that if no new updates are made, all reads will _eventually_ return the last updated value. However, for a short period (milliseconds to seconds), a user might read stale data. This allows the system to remain highly available and fast, as it doesn't need to block writes while syncing data.

* _Use Case:_ Social media feeds, DNS records, or analytics. If you "Like" a post, it is acceptable if your friend doesn't see that "Like" for 2 seconds.

***

#### **Q**: How do we handle transactions when data is sharded or split across different services (Microservices)?

Once you move to Sharding or Microservices, you lose the ability to use a single database's ACID properties. If you need to update a `Wallet` database and a `Loan` database simultaneously, you face the distributed consistency problem. The traditional solution is Two-Phase Commit (2PC). In 2PC, a coordinator tells all databases to "Prepare" (lock resources and verify they can commit). If everyone says "Yes," the coordinator sends a "Commit" command. The downside is that this is a "blocking" protocol; if the coordinator crashes or the network fails, resources remain locked, freezing the system.

The modern standard for high-volume Fintech systems is the Saga Pattern. Instead of a single ACID transaction, a business process is broken down into a sequence of local transactions. Each step updates its own database and publishes an event to trigger the next step. Crucially, Sagas handle failure through Compensating Transactions. If the "Deduct Money" step succeeds but the "Disburse Loan" step fails, the system triggers a "Refund Money" transaction to undo the first step. This embraces "Eventually Consistency" rather than "Strong Consistency," allowing the system to remain highly available and performant even when parts of the network are slow.

***

