# Goroutine

## GPM scheduler

<figure><img src="../.gitbook/assets/image (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

* **G (Goroutine)** → the task itself (like a cooking order). You create a goroutine whenever you want to run a function concurrently. Example: `G1`, `G2`, `G3`.
* **P (Processor)** → the scheduler’s “cooking station.” It decides which goroutine should run on which OS thread. Example: `P1`, `P2`.
* **M (Machine / OS Thread)** → the chef who executes the task. Example: `M1`, `M2`.

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
* Receiving only blocks when buffer is empt

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

## What happens to blocking channel operation? <a href="#id-6ffe" id="id-6ffe"></a>

* The goroutine is **suspended** — removed from the run queue.
* It is placed in the channel’s **send queue (`sendq`)** or **receive queue (`recvq`)**.
* Once the corresponding send or receive happens, the goroutine is **resumed**.

{% hint style="info" %}
**Note:** No extra data is stored for the goroutine; only a reference in the channel queue.
{% endhint %}

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

Common pitfall: goroutines inside loops capturing the loop variable

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
