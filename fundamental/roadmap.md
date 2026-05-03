# Roadmap

| Activity Type                        | ROI for career                 | Time investment                         |
| ------------------------------------ | ------------------------------ | --------------------------------------- |
| Open source contributions (real PRs) | ⭐⭐⭐⭐⭐                          | Medium (4‑8 hrs / week)                 |
| Teaching (YouTube, blog, GitBook)    | ⭐⭐⭐⭐                           | Low‑Medium (2‑4 hrs / breakdown)        |
| LeetCode (medium, targeted)          | ⭐⭐⭐ (necessary for interviews) | Low (3‑5 problems/week)                 |
| Local infrastructure projects        | ⭐ (for you)                    | **Drop** unless you enjoy them as hobby |

***

### Phase 0: Solidify the Core (1–2 weeks)

_No local projects. Just refresh and practice._

| Topic                   | Action                                                                                                                 | Resources                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Go concurrency patterns | Review and **teach** by writing a short blog post: "Singleflight, errgroup, and semaphore in Go"                       | [Go Concurrency Patterns](https://go.dev/blog/pipelines)                                        |
| Linux performance tools | Run `strace`, `perf`, `ss` on a real service (e.g., your local Kafka) and write a **1‑page breakdown** of what you see | _Systems Performance_ (Brendan Gregg) Ch 1‑4                                                    |
| Resilience patterns     | **Create a video (5 min)** explaining circuit breaker vs. retry with jitter, using real examples                       | [Microsoft Resilience Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/) |

**Deliverable:** One blog post + one short video + one written analysis. Publish on your GitBook / YouTube.

***

### Phase 1: Deep Distributed Systems – Open Source First (4–5 weeks)

Instead of building Raft from scratch, **contribute to real projects** and **teach the concepts**.

#### 1.1 Consensus & Replication – Open Source Path

| Activity                                                                                            | Why                            | Target Project                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fix a good first issue** in a distributed database or coordination system.                        | Real code, real review.        | [etcd](https://github.com/etcd-io/etcd/labels/good%20first%20issue) (Go, Raft) or [hasicorp/raft](https://github.com/hashicorp/raft/labels/good%20first%20issue) |
| **Write a breakdown article** – "How Raft leader election works (with etcd code walkthrough)".      | Shows deep understanding.      | Use etcd's code as reference.                                                                                                                                    |
| **Contribute a small feature** to a consistent hashing library (e.g., adding virtual node support). | Demonstrates practical skills. | [stathat/consistent](https://github.com/stathat/consistent) (Go)                                                                                                 |

**Skip:** Building your own Raft. You know the theory. Prove it by contributing.

#### 1.2 Distributed Transactions & Sagas

| Activity                                                                                         | Why                          | Target                                                                                     |
| ------------------------------------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------ |
| **Contribute to Temporal** (you already know it). Fix a doc bug or a small workflow issue.       | Aligns with your experience. | [Temporal Go SDK issues](https://github.com/temporalio/sdk-go/labels/good%20first%20issue) |
| **Create a video breakdown** – "Saga pattern vs. 2PC: When to use which, with Temporal example". | Teaching forces clarity.     | Use your own prior code as demo.                                                           |

#### 1.3 Observability

| Activity                                                                              | Why                                                         | Target                                                                                                                             |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Contribute to OpenTelemetry Collector** (Go). Add a small processor or exporter.    | Directly matches your experience (you used OTel + Datadog). | [OpenTelemetry Collector good first issues](https://github.com/open-telemetry/opentelemetry-collector/labels/good%20first%20issue) |
| **Write a tutorial** – "Instrumenting a Go service with OpenTelemetry in 15 minutes". | High visibility.                                            | Publish on [Dev.to](https://dev.to/) / GitBook.                                                                                    |

***

### Phase 2: AI Infrastructure – Build & Teach (4–5 weeks)

Keep **two small, focused projects** (they are lightweight and runnable locally). Everything else = open source + teaching.

#### 2.1 LLM Serving – Minimal Project

**Project (keep):** Go wrapper for vLLM with caching, rate limiting, and singleflight.\
&#xNAN;_&#x57;hy keep:_ It's small (<500 lines) and directly portable to a real job.\
&#xNAN;_&#x44;eliverable:_ GitHub repo with clear README and a 5‑min demo video.

**Instead of building a multi‑model router**, contribute to an existing one:

* **Open source contribution** to [LiteLLM](https://github.com/BerriAI/litellm) (Python, but you can help with docs or a Go client) or [OpenRouter](https://openrouter.ai/).
* **Teach:** "How to build a multi‑model router – design trade‑offs" (blog post).

#### 2.2 LLM Observability & Evaluation

| Activity                                                                                                       | Why                           | Target                                                      |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------- |
| **Contribute to RAGAS** (Python, but evaluation logic is language‑agnostic). Add a new metric or improve docs. | Connects to your RAG project. | [RAGAS GitHub](https://github.com/explodinggradients/ragas) |
| **Write a case study** – "How we evaluated our RAG pipeline using RAGAS" (even if it's your own project).      | Shows end‑to‑end thinking.    | GitBook / Medium.                                           |

**Drop semantic cache project** – too heavy. Instead, **teach the concept** with a 10‑min video + diagram.

#### 2.3 LLM Agents

| Activity                                                                                               | Why                        |
| ------------------------------------------------------------------------------------------------------ | -------------------------- |
| **Contribute to Temporal's LLM examples** (they have a Python SDK for AI workflows). Add a Go example. | Direct use of Temporal.    |
| **Create a YouTube video** – "Building a durable LLM agent with Temporal: workflow as code".           | High visibility, low code. |

***

### Phase 3: Advanced Systems Design – Document & Teach (3 weeks)

**No code.** Write design docs and turn them into teaching content.

#### Design docs (write 3, 2 pages each):

* YouTube watch time counter
* Distributed cron job scheduler
* LLM batch inference platform

**Publish** the best one as a blog post with diagrams.

#### Teaching content:

* **Record a video** walking through one design doc (e.g., the LLM batch inference platform).
* **Create a short podcast‑style audio** or live stream where you explain trade‑offs.

**Drop capstone project** (AI‑Native Distributed Cache). Too heavy, too local. Instead, **contribute to an existing vector database** like [Milvus](https://github.com/milvus-io/milvus) (Go components) or [Qdrant](https://github.com/qdrant/qdrant) (Rust, but you can contribute to its client).

***

### Phase 4: Soft Skills & Career (ongoing)

| Activity                                                                            | Why                                    | How                                                          |
| ----------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| **Review open source PRs** (not just your own)                                      | Learn to be a reviewer, mentor others. | Ask maintainers for review permissions after 2‑3 merged PRs. |
| **Attend a contributor summit** (e.g., Temporal Community, KubeCon)                 | Network with hiring managers.          | Virtual events are free.                                     |
| **Update your resume** to highlight open source contributions and teaching content. | Direct impact.                         | Link to your GitHub contributions page and YouTube channel.  |

***

### Prioritized 3‑Month High‑Impact Sprint

| Week  | Primary Activity                                                                                  | Secondary                                            | Time per week |
| ----- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------- |
| 1     | **Open source onboarding** – pick Temporal or OTel, set up dev env, fix a small doc/test issue.   | Write a 1‑page "how I set up" guide.                 | 6 hrs         |
| 2‑3   | **First meaningful open source PR** – add a small feature (e.g., a new metric in OTel collector). | Record a 5‑min video explaining the feature.         | 6‑8 hrs/week  |
| 4     | **LeetCode prep** (medium problems, 3‑5/week) – only if interviewing soon.                        | Review design doc templates.                         | 3 hrs         |
| 5‑6   | **Second open source PR** – contribute to LiteLLM or RAGAS (AI infra).                            | Write a blog post about the contribution experience. | 6 hrs/week    |
| 7‑8   | **Create two teaching videos** – one on consistent hashing, one on saga vs. 2PC.                  | Publish on YouTube and LinkedIn.                     | 4 hrs/week    |
| 9‑10  | **Write two design docs** (pick from list above). Turn one into a blog post with diagrams.        | Review a friend's design doc.                        | 4 hrs/week    |
| 11‑12 | **Final open source contribution** – improve Temporal's Go SDK docs or examples.                  | Record a "lessons learned" video.                    | 6 hrs/week    |

***

### What You Will Have After 3 Months

* ✅ **3‑5 merged PRs** to real open source projects (Temporal, OTel, LiteLLM, RAGAS, etc.)
* ✅ **2‑3 teaching videos** on YouTube (distributed systems + AI infra)
* ✅ **2‑3 blog posts** (design docs + contribution stories)
* ✅ **Solid LeetCode muscle** (if needed)
* ✅ **A public portfolio** that proves you can collaborate, communicate, and solve real problems

***

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
