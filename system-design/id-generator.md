# Snowflake ID

## Introduction

The Snowflake ID is a `64-bit` unique identifier generator designed to solve the problem of generating unique IDs in distributed systems without coordination. Unlike `UUIDs` (which are 128-bit and random), Snowflake IDs are k-ordered (roughly sorted by time), making them highly efficient for database indexing (B-Trees).

Core Characteristics:

* 64-bit Integer: Fits into standard SQL `BIGINT`.
* Time-Sortable: Higher bits are timestamps.
* Distributed: Generated locally by nodes (no central DB required).
* High Performance: Capable of generating millions of IDs per second.

***

## The Structure (Anatomy)

A Snowflake ID is composed of 64 bits. The standard bit distribution (Twitter format) is as follows:

```
| 1 Bit |     41 Bits      |   10 Bits   |    12 Bits     |
|-------|------------------|-------------|----------------|
| Sign  |    Timestamp     | Machine ID  | Sequence Number|
```

12 bits = 4096 values per machine, so for short "we can generate up to 4096 Ids / millisecond and per machine

<table><thead><tr><th width="159.199951171875">Segment</th><th width="129.4000244140625">Bits</th><th>Description</th><th>Capacity</th></tr></thead><tbody><tr><td>Sign Bit</td><td>1</td><td>Reserved. Always <code>0</code> to ensure the ID is a positive integer.</td><td>N/A</td></tr><tr><td>Timestamp</td><td>41</td><td>Milliseconds since a custom Epoch (start date).</td><td>~69 Years</td></tr><tr><td>Machine ID</td><td>10</td><td>Unique ID for the specific server/node generating the ID.</td><td>1,024 Nodes</td></tr><tr><td>Sequence</td><td>12</td><td>Auto-incrementing counter for IDs generated in the <em>same</em> millisecond.</td><td>4,096 IDs / ms</td></tr></tbody></table>

## Conflict Analysis

Conflict is mathematically impossible if the system is configured correctly. Uniqueness is guaranteed by the combination of three variables: Time, Location, and Order.

* **Scenario A** (Different Time): If requests occur at different milliseconds, the Timestamp differs. Result: Unique.
* **Scenario B** (Same Time, Different Machine): If requests occur at the same millisecond on different servers, the Machine ID differs. Result: Unique.
* **Scenario C** (Same Time, Same Machine): If requests occur at the same millisecond on the same server, the Sequence increments. Result: Unique.

> Warning - Clock Skew: The only risk to uniqueness is Clock Skew (NTP drift). If the system clock moves _backwards_, the generator might produce a previous timestamp. Most implementations will throw an error or pause until the clock catches up to prevent this.

***

## Capacity & Constraints

There are two distinct limits to a Snowflake ID: How fast you can generate them (Throughput) and how long the system lasts (Lifespan).

#### Limit 1: Throughput (The Sequence)

The 12-bit sequence allows for 4,096 values ($$0$$ to $$4095$$).

* Max Throughput: $$4,096 \times 1,000 \text{ ms} = \mathbf{4,096,000 \text{ IDs/sec/node}}$$
* If this limit is exceeded, the system must "sleep" until the next millisecond to reset the sequence.

#### Limit 2: Lifespan (The Timestamp)

The 41-bit timestamp holds $$2^{41} - 1$$ milliseconds.

* Total Duration: $$\approx 2,199,023,255,551 \text{ ms} \approx \mathbf{69.7 \text{ Years}}$$
* If you set your custom Epoch to today, your IDs are valid for nearly 70 years. After that, a migration or Epoch rotation is required.

#### Scenario: Will I run out of IDs?

Use Case: 1,000 IDs per second.

* Utilization: $$\frac{1}{4,096} \approx 0.024\%$$. You are using less than 1% of a single node's capacity.

Use Case: 100 Billion Total IDs stored in a Database.

* Space Usage: The max `BIGINT` value is $$\approx 9 \text{ Quintillion}$$. Storing 100 Billion rows uses $$\approx 0.000001\%$$ of the available integer space. You will essentially never run out of primary keys.

## Clock Skew

In a distributed system, "Time" is not a constant. Each server relies on a hardware component (a quartz crystal oscillator) to keep time. These crystals are imperfect and affected by temperature, voltage, and age.

* Drift: The gradual divergence of the local clock from true time (e.g., drifting +0.5 seconds per day).
* Skew: The instantaneous difference between the local clock and the reference time.

### The Role of NTP

To fix hardware inaccuracy, servers use NTP (Network Time Protocol). NTP checks the time against atomic clocks over the internet.

The Danger of Stepping:

NTP usually adjusts time gradually ("slewing"). However, if the discrepancy is large (typically $$>128\text{ms}$$), NTP forces a Step adjustment, instantly snapping the system clock backward to align with reality.

### Impact on Snowflake IDs

For a Snowflake generator, a clock moving forward is fine. The danger is when the clock moves backward.

The Collision Scenario:

1. Time $$T=1000$$: Generator creates `ID_A` (Timestamp: 1000, Sequence: 0).
2. Clock Jump: NTP detects the clock is fast and moves it backward to $$T=999$$.
3. Time $$T=999$$: Generator creates `ID_B`.

Because the system has already generated IDs for Time 999 in the past, if the sequence counter resets to 0, `ID_B` will be a duplicate of an ID generated 1 millisecond ago. This leads to Primary Key collisions and transaction failures.

Robust Snowflake implementations must implement "Refusal to Generate" logic when clock skew is detected.

#### Strategy A: Pause and Wait (Recommended for Small Skews)

If the backward jump is small (e.g., $$< 5$$ seconds):

1. The system calculates the difference between the `last_generated_timestamp` and the `current_system_time`.
2. It pauses execution (sleeps) until the system clock catches up to the `last_generated_timestamp`.

#### Strategy B: The "Hard Fail" (Integrity First)

For financial systems, it is often safer to crash the service than to risk a duplicate ID. If a significant backward jump is detected, the node should throw a fatal error. Kubernetes or the load balancer will then route traffic to a healthy node while the affected node restarts.

#### Strategy C: Monotonic Clock Check

Do not rely solely on Wall Clock (System Time). Use the OS Monotonic Clock (time since boot) to measure elapsed time.

* Verify that even if the Wall Clock moved backward, the Monotonic Clock still moved forward.
* While you cannot generate an ID with a past timestamp, the Monotonic clock allows you to accurately measure exactly how long to wait before resuming generation.
