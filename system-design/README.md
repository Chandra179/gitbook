# System Design

### **Core**

**Scalable**

handling growth, vertical & horizontal scaling

**Reliability and availability**

ensure your system stays operational. This involves redundancy, failover mechanisms, and concepts like uptime percentages (99.9% vs 99.99% makes a real difference).

**Performance**

latency and throughput. how fast your system responds and how much work it can handle. You'll optimize these through caching, efficient databases, and smart architectural choices.

**Fault tolerance**

retry mechanism, fallback

### Building Blocks

* Load balancers to distribute traffic
* When to use db SQL & NoSQL
* When to use caching (redis, memcached)
* When to use message queue
* CAP theorem (consistency, availability, partition tolerance)
* Database sharding (split data accross multiple db)
* Database replication for redundancy
* CDNs for serving static content globally
* Data consistency model (eventual, strong)
* API design (rest, grpc, ratelimit, versioning, authorize, etc..)
* Monitioring, logging, metrics, security, etc..
