# Kafka

### **Cluster**

A group of Brokers working together to provide high availability and scalability. 1 cluster can have 1 or more broker

### **Broker**

A physical server or container within the cluster that stores and manages data.

* **Partition Leader**: For every partition, one broker is elected as the "Leader." It handles all read and write requests for that partition.
* **Partition Follower**: Other brokers acting as "Followers" replicate the leader's data. If the leader fails, a follower automatically steps up to become the new leader.

### **Topic**

A logical name or "folder" where you send and categorize data (e.g., `user-signups` or `payments`). A topic can have 0 or more partition depends on configuration. Partitions are distributed across different Brokers to allow multiple producers and consumers to work at the same time.

### **Producer**

We push message with topic tied to it. Lets say the topic have 3 partition how the system know where to route this message into which partition 1, 2 or 3?

* Key-based hash → ensures messages with the same key always land in the same partition.
* Round-robin → spreads messages evenly across partitions.
* Custom partitioner → application-defined placement logic.

**Idempotent** **Producer**

Guarantees exactly-once semantics for writes, ensuring retries won’t create duplicates.

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
