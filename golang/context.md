# Context

`Context` is a mechanism for controlling the lifetime of operations—not just goroutines. It propagates cancellation signals, timeouts / deadlines, and small request-scoped metadata across function calls, APIs, and goroutines.

## Why Do We Need `context`?

Imagine an HTTP request triggers 5 goroutines (DB call, external API call, logging, etc).\
If the client disconnects, or the request times out:

> Without `context`, your goroutines continue running and waste resources.

With context:

> One cancellation signal stops every goroutine involved.

This prevents:

* goroutine leaks
* wasted DB calls
* wasted API calls

## Types Of Context

```go
Background (root)
   └── WithTimeout (5s)
         └── WithCancel
               ├── goroutine A
               └── goroutine B
```

<table><thead><tr><th width="166.890625">Type</th><th>Function</th><th>How it's created</th></tr></thead><tbody><tr><td><strong>Background</strong></td><td>base/root context (never canceled)</td><td><code>context.Background()</code></td></tr><tr><td><strong>TODO</strong></td><td>placeholder context when you don't know what to use yet</td><td><code>context.TODO()</code></td></tr><tr><td><strong>WithCancel</strong></td><td>cancels manually</td><td><code>context.WithCancel(ctx)</code></td></tr><tr><td><strong>WithTimeout</strong></td><td>cancels after X time</td><td><code>context.WithTimeout(ctx, 3 * time.Second)</code></td></tr><tr><td><strong>WithDeadline</strong></td><td>cancels at a specific time</td><td><code>context.WithDeadline(ctx, time.Now().Add(time.Second))</code></td></tr><tr><td><strong>WithValue</strong></td><td>attaches metadata (request-scoped)</td><td><code>context.WithValue(ctx, key, val)</code></td></tr></tbody></table>

| Use case                             | Which context to use     |
| ------------------------------------ | ------------------------ |
| Server startup / main function       | `Background`             |
| You genuinely don’t know yet         | `TODO`                   |
| Manual stop (user presses stop)      | `WithCancel`             |
| Timeout external service call        | `WithTimeout`            |
| Deadline aligned with client request | `WithDeadline`           |
| Pass trace IDs / request IDs / auth  | `WithValue` (sparingly!) |

## Child Context

A context tree is formed when one context is derived from another.

```go
parent := context.Background()
child, cancel := context.WithCancel(parent)
```

If parent has a timeout shorter than child’s timeout, child's timeout is ignored — parent wins.

```go
parent, cancelParent := context.WithTimeout(context.Background(), 1*time.Second)
child, cancelChild := context.WithTimeout(parent, 10*time.Second)
```

Even though child requests 10 seconds, it will be cancelled after **1 second**. Why do we create child contexts?&#x20;

| Situation                                          | What child context does |
| -------------------------------------------------- | ----------------------- |
| You need to add a timeout for a specific operation | `WithTimeout(parent)`   |
| You need to pass metadata down only to children    | `WithValue(parent)`     |
| You want finer cancel control                      | `WithCancel(parent)`    |
