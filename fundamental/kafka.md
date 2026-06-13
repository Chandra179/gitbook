---
title: "Kafka"
aliases: []
tags: [cs, cs/kafka]
created: "2026-06-13"
---

# Kafka

### **Cluster**

A group of Brokers working together to provide high availability and scalability. 1 cluster can have 1 or more broker

### **Broker**

A physical server or container within the cluster that stores and manages data.

* **Partition Leader**: For every partition, one broker is elected as the "Leader." It handles all read and write requests for that partition.
* **Partition Follower**: Other brokers acting as "Followers" replicate the leader's data. If the leader fails, a follower automatically steps up to become the new leader.

### **Log Segments**

On disk, a partition is a directory. Each segment is a pair of files:

* `.log` — raw message data, appended sequentially
* `.index` — sparse offset-to-byte-offset mapping (one entry per ~4096 bytes)
* `.timeindex` — timestamp-to-offset mapping

Segments are:

* **Rolled** when they hit `segment.bytes` (default 1 GB) or `segment.ms` (default 7 days)
* **Active segment** — the one currently being written to
* **Older segments** — immutable, read-only, candidates for compaction/deletion

> Sequential I/O on the `.log` file is why Kafka is fast — writes are pure appends.

### **ISR (In-Sync Replicas)**

A partition leader maintains a set of replicas that are "caught up" — the ISR. A follower is in the ISR if it has fully replicated all messages up to the last committed offset. If a follower falls behind (replication lag > `replica.lag.time.max.ms`, default 30s), it is removed from ISR.

* `min.insync.replicas` — minimum number of in-sync replicas required for the leader to accept writes
* If ISR size drops below this threshold, the broker rejects writes with `NotEnoughReplicasException`
* Tradeoff: Higher value = stronger durability, lower availability (fewer brokers able to write)

### **Controller Broker**

Every cluster has one Controller broker. It manages partition leadership across the cluster:

* Monitors broker heartbeats (via ZK ephemeral nodes or KRaft quorum)
* Assigns partition leaders when a broker fails or a new partition is created
* Manages partition reassignments (e.g., adding replicas, migrating to new brokers)

If the Controller fails, a new one is elected automatically via ZooKeeper or the KRaft quorum.

### **ZooKeeper / KRaft**

Kafka uses a metadata store to track cluster state:

* **ZooKeeper** (legacy): Stores broker membership, topic configs, ACLs, quotas, and Controller election. Kafka ≤ 2.8 required ZK. Deprecated as of KIP-833, targeted for removal in Kafka 4.0.
* **KRaft** (Kafka Raft): Self-managed metadata quorum introduced in 2.8 (GA in 3.3+). No external dependency — Kafka runs as a single binary with internal Raft-based consensus for metadata. Replaces ZK entirely.

### **Topic**

A logical name or "folder" where you send and categorize data (e.g., `user-signups` or `payments`). A topic must have at least 1 partition (configurable). Partitions are distributed across different Brokers to allow multiple producers and consumers to work at the same time.

### **Producer**

Each message contains a **Key** (optional, partition routing), **Value** (payload), **Headers** (optional metadata), **Timestamp**, and an **Offset** (assigned by the broker on write).

We push message with topic tied to it. Lets say the topic have 3 partition how the system know where to route this message into which partition 1, 2 or 3?

* Key-based hash → ensures messages with the same key always land in the same partition.
* Round-robin → spreads messages evenly across partitions.
* Custom partitioner → application-defined placement logic.

**acks Levels**

Controls how many replica acknowledgments the leader requires before responding:

* `acks=0` — Fire-and-forget. No acknowledgement. Highest throughput, lowest durability (messages can be silently lost).
* `acks=1` — Leader writes to its log and responds. Default. Good durability, but a leader crash before replication can lose data.
* `acks=all` (or `-1`) — Leader waits for all in-sync replicas to acknowledge. Strongest durability, highest latency.

**Idempotent** **Producer**

Guarantees exactly-once semantics for writes, ensuring retries won’t create duplicates.

***

### **Message Ordering**

Within a partition, messages are strictly ordered by offset (FIFO). Across partitions, no ordering guarantee.

Key insight: Ordering requires a single partition, which limits parallelism. If you need per-key ordering (e.g., user events), use key-based routing to land all messages for the same key in the same partition.

***

### **Consumer**

#### **Group id**

**I**dentifies a consumer group. Consumers in the same group share the partitions of a topic. So if we have 3 consumer run on different server, the message that we consumed from the same group\_id are distributed among that 3 consumer

**Without consumer group (each instance gets ALL messages)**

```go
import (
	"github.com/twmb/franz-go/pkg/kgo"
)

// Service Instance 1
client1, _ := kgo.NewClient(
    kgo.SeedBrokers(brokers...),
    kgo.ConsumeTopics("orders"),
    // NO consumer group
)

// Service Instance 2  
client2, _ := kgo.NewClient(
    kgo.SeedBrokers(brokers...),
    kgo.ConsumeTopics("orders"),
    // NO consumer group
)

// Result: BOTH instances receive ALL messages from "orders" topic
// Message 1 → Instance 1 ✅
// Message 1 → Instance 2 ✅ (duplicate!)
// Message 2 → Instance 1 ✅
// Message 2 → Instance 2 ✅ (duplicate!)
```

**With consumer group (partitions are distributed)**

```go
// Service Instance 1
client1, _ := kgo.NewClient(
    kgo.SeedBrokers(brokers...),
    kgo.ConsumeTopics("orders"),
    kgo.ConsumerGroup("order-processor-group"),  // ← Same group
)

// Service Instance 2
client2, _ := kgo.NewClient(
    kgo.SeedBrokers(brokers...),
    kgo.ConsumeTopics("orders"),
    kgo.ConsumerGroup("order-processor-group"),  // ← Same group
)

// Result: Kafka splits partitions between instances
// Instance 1 gets: Partition 0, Partition 1
// Instance 2 gets: Partition 2, Partition 3
// Each message goes to ONLY ONE instance ✅
```

#### **Consumer offsets**

Consumer offsets is like a bookmark. For example we have 10 messages and we successfully commit message 0-4&#x20;

```
Messages in Kafka topic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

Consumer processes: 0, 1, 2, 3, 4
Consumer commits: offset 5 (meaning "I'm done up to 5")
Consumer crashes 💥

On restart:
- WITH commits: Starts from offset 5 → [5, 6, 7, 8, 9]
- WITHOUT commits: Starts from beginning → [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] (duplicates!)
```

#### Consumer Lag

The difference between the latest partition offset and the consumer’s committed offset — a measure of how "behind" a consumer is.

* If you have 1 partition and 2 consumers in the same group, Kafka gives the partition to Consumer A and leaves Consumer B idle. A single partition is only ever assigned to one consumer at a time

#### Group Coordinator&#x20;

Determine which broker to be Group Coordinator using this formula below:

$$Partition = | \text{Hash(group.id)} | \pmod{N}$$

A specific broker responsible for a consumer group.

* It tracks heartbeats from consumers to make sure they are still alive.
* It triggers a rebalance if a consumer joins or leaves.
* It stores the committed offsets for that group.

#### Rebalancing

When a consumer joins or leaves a group, Kafka redistributes partitions across the remaining consumers. This is called a rebalance.

* **Eager rebalancing** (old protocol): All consumers stop consuming, revoke all partitions, then rejoin and get reassigned. A "stop-the-world" event — no progress during rebalance.
* **Cooperative sticky rebalancing** (modern, Kafka ≥ 2.4): Consumers only revoke a subset of partitions, letting the rest continue processing. Fewer pauses, smoother transitions.

#### Consumer Commit Strategies

* `enable.auto.commit=true` (default): Offsets auto-committed every `auto.commit.interval.ms` (default 5s). If the consumer crashes between processing and auto-commit, messages are reprocessed — at-least-once semantics.
* Manual commit: Disable auto-commit, call `commitSync()` or `commitAsync()` explicitly.
  * `commitSync()` — blocking, retries on failure. Call after processing each batch.
  * `commitAsync()` — non-blocking, callback on failure. Higher throughput but no retry.

> Process → commit = at-least-once. Commit → process = at-most-once (messages lost on crash).

***

### **Performance**

**Throughput**&#x20;

* How to increase it: Add more Partitions and use larger Batches
* Usually measured in Megabytes per second (MB/s) or Messages per second (msg/s).

**Latency**

* The sum of (Producer Batching Time) + (Network Trip) + (Broker Disk Write) + (Consumer Processing Time).
* The Trade-off: Reducing latency (making it "Real-Time") often requires lowering your batch sizes, which can reduce your overall maximum throughput.

**Bottlenecks**

* The Producer Bottleneck: When the network or CPU can’t keep up with the data your app is generating.
* The Partition Bottleneck: When a single partition is overwhelmed by too many messages (often caused by a "Hot Key").
* The Consumer Bottleneck: The most common clog. This happens when your business logic (database writes, API calls) is slower than the incoming message rate.

> If your system hits a bottleneck, do not try to make a single thread faster. Instead, increase Throughput by adding more Partitions and Consumers to process the data in parallel.

***

### **Retention Policies**

How Kafka decides which data to delete:

* **Delete** (default): Remove old segments based on time (`retention.ms`, default 7 days) or total size (`retention.bytes`, default infinite). Oldest segments are deleted first.
* **Compact**: Keep only the latest message for each key. Useful for keyed data (e.g., user profile changes) where you only care about the current state. Log compaction runs in the background on inactive segments.

### **Compression**

Producers can compress message batches before sending:

* Supported codecs: `gzip`, `snappy`, `lz4`, `zstd`
* Benefits: Smaller network transfer, less disk usage
* Cost: Producer CPU for compression, consumer CPU for decompression
* Configurable on the producer side; Kafka stores and serves compressed batches as-is — decompression only happens on the consumer.

***

### **High Watermark (HW)**

The offset up to which all ISR replicas have committed. Consumers can only read up to HW — not the Log End Offset (LEO).

* When a leader receives a write, it advances LEO immediately but HW only advances once all in-sync followers have replicated the message.
* During leader failover, the new leader truncates to the HW of the old leader to guarantee consistency across replicas.
* Messages between HW and LEO are not visible to consumers — they exist on the leader but aren't fully replicated yet.

### **Reference**

* [Apache Kafka Documentation](https://kafka.apache.org/documentation/) — official configs, protocol, and design
* [KRaft (KIP-833)](https://cwiki.apache.org/confluence/display/KAFKA/KIP-833+Mark+KRaft+as+Production+Ready) — self-managed metadata quorum
* [Confluent Documentation](https://docs.confluent.io/kafka/) — practical guides and best practices
* "Kafka: The Definitive Guide" (O'Reilly) — Neha Narkhede, Gwen Shapira, Todd Palino
* [franz-go](https://github.com/twmb/franz-go) — Go client used in this document
