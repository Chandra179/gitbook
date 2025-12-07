# Study & Project Group Matcher

This design focuses on a platform connecting users for collaborative learning or project building. The unique challenge here is balancing a social discovery feature (fuzzy, high volume) with a transactional grouping feature (strict limits, consistency).

#### Core Feature

Contextual Group Formation with Capacity Enforcement

* Smart Matching: Users find groups not just by keyword, but by _compatibility_ (Timezone, Skill Level, Skills(design,vibe coder,marketing), Intent: "Serious" vs "Casual").
* Before creating the group itself, the things that we want to build must be clear maybe proposal or ideas and the goals and why
* Strict Enrollment: A "First-Come-First-Serve" or "Application-Approval" model that strictly enforces the max 5 user limit to ensure intimate, high-quality groups.
* The "Wrapped" Hook: Gamification of the learning journey (e.g., "You spent 40 hours studying Go this month").

***

#### 2. Scale & Constraints

_Assumption: Growth-stage startup scale._

* Daily Active Users (DAU): \~50,000 DAU.
* Requests Per Second (RPS):
  * Reads (High): \~1,500 RPS. Users browse/filter groups much more than they join them.
  * Writes (Low): \~50 RPS. Group creation and joining are relatively infrequent actions per user.
* Consistency Level:
  * Group Membership: Strong Consistency. We cannot allow a 6th person into a 5-person group due to a race condition.
  * Feed/Recommendations: Eventual Consistency. If a new group appears in the search feed 5 seconds late, it's acceptable.

***

#### 3. User Journey

1. Profile Setup (The Filter): User signs up and defines their "Vector": `{Interests: [marketing, System Design], Level: Intermediate, Availability: Weekends}`.
2. Discovery (The Feed): User sees a ranked list of cards: "Build a Redis Clone (Go)", "Marketing automation".
3. The Decision (The Funnel):
   * _Path A (Open Group):_ Click "Join" -> System checks capacity -> Success -> Reveal Discord Link.
   * _Path B (Application):_ Click "Apply" -> Write short pitch -> Owner approves -> Notification -> Join.
4. The Lifecycle: Group activates -> Members collaborate -> Group marked "Completed" -> Users get "Reputation Points" and stats for their "Wrapped".

***

#### Data Model (Relational - PostgreSQL)

We need ACID compliance for the group capacity logic.

Users Table

* `id`: UUID (PK)
* `tags`: JSONB (e.g., `["golang", "finance", "indonesian"]`)
* `stats`: JSONB (for the "Wrapped" feature, aggregated nightly)

Groups Table

* `id`: UUID (PK)
* `owner_id`: UUID (FK)
* `capacity`: Integer (default 5)
* `current_count`: Integer (The critical counter)
* `version`: Integer (For Optimistic Locking)
* `status`: Enum (OPEN, CLOSED, COMPLETED)

Group\_Members Table

* `group_id`: UUID (FK)
* `user_id`: UUID (FK)
* `role`: Enum (LEADER, MEMBER)
* `joined_at`: Timestamp
* _Primary Key is Composite (group\_id, user\_id) to prevent duplicate joins._

***

#### Big Picture (Component Diagram)

Key Components:

1. API Gateway: Routes requests and handles rate limiting.
2. Group Service (Go): The "Traffic Cop".
   * Handles `CreateGroup` and `JoinGroup`.
   * Critical Responsibility: Ensuring `current_count` never exceeds `capacity`.
3. Matching Engine (Read Heavy)
   * Interface Driven: This component depends strictly on a `GroupSearcher` interface. This allows us to start with SQL and swap to a dedicated search engine (Elastic/Vector DB) later without changing a single line of business logic.
   * PostgreSQL Implementation (MVP): Instead of managing a separate Elastic cluster, we utilize PostgreSQL's GIN (Generalized Inverted Index) on the `tags` column.
   * Read Replica Strategy: To handle the \~1,500 RPS read load, this service connects to a PostgreSQL Read Replica, ensuring complex search queries never slow down the critical `CreateGroup` or `JoinGroup` transactions on the master database.
4. Activity Worker (Async):
   * Listens to events (via RabbitMQ/Kafka) like `UserJoined`, `GroupCompleted`.
   * Aggregates these into the `stats` JSON for the "Spotify Wrapped" feature without slowing down the user experience.

***

#### The Math

You might think this is just CRUD, but "Matching" and "Capacity" involve specific math concepts.

**Similarity Scoring (Jaccard Index)**

To show the "Best Match" groups, we don't just use SQL `WHERE`. We calculate the overlap between User Interests and Group Tags.

$$J(A,B) = \frac{|A \cap B|}{|A \cup B|}$$

* A: User Tags `{Go, SQL, English}`
* B: Group Tags `{Go, React, English}`
* Intersection: `{Go, English}` (Size 2)
* Union: `{Go, SQL, English, React}` (Size 4)
* Score: 2/4 = 0.5 (50% Match)

_In the real system, you would use a Weighted Jaccard, giving higher weight to "Language" tags to ensure communication is possible._
