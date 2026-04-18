# Domain

**Domain (The Field)**: The broadest category. Think of this as the "industry" or "sector."

* _Examples:_ Science, Business, Arts, Engineering.

**Discipline (The Branch)**: A specific branch of learning with its own set of rules and methods.

* _Examples:_ Within the _Science_ domain, disciplines include Physics, Biology, and Chemistry.

**Topic (The Subject)**: A specific area of focus within a discipline.

* _Examples:_ Within the _Physics_ discipline, topics include Quantum Mechanics, Thermodynamics, or Fluid Dynamics.

**Niche (The Expertise)**: Where professional domain expertise truly lives.

* _Examples:_ Within _Fluid Dynamics_, a niche might be "Turbulent Flow in Micro-channels."

***

#### Domain: Computer Science & Engineering

| Discipline                | Topic                        | Niche (Current Depth)                                                        |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| **Systems Programming**   | Go                           | Goroutines, compiler, strings                                                |
| **Distributed Systems**   | System Design                | Rate limiting, consistent hashing, distributed cache, ID gen, task scheduler |
| **Networking**            | P2P / Protocols              | libp2p, DHT (Kademlia), NAT traversal, Circuit Relay, multiaddr              |
| **Data Engineering**      | Messaging                    | Kafka (basics)                                                               |
| **Security**              | Identity                     | OAuth2 / OIDC                                                                |
| **Software Architecture** | Architecture Patterns        | Modularity, cohesion, architectural decisions                                |
| **API Design**            | Backend APIs                 | REST, gRPC, versioning, rate limiting                                        |
| **Machine Learning**      | Neural Networks + Embeddings | Fundamentals, chunking, structure-aware embedding                            |

#### Domain: Mathematics

| Discipline    | Topics                                                                               |
| ------------- | ------------------------------------------------------------------------------------ |
| **Pure Math** | Precalculus, Trigonometry, Calculus (I, II, III), Linear Algebra, Sequences & Series |

***

#### Project Roadmap

**Decentralized Private Chat**

* **Concept:** A polished version of an existing P2P chat featuring group rooms, message history, file attachments, and a clean TUI/Web UI.
* **Engine:** Product layer built on top of the core P2P engine.
* **Reference Notes:** p2p-chat.md.

**Personal Knowledge Base with Semantic Search**

* **Concept:** Markdown notes searchable via natural language with ranked results (an evolution of the GitBook search layer).
* **Current State:** im using gitbook and sync with github so all of my data is in markdown format
* **Engine:** `AST chunking` + `embeddings` + `cosine similarity` + `Go REST API`.
* **Dependencies:** chunking library, vector db, prog lang
* **Reference Notes:** chunking-and-embedding.md.

**Real-Time Auction Platform**

* **Concept:** Real-time bidding with instant winner notification and high concurrency.
* **Engine:** `WebSockets`, `Kafka` for bid events, `rate limiting`, `notification fan-out`, `strong consistency`.
* **Reference Notes:** rate-limit, notification-system, Kafka.

**Travel itinerary**

* User sharing itinerary, API integration with 3rd party like local guide, riding, shop (cofee, fnb, antique, etc..), events like (city, provice, national based), or use realtime scrape data from internet (update every n seconds/minutes).
* User sharing experience (e.g, user a: im using .. to ...), rating, story, etc..
* User can be anonymous
* User can search events, places, etc..
