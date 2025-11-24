# Consistent Hashing

**Data Partitioning (Sharding)** means splitting data across multiple servers instead of storing everything on one machine.

Imagine we have 1,000,000 users and 3 servers:

* Server A → Users 1 – 333,333
* Server B → Users 333,334 – 666,666
* Server C → Users 666,667 – 1,000,000

But how do we decide which server stores which data?

If we use simple hashing:

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

If a data key is at position `95` and there is no server ahead, it wraps around back to 0 and continues until it finds the first server.

This is why it’s a ring.

#### Adding a new server

If we add a new server at position `75`: Only the data between positions 70 and 75 will move.\
All other data stays exactly where it was.

This gives us:

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

Example positions:

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

This distributes data more evenly.

Results:

* Even data distribution
* Reduced hotspots
* Predictable performance

#### What happens if a server dies?

If Server B crashes:

* All its virtual nodes disappear
* The data previously mapped to them moves to the next clockwise server
* The rest of the system is unaffected

Before:

```
12 → Server A  
18 → Server B  
28 → Server A  
35 → Server C  
63 → Server A  
70 → Server B  
88 → Server A  
92 → Server C
```

After Server B dies:

```
12 → Server A  
28 → Server A  
35 → Server C  
63 → Server A  
88 → Server A  
92 → Server C
```

Only the affected ranges are redistributed.
