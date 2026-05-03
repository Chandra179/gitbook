# Roadmap

## Software Engineering Knowledge Expansion & Projects Roadmap

This roadmap broadens your architectural depth, introduces new domains, and sharpens your systems-building skills without grinding you into burnout again. It's structured in phases, each with a theme and a suggested capstone project.

#### Phase 1: Systems Architecture & Distributed Patterns (Weeks 4–8)

**Goal:** Fill any gaps in large-scale architecture, cloud-native patterns, and formal design thinking.

**Topics to study:**

* Domain-Driven Design (DDD), CQRS, Event Sourcing
* Cloud-native patterns (Kubernetes, service mesh, observability)
* Architectural Decision Records (ADRs) and technical strategy

**Resources:**

* **Book:** _Designing Data-Intensive Applications_ (Kleppmann) – read chapters on replication, partitioning, transactions, and the “Future of Data Systems”. It deepens your database knowledge.
* **Book:** _Fundamentals of Software Architecture_ (Richards & Ford) – covers architecture styles, governance, and communication.
* **YouTube:** "Event Sourcing" by Greg Young (talks at conferences); "Microservices vs Modular Monoliths" by Kamil Grzybek.
* **Paper:** _"Out of the Tar Pit"_ (Moseley & Marks) – functional relational programming for complexity management.

**Project options (choose one, keep small – 2 weeks max):**

* **Design and document an architecture** for a fictional high-scale system (e.g., “Spotify-like music streaming”) using ADRs, including deployment diagrams, data flow, and trade-offs. No code—just design docs.
* **Build a small Kubernetes operator** using `kubebuilder` (Go) that manages a custom resource (e.g., auto-scaling a Redis cluster). Deploy on Minikube.

#### Phase 2: Rust Mastery & Systems Programming (Weeks 9–16)

**Goal:** Achieve fluency in Rust and apply it to a unique, challenging domain.

**Resources:**

* **Book:** _Programming Rust_ (Blandy & Orendorff, 2nd edition) – excellent after the official book.
* **Book:** _Rust for Rustaceans_ (Jon Gjengset) – advanced idiomatic Rust.
* **YouTube:** Jon Gjengset’s “Crust of Rust” series (deep dives into iterators, smart pointers, etc.).
* **Paper:** _"The HNSW Paper"_ (Malkov & Yashunin) if you go the vector engine route; _"Kademlia: A Peer-to-peer Information System"_ (Maymounkov & Mazières) for a DHT project.

**Project menu (pick one you'll love, spend \~6 weeks):**

* **Distributed Key-Value Store:** Implement a Raft-based, fault-tolerant KV store with gRPC, snapshots, and dynamic membership changes. (Use the _Raft paper_, and `raft-rs` as reference but implement core yourself.)
* **Quantitative Event Engine (your original idea):** Build a high-performance backtesting library in Rust that ingests event timestamps and price CSVs, computes abnormal returns, and performs shape matching with DTW. (Reference MacKinlay 1997 paper for formulas, but treat it as an engineering tool, not trading validation.)
* **Blazing-Fast Vector Search Engine:** Brute-force → HNSW → hybrid sparse/dense, integrated with your Go RAG (but now in Rust). High excitement, immediate use.

#### Phase 3: Specialization Track (choose one for weeks 17–24+)

Based on your career aspirations, dive deeper into one area.

**Track A: AI Infrastructure (ML Platform Engineering)**

* **Books:** _Machine Learning Engineering_ (Burkov); _Building Machine Learning Pipelines_ (Hapke & Nelson).
* **YouTube:** "MLOps Community" channel; "Stanford CS 329P: Machine Learning Deployment".
* **Project:** Build a Model Router – a proxy that load-balances across LLM APIs, implements semantic caching, rate limiting, and fallback. Use your `singleflight` pattern and circuit breakers. Deploy with observability.

**Track B: Distributed Systems / Databases**

* **Books:** _Database Internals_ (Petrov); _Consensus: Bridging Theory and Practice_ (Ongaro).
* **Paper:** _"Dynamo: Amazon's Highly Available Key-value Store"_; _"Bigtable"_; _"Spanner"_.
* **Project:** Implement a lightweight columnar query engine or a streaming SQL processor (with a subset of SQL parsing and execution).

**Track C: Low-level Systems / Embedded**

* **Books:** _Operating Systems: Three Easy Pieces_ (free online); _Linux Kernel Development_ (Love).
* **Project:** Write a small operating system kernel from scratch (following tutorials from _"Writing an OS in Rust"_ blog series). Build a USB driver.

#### Phase 4: Career Launch (final weeks)

* **Polish your portfolio:** Document your best sabbatical project with benchmarks, a great README, and a blog post.
* **Networking:** Share your article on LinkedIn, Hacker News, Reddit (r/rust, r/ExperiencedDevs). Post about your architecture decisions.
* **Interview preparation:** System design practice (Grokking the System Design Interview, etc.). Focus on remote-friendly companies.

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
