# Roadmap

## Software Engineer

### Phase 0: Solidify the Core (2–3 weeks)

You already know most of this, but a quick refresh with advanced practice will cement your foundation.

| Topic                                       | Key Gaps to Fill                                                        | Resources                                                                                                                                                                                                                                                   | Hands‑on Project                                                                                                                                                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Go concurrency deeper**                   | `singleflight` (you know it), `errgroup`, `semaphore`, custom scheduler | <p>• Blog: <a href="https://go.dev/blog/pipelines">Go Concurrency Patterns (Pipelines &#x26; cancellation)</a><br>• <a href="https://github.com/uber-go/guide">Uber Go Style Guide</a></p>                                                                  | **Project:** Build a **parallel downloader** that fetches 1000 files in chunks using worker pools, rate limiting, and retries with exponential backoff. Use `singleflight` to deduplicate identical requests. |
| **Linux systems & performance**             | `strace`, `perf`, `eBPF` basics, `netstat`, `ss`, `iostat`              | <p>• Book: <em>Systems Performance</em> (Brendan Gregg) – Chapter 1–4<br>• <a href="https://ebpf.io/what-is-ebpf/">BPF and eBPF official docs</a></p>                                                                                                       | **Project:** Write a tiny eBPF program (using `bcc` Python or C) that traces `openat` syscalls in your Go service and logs file access latency.                                                               |
| **Design patterns for distributed systems** | Circuit breaker, retry with jitter, bulkhead, health endpoint           | <p>• <a href="https://learn.microsoft.com/en-us/azure/architecture/patterns/">Microsoft Resilience Patterns</a><br>• Blog: <a href="https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/">Exponential Backoff and Jitter (AWS)</a></p> | **Project:** Enhance your previous `singleflight` project with a circuit breaker (fail fast) and a health check endpoint. Use `go‑kit` or roll your own.                                                      |

***

### Phase 1: Deep Distributed Systems – Master the Classics (5–6 weeks)

These are the non‑negotiable topics for senior roles in platform/infra.

#### 1.1 Consensus & Replication

| Resource                                                                                                                                                                                                                                                                    | Type    | Key Takeaway                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| _Designing Data‑Intensive Applications_ (Kleppmann) – Chapters 5, 6, 7, 9                                                                                                                                                                                                   | Book    | The bible for replication, partitioning, transactions, and consensus. |
| [Raft paper (Extended version)](https://raft.github.io/raft.pdf)                                                                                                                                                                                                            | Paper   | Understand leader election, log replication, safety.                  |
| [ZooKeeper’s atomic broadcast (ZAB)](https://zookeeper.apache.org/doc/current/zookeeperInternals.html)                                                                                                                                                                      | Article | Practical consensus in production.                                    |
| [Consistent Hashing (original paper)](https://www.akamai.com/us/en/multimedia/documents/technical-publication/consistent-hashing-consistent-hashing-and-random-trees-distributed-caching-protocols-for-relieving-hot-spots-on-the-world-wide-web-technical-publication.pdf) | Paper   | You know the concept – now read the paper.                            |

**Project 1.1 – Build a minimal Raft library in Go**\
Implement leader election and log replication. Use gRPC for communication. Do not use external libraries.\
&#xNAN;_&#x44;eliverable:_ A key‑value store that tolerates 1 out of 3 node failures.

**Project 1.2 – Consistent hash ring with virtual nodes and replication**\
Extend your distributed cache design (from your notes) into a runnable Go service. Support adding/removing nodes without massive remapping. Use a gossip protocol (e.g., memberlist) for node discovery.\
&#xNAN;_&#x53;tretch goal:_ Add data replication factor = 2.

#### 1.2 Distributed Transactions & Sagas

| Resource                                                                                                                              | Type  |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| [Saga pattern (original paper)](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf)                                      | Paper |
| [Google Percolation (database transactions at scale)](https://storage.googleapis.com/pub-tools-public-publication-data/pdf/36726.pdf) | Paper |
| Book: _Software Architecture: The Hard Parts_ (Ford, Richards) – Chapter on Sagas                                                     | Book  |

**Project 1.3 – Travel booking saga**\
Three services: Flight, Hotel, Payment. Each has a `book` and `cancel` operation. Implement a saga orchestrator (using Temporal – you already know it!) that coordinates a trip booking. If flight fails, run compensating transactions.\
&#xNAN;_&#x44;eliverable:_ Idempotent steps, with a dead letter queue for failed compensations.

#### 1.3 Observability – The Senior Engineer’s Force Multiplier

| Resource                                                                                                                    | Type          |
| --------------------------------------------------------------------------------------------------------------------------- | ------------- |
| [Google Dapper paper (distributed tracing)](https://storage.googleapis.com/pub-tools-public-publication-data/pdf/36356.pdf) | Paper         |
| [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/)                                                    | Documentation |
| [USE method (Brendan Gregg)](https://www.brendangregg.com/usemethod.html)                                                   | Methodology   |

**Project 1.4 – Instrument a microservices app**\
Take a simple 3‑service app (e.g., order, payment, notification). Add OpenTelemetry traces, metrics (Prometheus), and logs (structured JSON). Export to Jaeger and Grafana. Write a dashboard that shows latency percentiles (p99) and error rates per service.\
&#xNAN;_&#x53;tretch:_ Use exemplars to link traces to metrics.

***

### Phase 2: AI Infrastructure – Your Future Edge (5–6 weeks)

You already built a RAG pipeline. Now go deeper into the platform aspects of serving, scaling, and managing LLMs.

#### 2.1 LLM Serving Systems

| Resource                                                                                      | Type                                        |
| --------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [vLLM paper (OSDI 2023)](https://www.usenix.org/conference/osdi23/presentation/kwon)          | Paper – PagedAttention, continuous batching |
| [TensorRT‑LLM architectural overview](https://github.com/NVIDIA/TensorRT-LLM)                 | GitHub docs                                 |
| [Hugging Face TGI architecture](https://github.com/huggingface/text-generation-inference)     | GitHub                                      |
| [Blog post: “How to serve LLMs at scale” (together.ai)](https://together.ai/blog/llm-serving) | Article                                     |

**Project 2.1 – Wrapper for vLLM with caching**\
Deploy vLLM locally with a model (e.g., Llama 3.2 1B). Write a Go service in front that:

* Caches exact‑match prompts in Redis (LRU)
* Rate‑limits per API key (token bucket)
* Implements request coalescing (singleflight) for the same prompt while the model is computing\
  &#xNAN;_&#x52;esult:_ A production‑like LLM gateway.

**Project 2.2 – Multi‑model router**\
Extend the gateway to route requests based on:

* Prompt length → short prompts go to a small model (fast/cheap), long → big model
* Priority: high‑priority (OTP) goes to reserved capacity\
  Implement circuit breakers if a model endpoint fails.\
  &#xNAN;_&#x53;tretch:_ Use consistent hashing on the prompt to stick the same user to the same model shard for better cache locality.

#### 2.2 LLM Observability & Evaluation

| Resource                                                                                   | Type         |
| ------------------------------------------------------------------------------------------ | ------------ |
| [RAGAS paper](https://arxiv.org/abs/2309.15217)                                            | Paper        |
| [Lil’Log – Prompt Engineering & RAG](https://lilianweng.github.io/posts/2023-06-23-agent/) | Blog         |
| [LangSmith / Phoenix documentation](https://docs.smith.langchain.com/)                     | Product docs |

**Project 2.3 – RAG evaluation pipeline**\
Improve your existing Nadir/Greenclaw RAG system:

* Add evaluation metrics: Faithfulness, Answer Relevancy, Context Recall
* Run 100 test queries, log each run’s scores in PostgreSQL
* Build a Grafana dashboard to track average scores over time

**Project 2.4 – Semantic cache for embeddings**\
Instead of caching only exact prompts, implement a **semantic cache** using a vector DB (pgvector or Qdrant). For a new query, find the top‑k most similar previous queries and return cached answer if similarity > threshold.\
&#xNAN;_&#x43;hallenges:_ Deciding the threshold, handling false positives.

#### 2.3 LLM Agents & Workflows

| Resource                                                                          | Type    |
| --------------------------------------------------------------------------------- | ------- |
| [ReAct paper (reason + act)](https://arxiv.org/abs/2210.03629)                    | Paper   |
| [Google’s “Chain of Thought” paper](https://arxiv.org/abs/2201.11903)             | Paper   |
| [Temporal’s LLM workflows (blog)](https://temporal.io/blog/llm-workflow-patterns) | Article |

**Project 2.5 – Customer support agent using Temporal**\
Build a workflow that:

1. Receives a user query
2. Calls an LLM to classify intent (refund, order status, product info)
3. Routes to a sub‑workflow (e.g., `RefundWorkflow` that checks order DB)
4. Returns answer to user\
   Use Temporal for durable execution – if the LLM API times out, resume from last step.\
   &#xNAN;_&#x53;tretch:_ Add human‑in‑the‑loop for sensitive actions (e.g., “refund > $100 requires approval”).

***

### Phase 3: Advanced Systems Design – Staff Level Preparation (4 weeks)

Now you design systems that span many of the components you’ve studied.

#### 3.1 Materials & Case Studies

| Resource                                                                                                                                                      | Type                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| [Google File System paper](https://storage.googleapis.com/pub-tools-public-publication-data/pdf/035fc8.pdf)                                                   | Paper                |
| [Apache Kafka architecture (original paper)](https://notes.stephenholiday.com/Kafka.pdf)                                                                      | Paper                |
| [Uber’s “Domain Oriented Microservices” article](https://www.uber.com/en-DE/blog/microservice-architecture/)                                                  | Article (design doc) |
| [Discord’s “Why we switched from Go to Rust”](https://discord.com/blog/why-discord-is-switching-from-go-to-rust) (but you’ll note they kept many Go services) | Blog                 |
| [Real‑world design docs: Airbnb’s “Dynamic Pricing”](https://medium.com/airbnb-engineering/dynamic-pricing-2e7b6ebb1b6d)                                      | Tech blog            |

**Exercise (no coding):** Write a 2‑page design doc for each of:

* _YouTube watch time counter_ (consistent hashing, counter with eventual consistency)
* _Distributed cron job scheduler_ (leader election, lease, fault tolerance)
* _LLM batch inference platform_ (scheduling, batching, results storage)

Use a template: **Context, Requirements (functional/non‑functional), High‑level design, API, Data model, Trade‑offs, Failure modes.**

#### 3.2 Capstone Project (2–3 weeks)

**Project 3 – AI‑Native Distributed Cache**\
Build a distributed cache (like your earlier design) but specialized for LLM embeddings:

* Keys are embedding vectors (instead of strings) – use LSH (locality‑sensitive hashing) to route keys to nodes
* Support approximate nearest neighbor (ANN) search directly in the cache (no separate vector DB)
* Implement “semantic TTL” – items that are semantically similar remain in cache longer
* Write a design doc for it, then implement a minimal prototype in Go

This project touches: consistent hashing (for vectors), replication, failure detection, and machine learning – a perfect staff‑level showcase.

***

### Phase 4: Soft Skills & Career (ongoing)

To get the senior/staff title, you need influence beyond code.

| Skill                      | Resource                                                                                                                                                        | Action                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Writing design docs**    | Book: _Writing Effective Engineering Design Docs_ (Google internal, but [this public template](https://www.industrialempathy.com/posts/design-docs-at-google/)) | Refactor your past projects into design docs. Publish them on your GitBook. |
| **Leading projects**       | [StaffEng.com – “Arbitration”](https://staffeng.com/guides/arbitration/)                                                                                        | Interview yourself: “What trade‑off did I force my team to accept?”         |
| **Technical interviewing** | _System Design Interview_ (Alex Xu) Vol 1 & 2                                                                                                                   | Practice 2 designs/week whiteboarded.                                       |

***

### How to Prioritise – The 3‑Month High‑Impact Sprint

If you have limited time, do **only these**:

| Week  | Focus                              | Project Output                       |
| ----- | ---------------------------------- | ------------------------------------ |
| 1–2   | Consensus (Raft)                   | Minimal Raft key‑value store         |
| 3–4   | AI Gateway (vLLM wrapper)          | Caching + rate limiting + coalescing |
| 5–6   | Semantic cache (vector similarity) | RAG system with semantic cache       |
| 7–8   | Saga with Temporal                 | Travel booking saga                  |
| 9–10  | Capstone: AI distributed cache     | Prototype with LSH routing           |
| 11–12 | Design docs & interview prep       | 3 design docs + 2 mock interviews    |

## Mathematics Learning Roadmap

This roadmap takes you from your current foundation (precalc, linear algebra, trig) to a strong command of probability, statistics, and discrete math, with options for deeper pure math. It's designed for part-time study over 6+ months.

#### Phase 1: Calculus – The Language of Change (Weeks 1–8)

**Why:** Essential for probability theory and understanding continuous optimization.

**Topics:**

* Limits, derivatives (rate of change, chain rule), integrals (area under curve), fundamental theorem of calculus.
* Series and sequences (briefly), parametric/polar.

**Primary Resources:**

* **Book:** _Calculus: Early Transcendentals_ (James Stewart) – work through Chapters 1–6 and 10. Do odd-numbered exercises.
* **YouTube:** 3Blue1Brown’s _Essence of Calculus_ series (for intuition); Professor Leonard’s full Calculus 1/2 lectures (on YouTube, highly detailed).
* **Alternative lighter book:** _Calculus Made Easy_ (Thompson) if Stewart feels too heavy initially.

**Practice:** Do at least 10 problems per chapter, mix of mechanical and conceptual.

#### Phase 2: Probability – Reasoning about Uncertainty (Weeks 9–16)

**Why:** Core to data science, performance analysis, and general decision-making.

**Topics:**

* Sample spaces, axioms, conditional probability, independence, Bayes' rule.
* Random variables, distributions (discrete: binomial, geometric, Poisson; continuous: uniform, exponential, normal).
* Expectation, variance, covariance, law of large numbers, central limit theorem.
* Markov chains (intro).

**Primary Resources:**

* **Course:** Harvard Stat 110 (edX/YouTube) by Joe Blitzstein – _Introduction to Probability_. Watch all lectures, do the problem sets. The textbook _Introduction to Probability_ (Blitzstein & Hwang) is free online.
* **YouTube:** _StatQuest_ for visual explanations of distributions.
* **Book (optional):** _Probability: For the Enthusiastic Beginner_ (Morin) – gentle intro if Blitzstein is too fast.

**Milestone:** Be able to derive expected values, perform Bayesian updates, and understand where the normal distribution comes from.

#### Phase 3: Statistics – From Theory to Inference (Weeks 17–22)

**Why:** So you can evaluate data, A/B tests, and measure uncertainty in any system.

**Topics:**

* Parameter estimation (MLE), confidence intervals.
* Hypothesis testing (p-values, t-tests, power, significance).
* Regression (linear, logistic).
* Resampling (bootstrap), non-parametric methods.

**Primary Resources:**

* **Book:** _All of Statistics_ (Wasserman) – concise, mathematically mature.
* **Book:** _Naked Statistics_ (Wheelan) – intuitive, reads like a novel.
* **YouTube:** _Statistics with R_ (MarinStatsLectures) or the _Data Science Statistics_ series by Khan Academy.

**Practice:** Apply to your own project benchmarks (e.g., bootstrap confidence intervals for latency comparisons).

#### Phase 4: Discrete Mathematics – The Backbone of CS (Weeks 23–28)

**Why:** It formalizes induction, graphs, combinatorics, and logic—the hidden structure in all your code.

**Topics:**

* Propositional and predicate logic, proofs (direct, contrapositive, contradiction, induction).
* Set theory, functions, relations.
* Graph theory (trees, connectivity, matchings, planarity).
* Combinatorics (counting, recurrence, generating functions).
* Introductory number theory (modular arithmetic, RSA).

**Primary Resources:**

* **Book:** _Concrete Mathematics_ (Graham, Knuth, Patashnik) – challenging but immensely rewarding. Focus on selected chapters: 1 (Recurrent Problems), 2 (Sums), 4 (Number Theory), 5 (Binomial Coefficients), 6 (Special Numbers), 7 (Generating Functions).
* **Book (gentler):** _Discrete Mathematics and Its Applications_ (Rosen) – use as reference.
* **YouTube:** _TrevTutor_ has excellent discrete math playlists; MIT 6.042J Mathematics for CS (old lectures on OCW).

**Project idea:** Write a proof assistant in Rust that verifies simple logical tautologies, or implement a syntax tree with graph algorithms.

#### Phase 5: Advanced Electives (If You Wish to Go Further)

Pick any that intrigue you:

* **Real Analysis:** _Understanding Analysis_ (Abbott) + 3Blue1Brown’s real analysis playlists. Teaches you the rigorous foundation of calculus (epsilon-delta). Deep mental discipline.
* **Abstract Algebra:** _A Book of Abstract Algebra_ (Pinter). Learn about groups, rings, fields—the algebra behind encryption and symmetry.
* **Probability Further:** _Probability Theory: The Logic of Science_ (Jaynes) – a masterpiece that derives probability as extended logic. Read after you've internalized classical probability.
* **Information Theory:** _Elements of Information Theory_ (Cover & Thomas) – Claude Shannon’s ideas, applied to compression, machine learning.

***



* Degrees of plausibility are represented by real numbers.
* Qualitative correspondence with common sense (if A∣EA∣E seems more plausible than B∣EB∣E, the number should be greater).
* Consistency: if you can reason to a conclusion by multiple paths, you must get the same plausibility assignment.
