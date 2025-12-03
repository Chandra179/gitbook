# Kafka

#### **Broker**

A Kafka server that stores data and serves client requests. A cluster typically has multiple brokers. Each broker handles some partitions and can be either a leader or follower for them.

#### **Controller**

One broker in the cluster acts as the controller. It manages partition leadership, reassignments, and handles broker failures.

#### **Topics**

A logical stream of data identified by a name. Topics are divided into partitions for scalability and parallelism.

#### **Partition**

A single ordered log within a topic. Each partition is immutable and append-only. Data within a partition is replicated across brokers for fault tolerance.

#### **Producers**

Publisher: Application that writes messages into Kafka topics.

Idempotent Producer: Guarantees exactly-once semantics for writes, ensuring retries won’t create duplicates.

Partitioning Strategy:

* Key-based hash → ensures messages with the same key always land in the same partition.
* Round-robin → spreads messages evenly across partitions.
* Custom partitioner → application-defined placement logic.

#### **Consumers**

* Subscriber: Application that reads messages from Kafka topics.
* group.id: Identifies a consumer group. Consumers in the same group share the partitions of a topic.
* \_\_consumer\_offsets: An internal topic where committed offsets (read positions) are stored.
* Offset Commit: The act of saving the last processed record’s position to ensure reliable recovery.
* Consumer Lag: The difference between the latest partition offset and the consumer’s committed offset — a measure of how "behind" a consumer is.

#### **Cluster**

* Cluster: A set of Kafka brokers working together.
