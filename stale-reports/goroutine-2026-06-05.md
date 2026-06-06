# Staleness Report: Goroutine
**Source:** /home/koala/Work/gitbook/dist/golang/goroutine.md
**Checked:** 2026-06-05 08:00

## Summary
This page is **partially stale**. The core GPM scheduler model, channel internals, select mechanics, and sync primitives are still accurate and well-explained. However, the page refers to Go 1.22 as "new" — by June 2026, Go has shipped four major releases since then (Go 1.23–1.26), each bringing meaningful changes to goroutine-related tooling, runtime behavior, and language features. The "Goroutine Leak" section in particular misses the built-in goroutine leak profiler added in Go 1.26, and there is no coverage of the `iter`/range-over-func feature from Go 1.23, the `synctest` package for concurrency testing, or container-aware GOMAXPROCS.

## What's Still Accurate
- **GPM Scheduler model** — G, P, M concepts, local/global run queues, work stealing, and syscall handoff remain correct and unchanged.
- **Channel internals (`hchan`)** — The `buf`, `sendq`, `recvq`, `lock` description is still accurate.
- **Buffered vs unbuffered channels** — Behavior, blocking semantics, and the leaky buffer pattern reference are all correct.
- **`select` statement** — All examples (multi-channel wait, timeout, graceful shutdown, non-blocking send) are still best practice.
- **Mutex/RWMutex patterns** — Correct usage and read/write locking advice are still valid.
- **WaitGroup** — The `Add(1)` before goroutine start advice is still the correct pattern.
- **sync/atomic types** (`atomic.Int64`) — Still correct; the `And`/`Or` operations (Go 1.23) are a minor addition not yet covered.
- **Worker pool pattern** — The channel-based bounded concurrency pattern is still a Go classic.
- **ErrGroup** — `golang.org/x/sync/errgroup` remains the recommended pattern for error propagation with goroutines.
- **Closure capture (Go 1.22 fix)** — The loop variable per-iteration semantic change in Go 1.22 is correctly described.
- **Goroutine leak fixes** — All the `ctx.Done()` patterns, `ok` checks on channel reads, and deadlock fixes are correct.

## Potential Updates Needed

### 1. Goroutine Leak Detection (Go 1.26) — Major gap
**What changed:** Go 1.26 introduced an **experimental goroutine leak profiler** (`GOEXPERIMENT=goroutineleakprofile`) that can detect goroutines blocked on channels, mutexes, or sync.Cond that can **never be unblocked**. It uses GC reachability analysis. Available as `/debug/pprof/goroutineleak` when enabled. [Go 1.26 Release Notes — Runtime](https://go.dev/doc/go1.26#runtime)

**Impact:** The page only mentions `uber-go/goleak` as the detection tool. Go now ships a built-in mechanism. The page should add a section on the new runtime-detected goroutine leak profile, show how to enable it, and explain the "blocked on unreachable primitive" detection approach. The example given in the Go 1.26 release notes (early return from a loop that reads results from an unbuffered channel, leaking remaining goroutines) is an excellent real-world case.

### 2. Range-over-Func / `iter` package (Go 1.23) — Missing feature
**What changed:** Go 1.23 introduced the ability to use iterator functions in `for-range` loops (range-over-func), plus the new `iter` package (`iter.Seq`, `iter.Seq2`). This is a major language change. [Go 1.23 Release Notes — Language](https://go.dev/doc/go1.23#language)

**Impact:** The standard library now provides iterator-based APIs (e.g., `slices.All`, `slices.Backward`, `maps.Keys`, `maps.Values`). Iterators can internally use goroutines+channels (e.g., a generator pattern). The page could benefit from a note about this pattern and how it relates to goroutine usage.

### 3. `synctest` package (Go 1.24 experiment → Go 1.25 GA) — Missing tool
**What changed:** `synctest.Run` starts goroutines in an isolated "bubble" with a fake clock. `synctest.Wait` waits until all goroutines in the bubble are blocked. This makes testing concurrent code deterministic. [Go 1.24 Release Notes](https://go.dev/doc/go1.24#synctest), [Go 1.25 Release Notes](https://go.dev/doc/go1.25#synctest)

**Impact:** If the page ever covers testing goroutine-based code (or if the user intends to), `synctest` is the modern approach. Currently the page doesn't discuss testing at all beyond `uber-go/goleak`.

### 4. Container-aware GOMAXPROCS (Go 1.25) — Runtime change affecting M count
**What changed:** GOMAXPROCS now defaults to the cgroup CPU bandwidth limit (e.g., Kubernetes CPU limits) rather than the host's logical CPU count. It also dynamically updates if limits change at runtime. [Go 1.25 Release Notes — Runtime](https://go.dev/doc/go1.25#runtime)

**Impact:** The page's GPM section says P (Processor) count equals GOMAXPROCS. It should note that in containerized environments (Kubernetes), P count now automatically respects CPU limits. This is important for users running Go in containers.

### 5. Green Tea GC (Go 1.25 exp → Go 1.26 default) — Performance change
**What changed:** A completely new GC design focused on better locality and CPU scalability for small objects, providing 10–40% GC overhead reduction. [Go 1.25](https://go.dev/doc/go1.25#runtime), [Go 1.26](https://go.dev/doc/go1.26#runtime)

**Impact:** While not about goroutines directly, GC improvements reduce STW pauses and overall latency, which affects goroutine scheduling quality in GC-heavy workloads. Worth a brief mention.

### 6. Go 1.22 is no longer "new" — Update version references
**What changed:** The page says "In Go 1.22 and newer" for the loop variable fix. Go 1.22 was released in February 2024 — four major versions ago. The current stable version is Go 1.26.3.

**Impact:** Text like "In Go 1.21 and older" / "In Go 1.22 and newer" should be updated to reflect that Go 1.22 is now the baseline. The closure fix section still shows the "pass val as parameter" workaround as "The Fix" — while still valid, it's no longer necessary for loop variables since Go 1.22.

### 7. pprof stack depth increased (Go 1.23)
**What changed:** Max stack depth for goroutine/mutex/block profiles raised from 32 to 128 frames. [Go 1.23 Release Notes](https://go.dev/doc/go1.23#runtime/pprof)

**Impact:** This makes goroutine profiles from deep call stacks much more useful. Worth a note in the goroutine profiling/detection section.

### 8. `sync.Map.Clear()` (Go 1.23)
**What changed:** `sync.Map` now has a `Clear()` method (analogous to the `clear()` builtin). [Go 1.23 Release Notes](https://go.dev/doc/go1.23#sync)

**Impact:** Minor but useful addition for the sync primitives section.

## Suggested Next Actions
1. **Add a section on Go 1.26's experimental goroutine leak profile** — This is the most impactful missing piece. Show `GOEXPERIMENT=goroutineleakprofile`, `/debug/pprof/goroutineleak`, and the unreachable-primitive detection approach.
2. **Update the "Goroutine Leak" section** to mention both `uber-go/goleak` (unit test detection) and the runtime's built-in profile (production detection).
3. **Add a note about container-aware GOMAXPROCS** in the GPM scheduler section — important for anyone running Go in Kubernetes.
4. **Add a brief mention of `synctest`** for testing concurrent code.
5. **Update version references** — Change "Go 1.22 and newer" language to reflect that Go 1.22 is now the minimum, and fix the "Fix" section to acknowledge the newer idiom.
6. **Consider adding the `iter` package** to "Advanced Patterns" with a goroutine-based generator example.
7. **Add a note about pprof stack depth increase** in the profiling section.
