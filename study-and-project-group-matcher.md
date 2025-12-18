# Study & Project Group Matcher

This design focuses on a platform connecting users for collaborative learning or project building. The unique challenge here is balancing a social discovery feature (fuzzy, high volume) with a transactional grouping feature (strict limits, consistency).

#### Core Feature

* Smart Matching: Users find groups not just by keyword, but by _compatibility_ (Timezone, Skill Level, Skills(design,vibe coder,marketing).

***

#### User Journey

1. Profile Setup: User signs up and defines their "Vector": `{Interests: [marketing, System Design, biology], Skill: Golang, advertising, accounting}`.
2. Discovery: User sees a ranked list of cards: "Build a Redis Clone (Go)", "Marketing automation".
3. The Decision:
   * _Path A (Open Group):_ Click "Join" -> System checks capacity -> Success
   * _Path B (Application):_ Click "Apply" -> Write short pitch -> Owner approves -> Notification -> Join.

***

#### Data Model (Relational - PostgreSQL)

We need ACID compliance for the group capacity logic.

Users Table

* `id`: UUID (PK)
* email: string
* fullname: string
* `tags`: JSONB (e.g., `["golang", "finance", "indonesian"]`)
* `stats`: JSONB (for the "Wrapped" feature, aggregated nightly)

Groups Table

* `id`: UUID (PK)
* `owner_id`: UUID (FK)
* `capacity`: Integer (default 5)
* `current_count`: Integer (The critical counter)
* title: string
* description: string
* tags: JSONB
* `status`: string (OPEN, CLOSED, COMPLETED)

Group\_Members Table

* `group_id`: UUID (FK)
* `user_id`: UUID (FK)
* `role`: string (LEADER, MEMBER)
* `joined_at`: Timestamp
* _Primary Key is Composite (group\_id, user\_id) to prevent duplicate joins._

***

#### Big Picture (Component Diagram)

Key Components:

1. Group Service&#x20;
   * Handles `CreateGroup` and `JoinGroup`.
   * Critical Responsibility: Ensuring `current_count` never exceeds `capacity`.
2. Matching Engine
   * Interface Driven: This component depends strictly on a `GroupSearcher` interface. This allows us to start with SQL and swap to a dedicated search engine (Elastic/Vector DB) later without changing a single line of business logic.
   * PostgreSQL Implementation (MVP): Instead of managing a separate Elastic cluster, we utilize PostgreSQL's GIN (Generalized Inverted Index) on the `tags` column.

***

#### The Math

**Similarity Scoring (Jaccard Index)**

To show the "Best Match" groups, we don't just use SQL `WHERE`. We calculate the overlap between User Interests and Group Tags.

$$J(A,B) = \frac{|A \cap B|}{|A \cup B|}$$

* A: User Tags `{Go, SQL, English}`
* B: Group Tags `{Go, React, English}`
* Intersection: `{Go, English}` (Size 2)
* Union: `{Go, SQL, English, React}` (Size 4)
* Score: 2/4 = 0.5 (50% Match)
