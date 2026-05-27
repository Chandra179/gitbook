# Software Architect Roadmap

From 4-YOE engineer to architect — 20 weeks, layered approach.

## Philosophy

**Decode → Implement Core → Extract Decisions.** An architect's job isn't building from scratch — it's evaluating, composing, and guiding. Reading production code and extracting architectural intent *is* the skill. Implementation only needs the algorithmic heart (~200-500 lines each).

## Phase 1: System Design Deep-Dive (Weeks 1-8)

Strengthen the foundation. For each topic: decode a battle-tested OSS project (Syncthing-depth), implement the core mechanism, extract ADRs.

Gitbook output per topic — same format as Syncthing:

```
[topic]-architecture.md
  ├── System model (CAP position, failure model, guarantees)
  ├── Architecture diagram (component + data flow, sequence diagrams)
  ├── Deep dive into core mechanism (traced through source code)
  ├── Key principles table
  ├── ADR extract
  ├── Trade-off matrix vs alternatives
  └── Source citations (file:line)
```

### Week 1-2: Raft Consensus

| Phase | Task |
|-------|------|
| Decode | **etcd** — Raft implementation, MVCC store, watch API, lease system |
| Build | Raft log replication + leader election (~300 lines Go) |
| ADR | Why Raft over Paxos? When is leader-based consensus the right choice? |

### Week 3-4: Distributed Replication

| Phase | Task |
|-------|------|
| Decode | **CockroachDB** — Multi-leader via Raft ranges, distributed SQL, read/write intents |
| Build | Range splitting + rebalancing (~200 lines Go) |
| ADR | Leader-follower vs multi-leader vs leaderless — trading consistency for availability |

### Week 5: Gossip Protocol

| Phase | Task |
|-------|------|
| Decode | **Hashicorp Memberlist** — SWIM gossip, failure detection, UDP piggybacking |
| Build | Ping-ack + indirect probe protocol (~200 lines Go) |
| ADR | Why gossip over centralized health checking? Tuning propagation delay vs bandwidth |

### Week 6: Log-Structured Storage

| Phase | Task |
|-------|------|
| Decode | **Apache Kafka** — Segment-based WAL, consumer groups, ISR replication, page cache |
| Build | Segment-based WAL with offset index (~300 lines Go) |
| ADR | Append-only log vs B-tree — write throughput vs read latency trade-off |

### Week 7: Single-Threaded Event Loop

| Phase | Task |
|-------|------|
| Decode | **Redis** — epoll/kqueue event loop, data structures, PSYNC replication, Sentinel failover |
| Build | Non-blocking event loop + RESP protocol parser (~200 lines Go) |
| ADR | Single-threaded vs multi-threaded — when does simplicity beat parallelism? |

### Week 8: Service Mesh

| Phase | Task |
|-------|------|
| Decode | **Envoy** — Thread model (worker + event loop per core), filter chains, xDS, connection pooling |
| Build | Minimal TCP proxy with filter chain (~200 lines Go) |
| ADR | Sidecar vs library — operational cost of out-of-process proxies |

---

## Phase 2: Architect Toolstack (Weeks 9-18)

Layer the architect artifacts on top of the system design foundation.

### Week 9-10: Architecture Decision Records

Extract 20+ ADRs from your existing docs (Syncthing, RAG, Psycho) and Phase 1 outputs.

ADR format:

```markdown
# ADR-###: Title

**Status:** Proposed | Accepted | Deprecated | Superseded

**Context:** What problem are we solving? What constraints exist?

**Decision:** What did we choose?

**Alternatives Considered:**
| Option | Pros | Cons | Why rejected |
|--------|------|------|--------------|

**Consequences:**
- Positive: what became easier
- Negative: what became harder / what debt did we take on
- Mitigations: how we handle the negatives

**References:** Design docs, papers, issues
```

### Week 11-12: Trade-Off Matrices

Convert implicit decisions into scored matrices. Every design choice gets a visible comparison table.

Pick 5 key decisions from your body of work. Model them:

| Criterion (weight) | Option A | Option B | Option C |
|---------------------|----------|----------|----------|
| | | | |

### Week 13-14: Quality Attribute Scenarios

Architects write *measurable* non-functional requirements, not abstract -ilities.

```
BAD:  "The system should be scalable"
GOOD: "When traffic grows from 1K to 100K concurrent connections,
       p99 latency remains under 50ms without adding more than
       2× the current infrastructure cost"
```

Write 3 scenarios for every system design doc you have (Syncthing, RAG, Psycho, + Phase 1 outputs).

### Week 15: Cost Modeling

| Phase | Task |
|-------|------|
| Build | A cost model for one of your systems (RAG or Psycho) — compute instances, storage tiers, network egress, CDN |
| ADR | Cloud vs self-hosted — when does the crossover point justify the operational burden? |

### Week 16-17: Architecture Evaluation

| Phase | Task |
|-------|------|
| Study | ATAM (Architecture Trade-off Analysis Method) — utility trees, sensitivity points, risk themes |
| Apply | Run an ATAM-style evaluation on your Psycho architecture against its stated quality attributes |
| Output | Risk themes + mitigation strategies |

### Week 18: Architecture Katas

| Phase | Task |
|-------|------|
| Practice | 3 timed katas (45 min each): written design with diagrams, ADRs, trade-off rationales |
| Review | Self-review against quality attributes — what did you miss under time pressure? |

---

## Phase 3: Communication Artifacts (Weeks 19-20)

The skills architects use to influence without authority.

### Week 19: Architecture Documentation

Write a full Architecture Description Document (ADD) for one system:

1. **Context view** — System in its environment (C4 Level 1)
2. **Container view** — Deployable units, data stores (C4 Level 2)
3. **Component view** — Internal module boundaries (C4 Level 3)
4. **Runtime view** — Sequence diagrams for key use cases
5. **Deployment view** — Infrastructure topology
6. **Data view** — Schema, storage choices, data flows

### Week 20: Reverse-Engineer an Architecture Document

Convert your Syncthing deep-dive into a full ADD. You have the raw material — now structure it as an architect would present it to stakeholders.

---

## Gitbook Structure

Add these to `fundamental/`:

```
fundamental/
  adr.md                   # ADR format + examples from your work
  quality-attributes.md    # Scenario format, utility trees, measurement
  trade-off-matrices.md    # Decision matrix template + worked examples
  cost-modeling.md         # Cloud cost estimation, build vs buy
  architecture-patterns.md # Pattern families (decomposition, integration, data, resilience)
  c4-model.md              # Diagramming standard
  atam.md                  # Architecture evaluation method
  architecture-katas.md    # Completed kata exercises with self-review
```

## Meta-Routine (Every Week)

- **Diagram first.** Data flow, sequence, component — before you write, draw.
- **Cite sources.** Bibliographic rigour is your differentiator. Don't stop doing this.
- **Connect domains.** Your Golang scheduler knowledge *explains* Syncthing's goroutine-per-stream design. Cross-pollinate consciously.
- **One ADR minimum.** Every week, extract one architectural decision into the ADR format. Even for systems you didn't build — reverse-engineer the decisions.

## Reading List

By phase, in priority order:

| Phase | Book | Chapters |
|-------|------|----------|
| 1 | *Designing Data-Intensive Applications* (Kleppmann) | 5-9 (replication, partitioning, transactions, consistency, consensus) |
| 1 | *Database Internals* (Petrov) | 1-4 (storage engines, B-trees, LSM trees) |
| 2 | *Software Architecture in Practice* (Bass, Clements, Kazman) | 4-7 (quality attributes, tactics, utility trees) |
| 2 | *Fundamentals of Software Architecture* (Richards, Ford) | All (architecture characteristics, quanta, governance) |
| 3 | *Architecture Decisions Demystified* — short, pragmatic read | All |
| 3 | C4 Model — c4model.com | All |

## End State (Week 20+)

You will have:

- 8 deep-dive architecture documents (Phase 1)
- 20+ ADRs traceable to specific design decisions
- 15+ trade-off matrices
- 30+ measurable quality attribute scenarios
- 1 full Architecture Description Document
- 3 completed architecture katas
- 1 ATAM evaluation
- 1 cost model

All in your gitbook. All source-cited. All written at Syncthing depth.

This is an architect's portfolio — not a CV, not a GitHub profile, but a body of *demonstrated architectural reasoning*.
