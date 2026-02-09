# Snowflake ID

## Introduction

Snowflake ID is a `64-bit` unique identifier generator, it’s usually used to solve the problem of generating unique IDs in distributed systems without coordination. Unlike `UUIDs` (which are 128-bit and random), Snowflake IDs are k-ordered (roughly sorted by time), making them highly efficient for database indexing (B-Trees).

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

The only risk to uniqueness of the ID is Clock Skew **(NTP drift)**. For context: The app that we run is on server which relies on a hardware component (a quartz crystal oscillator) to tracking time. These crystals are imperfect and affected by temperature, voltage, and age which causing a **Clock skew** (it’s a phenomenon where two different clocks run at slightly different rates, causing them to lose synchronization over time)

Clock skew is fine when the **clock drifts forward** (monotonically increasing), as the generated IDs will still follow a chronological sequenc&#x65;**.** The problem is when it moves **backwards**, for example (we generated ID at 16:00:05, and the backward drift is 16:00:02 this will resulting in **generating old id** which resulting in conflict.

## Conflict Prevention

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

## Will I run out of IDs?

Use Case: 1,000 IDs per second.

* Utilization: $$\frac{1}{4,096} \approx 0.024\%$$. You are using less than 1% of a single node's capacity.

Use Case: 100 Billion Total IDs stored in a Database.

* Space Usage: The max `BIGINT` value is $$\approx 9 \text{ Quintillion}$$. Storing 100 Billion rows uses $$\approx 0.000001\%$$ of the available integer space. You will essentially never run out of primary keys.
