# Clock Skew & Time Sync

### What is Clock Skew?

Clock Skew is the phenomenon where the local system clock on a specific server drifts away from the actual, absolute time (Universal Coordinated Time or UTC).

In a distributed system, "Time" is not a constant. Each server relies on a physical hardware component (a quartz crystal oscillator) to keep time. These crystals are imperfect and are affected by temperature, voltage, and age.

* Drift: The gradual divergence of the local clock from true time (e.g., drifting +0.5 seconds per day).
* Skew: The instantaneous difference between the local clock and the reference time.

***

### Why Use NTP?

If hardware clocks are inaccurate, we use NTP (Network Time Protocol) to fix them. NTP runs as a daemon on the server, periodically checking the time against highly accurate atomic clocks over the internet. We must use NTP because accurate time is required for:

1. Log correlation (Debugging across services).
2. Database consistency (Last-write-wins conflict resolution).
3. Security tokens (JWT expiration).

However, NTP is also the primary cause of the specific failure mode that threatens Snowflake IDs. If NTP detects the local clock is significantly ahead (e.g., 5 seconds fast), it may force the clock to jump backward to align with reality.

***

### Causes of Clock Skew (Backward Jumps)

For a Snowflake ID generator, a clock moving _forward_ is fine. The danger is when the clock moves _backward_.

#### Natural Drift (Hardware)

The Root Cause. All computer clocks rely on oscillating crystals (usually quartz) to keep time. Due to tiny differences in manufacturing, temperature variations, and voltage fluctuations, these oscillation rates are never perfectly identical.

* The Effect: Over time, these clocks naturally drift away from each other and from the absolute "True Time."
* The Consequence: This continuous drift is what forces us to use NTP. If the drift becomes significant, it triggers the synchronization events described below.

#### NTP "Stepping" (The most common cause)

NTP usually adjusts time gradually (called "slewing"). However, if the discrepancy is too large (typically >128ms), NTP typically forces a "Step" adjustment. It instantly snaps the system clock backward to the correct time.

#### Virtual Machine (VM) Pauses

In cloud environments (AWS, GCP), a VM might be paused for "Live Migration" or due to "Noisy Neighbors." When the VM resumes, the CPU clock catches up, but the wall clock might behave erratically or appear to jump relative to the application's execution flow.

#### Manual Admin Intervention

A sysadmin manually resetting the server time using `date` or `timedatectl` commands.

***

### Impact on Snowflake ID Generator

The Snowflake ID relies on the invariant: Time must strictly increase.

If the clock moves backward, the following collision scenario occurs:

1. Time $$T=1000$$: Generator creates `ID_A` (Timestamp: 1000, Sequence: 0).
2. Clock Jump: NTP moves clock backward to $$T=999$$.
3. Time $$T=999$$: Generator creates `ID_B`.
4. The Conflict: The system has _already_ generated IDs for Time 999 in the past. If the sequence counter resets to 0, `ID_B` will be an exact duplicate of an ID generated 1 millisecond ago.

> Result: Duplicate Primary Keys $$\rightarrow$$ Database constraint violation $$\rightarrow$$ Transaction Failure.

***

### Mitigation Strategies

Robust Snowflake implementations must implement "Refusal to Generate" logic when clock skew is detected.

#### Strategy A: The "Pause and Wait" (Recommended for Small Skews)

If the backward jump is small (e.g., < 5 seconds), the system pauses execution and waits for the clock to catch up.

#### Strategy B: The "Hard Fail" (Integrity First)

For financial systems, it is often safer to crash the service pod than to risk a duplicate ID. Kubernetes or the load balancer will route traffic to a healthy node while the affected node restarts.

#### Strategy C: Monotonic Clock Check

Do not rely solely on `Wall Clock` (System Time). Use the OS `Monotonic Clock` (time since boot) to measure elapsed time.

* Verify that if `Wall Clock` moved backward, `Monotonic Clock` still moved forward.
* Note: You still cannot generate an ID with a past timestamp, but this helps accurately measure _how long_ to wait.
