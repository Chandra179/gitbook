# Kafka

#### **Big Picture**

* **Cluster**: The entire server infrastructure; a group of Brokers working together to provide high availability and scalability.
* **Broker**: A physical server or container within the cluster that stores and manages data. A cluster usually has multiple brokers so if one fails, the system stays online.
* **Topic**: A logical name or "folder" where you send and categorize data (e.g., `user-signups` or `payments`).
* **Partition**: The actual physical "slice" of a Topic. Partitions are distributed across different Brokers to allow multiple producers and consumers to work at the same time.
* **Offset**: A unique, sequential "line number" or bookmark assigned to every message inside a Partition.
* **Producer**: Your application that publishes data to a Topic. It uses a Balancer (like `LeastBytes` or `Hash`) to decide which partition the message lands in.
* **Consumer**: Your application that reads data from a Topic.
* **Consumer Group ID**: The "identity" or team name for your consumers. It determines how messages are shared:
  * Same Group ID: Consumers work as a single team. Kafka divides the Partitions among them so each message is processed exactly once (No duplicates).
  * Unique Group ID: Every group acts as a separate department, receiving its own complete copy of every message (Fan-out).
  * The Group ID is Cluster-wide, not Broker-wide.
* **Partition Max (Scale)**: The number of partitions per topic limits your maximum parallelism. If a topic has 3 partitions, only 3 consumers in the same Group ID can work simultaneously; any extra consumers will sit idle.

#### **Cluster**

* Cluster: A set of Kafka brokers working together.

#### **Broker**

A Kafka server that stores data and serves client requests. A cluster typically has multiple brokers. Each broker handles some partitions and can be either a leader or follower for them.

#### **Controller**

One broker in the cluster acts as the controller. It manages partition leadership, reassignments, and handles broker failures.

#### **Topics**

A logical stream of data identified by a name. Topics are divided into partitions for scalability and parallelism.

#### **Producers**

It writes messages into Kafka topics.

Idempotent Producer: Guarantees exactly-once semantics for writes, ensuring retries won’t create duplicates.

How do we know which Partition it goes to?

* Key-based hash → ensures messages with the same key always land in the same partition.
* Round-robin → spreads messages evenly across partitions.
* Custom partitioner → application-defined placement logic.

#### **Partition**

A single ordered log within a topic. Each partition is immutable and append-only.&#x20;

* These partitions are spread across the different brokers in the cluster. This is how Kafka handles more data than a single server's hard drive can hold.
* Because a topic is split into partitions, multiple consumers can read from different brokers at the same time.

#### **Consumers**

* Subscriber: Application that reads messages from Kafka topics.
* group.id: Identifies a consumer group. Consumers in the same group share the partitions of a topic.
* \_\_consumer\_offsets: An internal topic where committed offsets (read positions) are stored.
* Offset Commit: The act of saving the last processed record’s position to ensure reliable recovery. All consumers in the same Group ID share the same bookmark for a partition.
* Consumer Lag: The difference between the latest partition offset and the consumer’s committed offset — a measure of how "behind" a consumer is.
* If you have 1 partition and 2 consumers in the same group, Kafka gives the partition to Consumer A and leaves Consumer B idle. A single partition is only ever assigned to one consumer at a time
* idempotent consumer, atomic transactions
