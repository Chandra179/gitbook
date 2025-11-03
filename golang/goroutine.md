# Goroutine

Tiny initial stack (\~2 KB vs \~1 MB for an OS thread).

### GPM scheduler

<figure><img src="../.gitbook/assets/image (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

* **G (Goroutine):** Represents the task itself, like your cooking order. You **create** a goroutine whenever you want to run a function concurrently. In our example, `G1`, `G2`, `G3` are orders created by the developer.
* **P (Processor):** Represents a cooking station. It **schedules goroutines** to be executed by an OS thread. Here, `P1` and `P2` decide which chef will cook which order.
* **M (OS Thread):** Represents the chef who actually cooks. It **executes the goroutine** assigned by the processor. `M1` and `M2` are chefs in this kitchen.

### Channels in Go <a href="#id-7e3b" id="id-7e3b"></a>

#### **Unbuffered channel** <a href="#bb03" id="bb03"></a>

* A send (`ch <- v`) will block until another goroutine is ready to receive (`<-ch`)
* Similarly, a receive will block until some goroutine sends.
* the sender and receiver must be _synchronized_ — they meet at the channel.

```go
func main() {
    ch := make(chan string) // unbuffered
    ch <- "apple"           // ❌ blocks immediately
    // no other goroutine is ready to receive
}
```

```go
func main() {
    ch := make(chan string)

    // Receiver
    go func() {
        msg := <-ch
        fmt.Println("received:", msg)
    }()

    // Sender
    ch <- "apple" // this blocks until receiver is ready
}
```

#### **Buffered channel** <a href="#id-63b6" id="id-63b6"></a>

* Created with `make(chan T, n)`
* It has capacity `n`. Sending only blocks if the buffer is full.
* Receiving only blocks if the buffer is empty.

```go
func main() {
    ch := make(chan string, 2)

    ch <- "apple"   
    ch <- "banana"  
    ch <- "cherry"  // blocks (buffer full, no receiver)
}
```

```go
func main() {
    ch := make(chan string, 2)

    // Receiver
    go func() {
        for v := range ch {
            fmt.Println("received:", v)
        }
    }()

    // Sender
    ch <- "apple"
    ch <- "banana"
    ch <- "cherry" // waits until receiver drains one slot
}
```

### What happens to blocking channel operation? <a href="#id-6ffe" id="id-6ffe"></a>

When a goroutine hits a blocking channel operation (`ch <- v` or `<-ch`), the Go runtime does not store “extra data” in memory. Instead:

* The goroutine is suspended — it’s removed from the scheduler’s run queue.
* It is placed into the channel’s wait queue (`sendq` or `recvq`).
* If a goroutine was sending, it will remain suspended until some other goroutine does a receive.
* If a goroutine was receiving, it will remain suspended until some other goroutine does a send.

Press enter or click to view image in full size

<figure><img src="https://miro.medium.com/v2/resize:fit:1094/1*sJ9y0EHlDqpmj7gnWrnL3w.png" alt="" height="436" width="700"><figcaption></figcaption></figure>

**Inside the channel (`hchan`** in the runtim&#x65;**)**\
Each channel internally keeps:

* **`buf`** → a circular array (the buffer, size = capacity).
* **`sendq`** → FIFO queue of waiting senders.
* **`recvq`** → FIFO queue of waiting receivers.
* **`lock`** → a mutex to synchronize access.

So:

* **Buffered channels** store values in `buf` until it’s full. Once full, additional senders are queued in `sendq`.
* **Unbuffered channels** have no buffer at all — every send must directly hand off to a receive (and vice versa). If the matching side isn’t ready, the goroutine waits in the queue until it arrives.

### Closures in goroutine <a href="#fec9" id="fec9"></a>

You’ve probably used goroutine in a loop before. There’s a common problem if you write the code like this:

```go
numbers := []int{1, 2, 3}

 for _, n := range numbers {
  go func() {
   fmt.Println(n)
  }()
 }
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
