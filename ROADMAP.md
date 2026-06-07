# Systems Knowledge Roadmap

**Goal:** Systematic deep-dive coverage from hardware through distributed systems — every layer of a complete computing system, with focus on internal operations, not just surface concepts.

## Legend
- **📗 Covered** — has a page (may need updates)
- **📘 Partial** — has some content, needs expansion
- **📕 Missing** — not written yet
- **🔵 Priority** — most relevant to Go / distributed systems / fintech background

---

## Layer 0: Computer Architecture

*How hardware actually executes code — CPU, memory, storage.*

| Topic | Status | Notes |
|-------|--------|-------|
| CPU pipeline (fetch/decode/execute, superscalar, OoO) | 📕 | |
| CPU cache hierarchy (L1/L2/L3, cache lines, associativity, MESI) | 📘 Partial | Computing.md covers basics |
| Branch prediction & speculative execution | 📕 | |
| Memory hierarchy (RAM, NUMA, memory controller, channels) | 📘 Partial | Computing.md covers basics |
| SIMD / vector instructions | 📕 | |
| **🔵 Storage: SSD internals** (NAND flash, FTL, wear leveling, GC, NVMe queues) | 📕 | Relevant to database I/O perf |
| PCIe topology & device passthrough | 📕 | |
| Interrupts (MSI-X, IRQ balancing, interrupt coalescing) | 📕 | |

---

## Layer 1: Operating Systems

*What happens between your code and the hardware — kernel, scheduler, memory, I/O.*

| Topic | Status | Notes |
|-------|--------|-------|
| **🔵 Virtual memory** (page tables, TLB, huge pages, MMU, page faults) | 📕 | Critical for Go & DB perf |
| **🔵 Process vs thread** (TCB, context switch cost, thread models) | 📕 | Complements goroutine page |
| **🔵 Linux scheduler** (CFS, sched_ext, priority, preemption) | 📕 | Affects Go scheduler design |
| **🔵 I/O models** (blocking, non-blocking, epoll, kqueue, IOCP) | 📕 | Go's netpoller uses epoll/kqueue |
| **🔵 io_uring** (SQ/CQ rings, submission/completion, zero-copy) | 📕 | Modern Linux I/O, very relevant |
| File systems (VFS, ext4, XFS, inodes, journalling, btrfs) | 📕 | |
| mmap vs read/write (page cache, buffer cache, direct I/O) | 📕 | |
| Kernel bypass (DPDK, XDP, eBPF) | 📕 | |
| cgroups, namespaces, container isolation | 📕 | |
| /proc, /sys, perf, strace, flamegraphs | 📕 | |

---

## Layer 2: Networking (Deep)

*Beyond HTTP basics — what packets actually do.*

| Topic | Status | Notes |
|-------|--------|-------|
| **🔵 TCP internals** (3WHS, sequence/ack, windowing, Nagle, delayed ACK) | 📕 | Must-know for Go services |
| **🔵 TCP congestion control** (CUBIC, BBR, Reno, slow start, ssthresh) | 📕 | |
| **🔵 QUIC / HTTP/3** (connection migration, 0-RTT, stream multiplexing) | 📘 Partial | Brief table in networking.md |
| **🔵 TLS 1.3** (handshake, key exchange, 0-RTT, session tickets) | 📕 | |
| DNS resolution (recursive, stub resolver, NS records, EDNS) | 📕 | |
| BGP / anycast (how internet routing works) | 📕 | |
| **🔵 OS socket buffer & backlog** (somaxconn, tcp_rmem, tcp_tw_reuse) | 📕 | Tuning for high-throughput Go |
| HTTP/2 frames & HPACK | 📕 | |
| gRPC (HTTP/2, protobuf wire, stream lifecycle) | 📕 | |
| Load balancing algorithms (round-robin, least-conn, consistent hash, maglev) | 📕 | |

---

## Layer 3: Languages & Runtimes

*How your code gets executed — Go runtime, compilers, GC, concurrency primitives.*

| Topic | Status | Notes |
|-------|--------|-------|
| **🔵 Go scheduler** (GPM model, work stealing, syscall handoff, async preemption) | 📗 Covered | goroutine.md covers this |
| **🔵 Go memory allocator** (mcache, mspan, arenas, TCmalloc origins) | 📕 | |
| **🔵 Go GC** (concurrent, tri-color, write barrier, GC percentage, pacer) | 📕 | Partial mentions only |
| **🔵 Go channels & select** (hchan struct, sendq/recvq, runtime·selectgo) | 📘 Partial | Covered in goroutine.md |
| **🔵 Go interfaces & reflection** (itab, eface, iface, reflect internals) | 📕 | |
| Go compiler (SSA, inlining, escape analysis, bounds check elimination) | 📕 | |
| **🔵 Go memory model** (happens-before, sync atomics, compiler reordering) | 📕 | |
| Go module system (MVS, GONOSUMCHECK, checksum DB) | 📕 | |
| Go netpoller (non-blocking I/O, goroutine-per-connection vs reactor) | 📕 | |
| Go pprof / trace / execution tracer | 📕 | |
| cgo (calling convention, goroutine stack limits, callback) | 📕 | |
| Compiler design (lexing, parsing, IR, codegen) | 📕 | |
| Generic runtimes (stack vs register VM, JIT vs AOT, EH) | 📕 | |
| Lock-free programming (CAS, ABA, memory ordering, RCU) | 📕 | |

---

## Layer 4: Databases (Deep)

*Storage engines, transactions, replication, distributed coordination.*

| Topic | Status | Notes |
|-------|--------|-------|
| Taxonomy & indexing | 📗 Covered | taxonomy-and-indexing.md |
| **🔵 B+Tree internals** (page splits, merges, buffer pool, locking) | 📗 Covered | storage-and-algorithms.md |
| **🔵 LSM-Tree internals** (SSTables, compaction strategies, bloom filters) | 📗 Covered | storage-and-algorithms.md |
| **🔵 MVCC** (visibility rules, vacuum, tuple/row versions, OID/XMIN) | 📗 Covered | concurrency-and-scaling.md |
| **🔵 WAL / crash recovery** (ARIES, REDO/UNDO, fuzzy checkpoint) | 📘 Partial | |
| Query optimization (cost estimation, join order, stats, histograms) | 📗 Covered | query-and-optimization.md |
| **🔵 Distributed transactions** (2PC, 3PC, Saga, TCC, XA) | 📕 | |
| **🔵 Consensus: Paxos** (classic, Multi-Paxos, Fast Paxos) | 📕 | Have Raft, not Paxos |
| **🔵 Consensus: Raft** (leader election, log replication, safety) | 📗 Covered | etcd-raft.md |
| **🔵 Gossip protocols** (SWIM, phi accrual, lifeguard) | 📘 Partial | Cassandra page covers some |
| Partitioning (consistent hashing, range, hash, virtual nodes) | 📗 Covered | consistent-hashing.md |
| PostgreSQL deep dive | 📗 Covered | deep-dives/postgresql.md |
| MongoDB deep dive | 📗 Covered | deep-dives/mongodb.md |
| Redis deep dive | 📗 Covered | deep-dives/redis.md |
| Cassandra deep dive | 📗 Covered | deep-dives/cassandra.md |
| Spanner deep dive | 📗 Covered | deep-dives/spanner.md |

---

## Layer 5: Distributed Systems

*Coordinating multiple machines — consensus, coordination, streaming, scheduling.*

| Topic | Status | Notes |
|-------|--------|-------|
| **🔵 Coordination services** (etcd vs ZK vs Consul, leasing, watches, sessions) | 📘 Partial | etcd-raft.md exists |
| **🔵 Stream processing** (Kafka internals: ISR, log compaction, partitioning) | 📗 Covered | kafka.md |
| Kafka vs Pulsar comparison | 📕 | |
| **🔵 Distributed scheduling** (leader election, cron, rate limiting, quota) | 📘 Partial | task-scheduler.md exists |
| **🔵 CQRS / Event Sourcing** (event store, projection, snapshotting) | 📕 | |
| **🔵 Circuit breakers** (Hystrix, resilience4j, half-open, exponential backoff) | 📕 | |
| **🔵 Distributed caching** (Memcached vs Redis cluster, cache invalidation patterns) | 📘 Partial | distributed-cache.md |
| **🔵 Distributed tracing** (Dapper, OpenTelemetry, sampling, context propagation) | 📕 | |
| **🔵 Chaos engineering** (fault injection, Jepsen, network partitions) | 📕 | |
| **🔵 Rate limiting algorithms** (token bucket, leaky bucket, sliding window, GCRA) | 📗 Covered | rate-limit.md |
| ID generation (Snowflake, Sonyflake, ULID, UUID v7) | 📗 Covered | id-generator.md |

---

## Layer 6: Infrastructure & Operations

*Running systems in production — containers, orchestration, observability.*

| Topic | Status | Notes |
|-------|--------|-------|
| **🔵 Docker internals** (cgroups v2, namespaces, overlayfs, seccomp, capabilities) | 📕 | |
| **🔵 Kubernetes internals** (scheduler, controller manager, kubelet, kube-proxy, API server) | 📕 | |
| **🔵 Service mesh** (Envoy, sidecar proxy, xDS protocol, mTLS) | 📕 | |
| **🔵 Observability** (metrics: Prometheus + OpenMetrics; logs: structured vs unstructured; traces: OTel) | 📕 | |
| **🔵 Monitoring & alerting** (SLI/SLO/SLA, burn rate, MTTD/MTTR, on-call) | 📕 | |
| **🔵 Container networking** (CNI, iptables, IPVS, eBPF, Cilium) | 📕 | |
| **🔵 Secret management** (Vault, Kubernetes secrets, KMS, hardware HSM) | 📕 | |
| Disaster recovery (backup strategies, RTO/RPO, cross-region, active-active) | 📕 | |

---

## Priority Order (Recommended)

Given your Go + distributed-systems + fintech background:

| Phase | Focus | Why |
|-------|-------|-----|
| **1** | **OS internals** (virtual memory, I/O models, io_uring, scheduler) | Foundation for everything — Go runtime design mirrors OS concepts |
| **2** | **TCP / networking deep** (congestion control, socket tuning, QUIC) | You write networked Go services every day |
| **3** | **Go runtime internals** (allocator, GC, scheduler deep, pprof) | Complements your goroutine page; debugging prod issues |
| **4** | **Distributed systems** (Paxos, CQRS/ES, stream processing, distributed transactions) | Fills the gap above what you already know |
| **5** | **Infrastructure** (containers, K8s, observability, service mesh) | Where all of the above runs |
| **6** | **Hardware / architecture** (SSD, CPU pipeline, NUMA) | Performance optimization at the bottom layer |

Skip in order if you'd rather jump around — but OS and Networking deep are the biggest force multipliers for your daily work.
