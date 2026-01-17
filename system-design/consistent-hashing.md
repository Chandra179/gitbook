# Consistent Hashing

Imagine we have 1,000,000 users and 3 servers:

* Server A → Users 1 – 333,333
* Server B → Users 333,334 – 666,666
* Server C → Users 666,667 – 1,000,000

But how do we decide which server stores which data? If we use simple hashing:

```
server = hash(data_keys) % number_of_servers
```

When a new server is added, almost ALL keys move to different servers.\
This is inefficient and slow.

### Consistent Hashing

Consistent hashing places both servers and data keys on a circular number line called a **hash ring**.

#### What is a hash ring?

A **ring** is just a very long circular road with numbered positions.

Example:

```
0, 1, 2, 3, 4, ... 99, then back to 0
```

In real systems, it usually ranges from:

```
0 to 4,294,967,295 (for a 32-bit hash space)
```

#### What lives on the ring?

Both **servers** and **data keys** (users, files, sessions, etc.) get positions on the ring. This is done using a hash function. Examples:

```
Input: "Server-A"
Hash: 23

Input: "user_9372"
Hash: 67
```

That hash value determines the position on the ring. So our ring looks like this:

```
0 ---- 10 ---- 20 ---- 30 ---- 40 ---- 50 ---- 60 ---- 70 ---- 80 ---- 90 ---- back to 0

Server-A at 23  
user_9372 at 67
```

A data key is stored on the first server encountered when moving **clockwise**. So `user_9372` is at position `67`. Walking clockwise, the next server is at position `80`. So the data is stored on that server.

#### What if no server is ahead?

If a data key is at position `95` and there is no server ahead, it wraps around back to 0 and continues until it finds the first server. This is why it’s a ring.

#### Adding a new server

If we add a new server at position `75`: Only the data between positions 70 and 75 will move.\
All other data stays exactly where it was. This gives us:

* Minimal data movement
* No global reshuffle
* Stable system under growth

#### But this can still cause imbalance...

Servers are placed randomly on the ring. If each server appears only once, distribution might look like:

```
Server A → 5  
Server B → 8  
Server C → 92  

0 ---- 5(A) ---- 8(B) ------------------------------ 92(C) ---- back to 0
```

The gap between `8` and `92` is HUGE, meaning Server `C` handles most of the data. So even though consistent hashing prevents massive reshuffling, it does NOT guarantee balanced load.

This can cause:

* One server overloaded
* Others underutilized
* Performance bottlenecks

#### Virtual Nodes (VNodes)

To fix this, we use virtual nodes. Instead of placing each server once, we place each server multiple times on the ring using slightly modified names.

Example for Server A:

```
Server-A#1 → hash → 12  
Server-A#2 → hash → 28  
Server-A#3 → hash → 63  
Server-A#4 → hash → 88  
```

All of these still map to the same physical Server A.

Now the ring looks like: `A, B, C, A, B, A, C, B, A...`

```
12  → Server A  
18  → Server B  
28  → Server A  
35  → Server C  
63  → Server A  
70  → Server B  
88  → Server A  
92  → Server C
```

This distributes data more evenly. Results:

* Even data distribution
* Reduced hotspots
* Predictable performance

#### What happens if a server dies?

If we only stored data on one server, a crash would mean permanent data loss. You can't "move" data from a dead hard drive! To solve this, real-world systems (like Cassandra or DynamoDB) use a Replication Factor.

**Pre-Replication (The Safety Net)**

Instead of storing data on just _one_ node, the system stores the data on the first server encountered PLUS the next $$N$$ neighbors on the ring. This is called storing replicas. If Server `A` is the primary for a piece of data, Server `B` and Server `C` hold identical replica copies.

**Handling the Crash**

If a server, like Server `B`, crashes, the data previously mapped to its virtual nodes is not lost.

* The system detects `B` is down.
* Requests are immediately routed to the next clockwise server (Server `C` in many cases, or the next available virtual node).
* Since the data was pre-replicated to that successor node, the system remains stable and data access continues without interruption. Only the responsibility (the traffic) shifts.

```
Before: (The original mapping remains illustrative, showing where the data was going)
​
12 → Server A​
18 → Server B​
28 → Server A​
35 → Server C​
63 → Server A​
70 → Server B​
88 → Server A​
92 → Server C

After Server B dies: (The mapping shows where the traffic shifts to)
​​
12 → Server A​
18 → Server C (The data previously on B is now accessed via C)​
28 → Server A​
35 → Server C​
63 → Server A​
70 → Server C (The data previously on B is now accessed via C)​
88 → Server A​
92 → Server C
```

Only the affected ranges are redistributed, and because of replication, the data is instantly accessible.
