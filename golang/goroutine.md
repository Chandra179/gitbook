# Goroutine

### GPM Scheduler

<figure><img src="https://2576044272-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F4G3qEfKKNTPjJ3BFGqg8%2Fuploads%2F7GttrHbCyk2Cj3tER1Dv%2Fimage.png?alt=media&#x26;token=cab3a4f2-1346-4c3d-aed9-bec9219dcf0e" alt=""><figcaption><p>Go GPM Architecture</p></figcaption></figure>

* **G (Goroutine)** → The task itself. **Physically, a `g` struct in RAM** (heap). It contains a private stack (starting at \~2KB) and a "Program Counter" (a bookmark of the next line of code).
* **P (Processor)** → The scheduler’s “cooking station.” A logical resource that holds the context for executing Go code.
* **M (Machine / OS Thread)** → The chef (physical/OS thread) who executes the task.

**Work Stealing (Load Balancing)**

* Each P has a **Local Run Queue** (a list of memory pointers to Goroutines waiting in RAM).
* If P1 runs out of Gs, it checks the **Global Run Queue**.
* If empty, it attempts to **steal half** of P2’s local queue.
* _Result:_ Keeps all CPU cores saturated without expensive OS-level context switches.

**Syscall Handoff (Preventing Blocking)**

* If **G1** makes a blocking syscall (e.g., file I/O), the thread **M1** blocks.
* The Scheduler detaches **P1** from **M1** and moves it to a new/idle thread (**M2**).
* **P1** continues executing other queued goroutines (**G2, G3**) on the new thread.
* _Result:_ Thousands of blocking syscalls won't starve your CPU.

***

### Channels

* **Unbuffered:** `make(chan T)`. No storage. Send/Receive must synchronize (rendezvous).
* **Buffered:** `make(chan T, n)`. Has a "waiting room" of size `n`. Sends only block when the buffer is full.

#### **Channel Internals (`hchan`)**

When you create a channel, Go allocates an `hchan` struct in **RAM**. This is the "manager" that coordinates goroutines.

Each channel maintains:

* **`buf`** → Circular buffer (the actual RAM storage for buffered values).
* **`sendq` & `recvq`** → Linked lists in RAM storing **pointers** to blocked goroutines.
* **`lock`** → A mutex ensuring thread-safe access to the channel.

#### **Lifecycle of a Blocked Operation**

When a Goroutine (G) hits a blocking operation (e.g., receiving from an empty channel):

1. **Suspension:** The G is removed from the **P's Local Run Queue**. Status changes from `running` to `waiting`.
2. **Enqueued:** A pointer to this G is placed in the channel’s `recvq` or `sendq`.
3. **RAM Persistence:** The G’s stack and variables stay in RAM. **No extra data is created**; the G is simply "parked" while the CPU moves on to other work.
4. **Resumption:** When a matching send/receive occurs, the scheduler moves the G pointer back to a **Local Run Queue** to resume.

<figure><img src="https://miro.medium.com/v2/resize:fit:1094/1*sJ9y0EHlDqpmj7gnWrnL3w.png" alt="" height="436" width="700"><figcaption><p>Channel Memory Layout</p></figcaption></figure>

## Closures <a href="#fec9" id="fec9"></a>

**The Scheduling Delay**

A common point of confusion is why goroutines don't execute immediately. When you call `go func()`, you aren't running the function "now"—you are giving a task to the Go Scheduler.

The loop is running in the `main` goroutine, which already "owns" an OS Thread (M). Because the loop is extremely fast and doesn't "block" (wait for I/O), the computer prefers to finish the loop instructions before switching to the new tasks. Consequently, the new goroutines sit in the Local Run Queue while the loop finishes.

**In Go 1.21 and older**

The closure captures the reference (memory address) of the loop variable `n`. Since the `main` goroutine usually finishes the loop before the scheduler picks up the new goroutines, they all wake up, look at the same memory address, and see the final value of the loop.

```go
numbers := []int{1, 2, 3}

for _, n := range numbers {
    // Each G holds a pointer to the SAME 'n'
    go func() {
        fmt.Println(n) 
    }()
}
// Likely output: 3, 3, 3
```

**In Go 1.22 and newer**

The Go team changed the language semantics so that the loop variable `n` is instance-per-iteration. Now, each pass through the loop creates a brand new memory address for `n`. Even if the goroutines are delayed in the queue, they each point to a unique "snapshot" of the value.

* Output: `1, 2, 3` (in random order).

***

**The Fix**

```go
for _, n := range numbers {
    // By passing 'n' as 'val', we copy the current value immediately
    go func(val int) {
        fmt.Println(val)
    }(n) 
}
```

1. The value is "captured" the moment the `go` statement is executed, not when the goroutine eventually runs.
2. Since each goroutine has its own unique copy of the value on its own stack, it doesn’t matter if the `main` loop has moved on or finished.

## Select Statement

`select` is a control structure that allows a goroutine to wait on **multiple channel operations** (send or receive) at the same time.

```go
select {
case msg := <-ch1:
    fmt.Println("Received from ch1:", msg)
case ch2 <- "ping":
    fmt.Println("Sent ping to ch2")
default:
    fmt.Println("No channel ready")
}
```

#### Common Usecases

```go
// Wait on multiple channels
select {
case msg := <-ch1:
    fmt.Println("ch1 said", msg)
case msg := <-ch2:
    fmt.Println("ch2 said", msg)
}

// Using timeout
select {
case result := <-dbResponse:
    fmt.Println("Got data:", result)
case <-time.After(3 * time.Second):
    fmt.Println("Timeout waiting for DB")
}

// Graceful shutdown
func worker(ctx context.Context, ch <-chan int) {
    for {
        select {
        case val := <-ch:
            fmt.Println("got", val)
        case <-ctx.Done():
            fmt.Println("worker stopped")
            return
        }
    }
}

// Non blocking send
select {
case ch <- 1:
    fmt.Println("sent")
default:
    fmt.Println("channel is full, skipping")
}
```

Without `select`, you’d need manual checks, polling, or additional goroutines. But with `select`, Go gives you a built-in language feature that:

* waits on multiple channels **in a single place**
* picks whichever channel is ready
* prevents your goroutine from blocking forever

```go
// Without select
for {
    if len(ch1) > 0 {
        msg := <-ch1
        fmt.Println("Got from ch1:", msg)
    }

    if len(ch2) > 0 {
        msg := <-ch2
        fmt.Println("Got from ch2:", msg)
    }

    time.Sleep(1 * time.Millisecond) // avoid CPU burn
}

// With select
select {
case msg := <-ch1:
    fmt.Println("Got from ch1:", msg)

case msg := <-ch2:
    fmt.Println("Got from ch2:", msg)
}
```

## Synchronization Primitives (`sync` package)

#### Mutex (`sync.Mutex` vs `sync.RWMutex`)

Use Mutexes when you need high-performance access to shared state (maps, structs, counters).

* Mutex: Locks for both read and write.
* RWMutex: Allows multiple readers OR one writer. Preferred for read-heavy workloads (e.g., caches).

```go
type SafeCounter struct {
    mu sync.RWMutex
    v  map[string]int
}

func (c *SafeCounter) Inc(key string) {
    c.mu.Lock()         // 🔒 Write Lock: No one else can read or write
    defer c.mu.Unlock()
    c.v[key]++
}

func (c *SafeCounter) Value(key string) int {
    c.mu.RLock()        // 🔓 Read Lock: Others can read, but no one can write
    defer c.mu.RUnlock()
    return c.v[key]
}
```

#### WaitGroup (`sync.WaitGroup`)

Calling `Add(1)` _inside_ the goroutine. This creates a race condition where `Wait()` might finish before the goroutine starts.

```go
var wg sync.WaitGroup

for i := 0; i < 3; i++ {
    wg.Add(1) // ✅ Correct: Add BEFORE starting goroutine
    go func(id int) {
        defer wg.Done()
        fmt.Printf("Worker %d starting\n", id)
    }(i)
}

wg.Wait() // Blocks until counter is 0
```

#### Atomic Operations (`sync/atomic`)

For simple counters or boolean flags, Mutex is overkill. Atomics use low-level CPU instructions (CAS - Compare And Swap). They are \~10x faster than Mutex but harder to read.

```go
var ops atomic.Int64 // Go 1.19+ types

// Inside goroutine
ops.Add(1)

// Reading
fmt.Println("Ops:", ops.Load())
```

## Advanced Patterns

#### Worker Pool

Spawning `go func()` for every HTTP then you will get Out-Of-Memory (OOM) errors. Use a Worker Pool to throttle concurrency.

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("worker %d processing job %d\n", id, j)
        time.Sleep(time.Second) // Simulate work
        results <- j * 2
    }
}

func main() {
    const numJobs = 100
    const numWorkers = 5

    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)

    // Start fixed number of workers
    for w := 1; w <= numWorkers; w++ {
        go worker(w, jobs, results)
    }

    // Send jobs
    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs) // Signal workers that no more jobs are coming

    // Collect results
    for a := 1; a <= numJobs; a++ {
        <-results
    }
}
```

#### ErrGroup (`golang.org/x/sync/errgroup`)

The modern "Senior" alternative to `sync.WaitGroup`. It handles:

1. Waiting for goroutines.
2. Error propagation (returns the first error encountered).
3. Context cancellation (if one fails, cancel the others).

```go
import "golang.org/x/sync/errgroup"

func main() {
    g, ctx := errgroup.WithContext(context.Background())
    urls := []string{"http://google.com", "http://bad-url.com", "http://bing.com"}

    for _, url := range urls {
        url := url // Capture loop var (standard in Go < 1.22)
        g.Go(func() error {
            // Check context before working
            if ctx.Err() != nil {
                return ctx.Err()
            }
            resp, err := http.Get(url)
            if err == nil {
                resp.Body.Close()
            }
            return err // If this returns error, all other Gs get cancelled via ctx
        })
    }

    if err := g.Wait(); err != nil {
        fmt.Println("Error encountered:", err)
    } else {
        fmt.Println("All fetches successful")
    }
}
```

## Goroutine Leak

Real world goroutine leak

* [https://github.com/kubernetes/kubernetes/pull/135078](https://github.com/kubernetes/kubernetes/pull/135078)
* [https://github.com/kubernetes/kubernetes/issues/134939](https://github.com/kubernetes/kubernetes/issues/134939)

Leaked goroutines cause:

* Increased memory consumption (each goroutine has its own stack)
* Increased scheduling overhead (scheduler now handles more runnable goroutines)
* Potential exhaustion of system resources

```go
// Lost goroutine due to async operations not tied to context
func handler(w http.ResponseWriter, r *http.Request) {
    go func() {
        // do db operation / send notification
        // BUG: ignores r.Context()
    }()
}
// Fix ✅
func handler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()

    go func() {
        select {
        case <-time.After(time.Second):
            // finish work
        case <-ctx.Done():    // client disconnected → abort
            return
        }
    }()
}
```

```go
// Forgetting to stop goroutines when using select + channels
func doWork(ch chan int) {
    go func() {
        for {
            select {
            case <-ch:
                // do something
            }
            // BUG: no default / no cancel path
        }
    }()
}
// Fix ✅
func doWork(ctx context.Context, ch chan int) {
    go func() {
        for {
            select {
            case <-ch:
                // do something
            case <-ctx.Done():  // required exit
                return
            }
        }
    }()
}
```

```go
// Goroutine waiting forever on a channel (blocked read/write)
// If ch stops receiving values or is never closed, worker() blocks forever.
func worker(ch <-chan int) {
    for {
        v := <-ch   // blocked forever if no one sends to ch
        fmt.Println(v)
    }
}
// Fix ✅
func worker(ctx context.Context, ch <-chan int) {
    for {
        select {
        case v, ok := <-ch:
            if !ok {           // channel closed → exit goroutine
                return
            }
            fmt.Println(v)
        case <-ctx.Done():     // cancellation → exit goroutine
            return
        }
    }
}
```

```go

// Deadlock inside goroutine due to mutual channel dependency
func main() {
    ch1 := make(chan int)
    ch2 := make(chan int)

    go func() {
        <-ch1
        ch2 <- 1 // waits forever if main never reads ch2
    }()

    <-ch2 // waits forever if goroutine never writes to ch2
}
// Fix ✅
func main() {
    ch1 := make(chan int)
    ch2 := make(chan int, 1) // buffered channel prevents deadlock

    go func() {
        <-ch1
        ch2 <- 1
    }()

    ch1 <- 1
    fmt.Println(<-ch2)
}
```

### Detect Goroutine Leak with

* [https://github.com/uber-go/goleak](https://github.com/uber-go/goleak)
