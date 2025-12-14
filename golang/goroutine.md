# Goroutine

## GPM scheduler

<figure><img src="../.gitbook/assets/gpm.png" alt=""><figcaption></figcaption></figure>

* **G (Goroutine)** → the task itself (like a cooking order). You create a goroutine whenever you want to run a function concurrently. Example: `G1`, `G2`, `G3`.
* **P (Processor)** → the scheduler’s “cooking station.” It decides which goroutine should run on which OS thread. Example: `P1`, `P2`.
* **M (Machine / OS Thread)** → the chef who executes the task. Example: `M1`, `M2`.

#### **Work Stealing (Load Balancing):**

* Each P has a Local Run Queue.
* If P1 runs out of Gs, it doesn't go idle. It checks the Global Run Queue.
* If that is empty, it attempts to steal half the Gs from P2’s queue.
* _Result:_ All CPU cores stay saturated efficiently.

#### **Syscall Handoff (Preventing Blocking):**

* If a Goroutine (G1) makes a blocking syscall (e.g., file I/O), the thread (M1) blocks.
* The Scheduler detaches P1 from M1 and moves P1 to a new (or sleeping) thread (M2).
* P1 continues executing other goroutines (G2, G3).
* When the syscall finishes, M1 tries to re-acquire a P.
* _Result:_ Thousands of syscalls don’t starve your CPU.

## Channels in Go <a href="#id-7e3b" id="id-7e3b"></a>

#### **Unbuffered channel** <a href="#bb03" id="bb03"></a>

* Send (`ch <- v`) blocks until another goroutine is ready to receive (`<-ch`)
* Receive blocks until another goroutine sends
* The sender and receiver synchronize at the channel

```go
ch := make(chan string) // unbuffered
ch <- "apple"           // ❌ blocks immediately (no receiver)
```

```go
ch := make(chan string)

go func() {
    msg := <-ch
    fmt.Println("received:", msg)
}()

ch <- "apple" // blocks until receiver is ready
```

#### **Buffered channel** <a href="#id-63b6" id="id-63b6"></a>

* Created with `make(chan T, n)`
* Capacity `n` allows sends to succeed without a receiver until the buffer is full
* Receiving only blocks when buffer is empty

```go
func main() {
    ch := make(chan string, 2)

    ch <- "apple"   
    ch <- "banana"  
    ch <- "cherry"  // blocks (buffer full)
}
```

```go
ch := make(chan string, 2)

go func() {
    for v := range ch {
        fmt.Println("received:", v)
    }
}()

ch <- "apple"
ch <- "banana"
ch <- "cherry" // waits until receiver drains a slot
```

***

## What happens to blocking channel operation? <a href="#id-6ffe" id="id-6ffe"></a>

* The goroutine is **suspended** — removed from the run queue.
* It is placed in the channel’s **send queue (`sendq`)** or **receive queue (`recvq`)**.
* Once the corresponding send or receive happens, the goroutine is **resumed**.

**Note:** No extra data is stored for the goroutine; only a reference in the channel queue.

<figure><img src="https://miro.medium.com/v2/resize:fit:1094/1*sJ9y0EHlDqpmj7gnWrnL3w.png" alt="" height="436" width="700"><figcaption></figcaption></figure>

#### **Channel Internals (`hchan`)**

Each channel keeps:

* `buf` → circular buffer (holds values for buffered channels)
* `sendq` → queue of goroutines waiting to send
* `recvq` → queue of goroutines waiting to receive
* `lock` → mutex for concurrent access

Summar&#x79;**:**

* **Buffered channels:** store values in `buf` until full; blocked senders go into `sendq`
* **Unbuffered channels:** no buffer; every send waits for a receive (and vice versa)

## Closures in goroutine <a href="#fec9" id="fec9"></a>

goroutines inside loops capturing the loop variable

```go
numbers := []int{1, 2, 3}

for _, n := range numbers {
    go func() {
        fmt.Println(n)
    }()
}
// Might print 3, 3, 3 (loop completes before goroutines run)
```

The closure captures the loop variable itself, not its value at each iteration. This means that the loop may have already completed before the goroutine has a chance to execute, causing the goroutine to read the final value of the loop variable. To fix this, you can pass the variable as an argument:

```go
for _, n := range numbers {
    go func(val int) {
        fmt.Println(val)
    }(n) // Passing 'n' by value
}
```

Since each goroutine has its own unique copy of the value, it doesn’t matter when the goroutine actually runs. It will always use the value that was passed to it, not the final value of the loop variable.

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
