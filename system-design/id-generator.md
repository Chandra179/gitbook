# ID Generator

### Introduction

The Snowflake ID is a `64-bit` unique identifier generator designed to solve the problem of generating unique IDs in distributed systems without coordination. Unlike `UUIDs` (which are 128-bit and random), Snowflake IDs are k-ordered (roughly sorted by time), making them highly efficient for database indexing (B-Trees).

Core Characteristics:

* 64-bit Integer: Fits into standard SQL `BIGINT`.
* Time-Sortable: Higher bits are timestamps.
* Distributed: Generated locally by nodes (no central DB required).
* High Performance: Capable of generating millions of IDs per second.

***

### The Structure (Anatomy)

A Snowflake ID is composed of 64 bits. The standard bit distribution (Twitter format) is as follows:

```
| 1 Bit |     41 Bits      |   10 Bits   |    12 Bits     |
|-------|------------------|-------------|----------------|
| Sign  |    Timestamp     | Machine ID  | Sequence Number|
```

12 bits = 4096 values per machine, so for short "we can generate up to 4096 Ids / millisecond because timestamp in millisecond and per machine because we have macine id"

<table><thead><tr><th width="159.199951171875">Segment</th><th width="129.4000244140625">Bits</th><th>Description</th><th>Capacity</th></tr></thead><tbody><tr><td>Sign Bit</td><td>1</td><td>Reserved. Always <code>0</code> to ensure the ID is a positive integer.</td><td>N/A</td></tr><tr><td>Timestamp</td><td>41</td><td>Milliseconds since a custom Epoch (start date).</td><td>~69 Years</td></tr><tr><td>Machine ID</td><td>10</td><td>Unique ID for the specific server/node generating the ID.</td><td>1,024 Nodes</td></tr><tr><td>Sequence</td><td>12</td><td>Auto-incrementing counter for IDs generated in the <em>same</em> millisecond.</td><td>4,096 IDs / ms</td></tr></tbody></table>

### Collision Analysis

Conflict is mathematically impossible if the system is configured correctly. Uniqueness is guaranteed by the combination of three variables: Time, Location, and Order.

#### Scenario A: Different Time

If two requests happen at different milliseconds:

* The Timestamp component differs.
* Result: Unique ID.

#### Scenario B: Same Time, Different Machine

If two requests happen at the exact same millisecond on different servers:

* The Machine ID component differs.
* Result: Unique ID.

#### Scenario C: Same Time, Same Machine

If two requests happen at the exact same millisecond on the same server:

* The Sequence Number increments.
* Result: Unique ID up to 4,096 times per millisecond.

> Warning - Clock Skew: The only risk to uniqueness is Clock Skew (NTP drift). If the system clock moves _backwards_, the generator might produce a previous timestamp. Most implementations will throw an error or pause until the clock catches up to prevent this.

***

### Capacity & "Run Out" Analysis

There are two ways to "run out" of Snowflake IDs: overflowing the Sequence or overflowing the Timestamp.

#### Limit 1: Throughput Limit (The Sequence)

* Constraint: 12 bits = 4,096 values (0 to 4095).
* Meaning: A single node can generate max 4,096 IDs per millisecond.
* Max Throughput: $$4,096 \times 1,000 \text{ ms} = \mathbf{4,096,000 \text{ IDs/sec/node}}$$.
* If Exceeded: The system waits (sleeps) until the next millisecond to reset the sequence to 0.

#### Limit 2: Lifespan Limit (The Timestamp)

* Constraint: 41 bits = $$2^{41} - 1$$ milliseconds.
*   Calculation:

    $$2^{41} \text{ ms} \approx 2,199,023,255,551 \text{ ms} \frac{2,199,023,255,551}{1000 \times 60 \times 60 \times 24 \times 365.25} \approx \mathbf{69.7 \text{ Years}}$$
* Meaning: The system works for \~69 years relative to your custom Epoch.
* Mitigation: If you start your Epoch in 2024, the IDs remain valid until \~2093. After that, you must rotate the Epoch or migrate ID structures.

***

### Scenario Calculation

#### Use Case: 1,000 IDs per second

Question: If I generate 1,000 IDs/s, will it crash or conflict?

Assumptions:

* Nodes: 1 Single Node (Worst case scenario for load).
* Rate: 1,000 requests/second.

The Math:

1.  Incoming Load per Millisecond:

    $$\frac{1,000 \text{ req}}{1,000 \text{ ms}} = 1 \text{ ID per ms}$$
2.  System Capacity per Millisecond:

    $$4,096 \text{ IDs per ms}$$
3.  Utilization:

    $$\frac{1}{4,096} \approx 0.024\%$$

At 1,000 IDs/s, your sequence number will mostly stay at 0 or 1. You are using less than 1% of the capacity of a single node. You have zero risk of running out.

#### Use Case: 100 Billion Total IDs

Question: Will I run out of `BIGINT` space with 100 Billion rows?

The Math:

* Max BIGINT Value: $$ $\approx 9,223,372,036,854,775,807$ $$ (9 Quintillion)
* Your Data: $$ $100,000,000,000$ $$ (100 Billion)
*   Consumption:

    $$\frac{100 \times 10^9}{9.22 \times 10^{18}} \approx 0.000001\%$$

You could generate 100 Billion IDs every day for thousands of years and not exhaust the 64-bit integer space.
