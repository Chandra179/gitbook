# MVP Template

**Companion to:** [.](./ "mention") | [implementation-template.md](implementation-template.md "mention")

***

### Goals

\[What the app does. User-facing outcomes.]

* \[Goal 1]
* \[Goal 2]
* \[Goal 3]

***

### Non-Goals

\[What the app deliberately does NOT do.]

* \[Non-goal 1]
* \[Non-goal 2]
* \[Non-goal 3]

***

### Core Features

\[Features without which the app is useless. Must ship in MVP.]

#### Feature 1: \[Name]

**What it does:** \[One sentence.]

**Risks we tolerate:**

* \[Risk — e.g., "No authentication on this endpoint"]
* \[Risk — e.g., "Data loss if process crashes mid-write"]

#### Feature 2: \[Name]

**What it does:** \[One sentence.]

**Risks we tolerate:**

* \[Risk]
* \[Risk]

#### Feature 3: \[Name]

**What it does:** \[One sentence.]

**Risks we tolerate:**

* \[Risk]

***

### Constraints

\[Rules that limit complexity. Prevents over-engineering.]

* \[Constraint — e.g., "Only handle statuses: PENDING, COMPLETED, FAILED"]
* \[Constraint — e.g., "Single tenant. No isolation logic."]
* \[Constraint — e.g., "Max 3 retries. No custom retry policies."]
* \[Constraint — e.g., "No update or delete of submitted tasks."]

***

### Implementation Phases

#### Phase 0: Foundation

\[Boilerplate. Nothing user-facing works yet.]

* Project scaffolding and directory structure
* Logging, config, error handling conventions
* Database schema and migration framework
* Health check endpoint
* CI (lint, build, test)

#### Phase 1: \[Feature A]

\[First working feature.]

* \[Task]
* \[Task]

**Checkpoint:** \[What works when this phase is done]

#### Phase 2: \[Feature B]

* \[Task]
* \[Task]

**Checkpoint:** \[What works]

***

### What Never Changes

\[Invariants across all phases.]

* \[Invariant 1]
* \[Invariant 2]
* \[Invariant 3]

<br>
