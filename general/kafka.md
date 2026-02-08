# Kafka

### **Big Picture**

**Cluster**

The entire server infrastructure; a group of Brokers working together to provide high availability and scalability.

**Broker**

A physical server or container within the cluster that stores and manages data. Each broker handles some partition and either leader or follower

**Topic**

A logical name or "folder" where you send and categorize data (e.g., `user-signups` or `payments`).

**Partition**

The actual physical "slice" of a Topic. Partitions are distributed across different Brokers to allow multiple producers and consumers to work at the same time.

**Offset**

A unique, sequential "line number" or bookmark assigned to every message inside a Partition.

**Producer**

Your application that publishes data to a Topic. It uses a Balancer (like `LeastBytes` or `Hash`) to decide which partition the message lands in.

How do we know which Partition it goes to?\
Key-based hash → ensures messages with the same key always land in the same partition.\
Round-robin → spreads messages evenly across partitions.\
Custom partitioner → application-defined placement logic.

**Idempotent** **Producer**

Guarantees exactly-once semantics for writes, ensuring retries won’t create duplicates.

**Consumer**

* group.id: Identifies a consumer group. Consumers in the same group share the partitions of a topic.
* \_\_consumer\_offsets: An internal topic where committed offsets (read positions) are stored.
*   Offset Commit: The act of saving the last processed record’s position to ensure reliable recovery. All consumers in the same Group ID share the same bookmark for a partition.<br>

    ```
    Messages in Kafka topic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

    Consumer processes: 0, 1, 2, 3, 4
    Consumer commits: offset 5 (meaning "I'm done up to 4")
    Consumer crashes 💥

    On restart:
    - WITH commits: Starts from offset 5 → [5, 6, 7, 8, 9]
    - WITHOUT commits: Starts from beginning → [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] (duplicates!)
    ```
* Consumer Lag: The difference between the latest partition offset and the consumer’s committed offset — a measure of how "behind" a consumer is.
*   **Without consumer group (each instance gets ALL messages):**

    ```go
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
*   **With consumer group (partitions are distributed):**

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
* If you have 1 partition and 2 consumers in the same group, Kafka gives the partition to Consumer A and leaves Consumer B idle. A single partition is only ever assigned to one consumer at a time
* idempotent consumer, atomic transactions

Performance

**Throughput**&#x20;

* How to increase it: Add more Partitions (more lanes) and use larger Batches (bigger trucks).
* The Metric: Usually measured in Megabytes per second (MB/s) or Messages per second (msg/s).

**Latency**

* End-to-End Latency: The sum of (Producer Batching Time) + (Network Trip) + (Broker Disk Write) + (Consumer Processing Time).
* The Trade-off: Reducing latency (making it "Real-Time") often requires lowering your batch sizes, which can reduce your overall maximum throughput.

**Bottlenecks**

* The Producer Bottleneck: When the network or CPU can’t keep up with the data your app is generating.
* The Partition Bottleneck: When a single partition is overwhelmed by too many messages (often caused by a "Hot Key").
* The Consumer Bottleneck: The most common clog. This happens when your business logic (database writes, API calls) is slower than the incoming message rate.

> If your system hits a bottleneck, do not try to make a single thread faster. Instead, increase Throughput by adding more Partitions and Consumers to process the data in parallel.
