---
description: reading profiling
---

# Profiling

## Heap

```
go tool pprof http://localhost:8002/debug/pprof/heap

(pprof) top
Showing nodes accounting for 29780.85kB, 86.60% of 34390.35kB total
Showing top 10 nodes out of 136
      flat  flat%   sum%        cum   cum%
15206.23kB 44.22% 44.22% 15206.23kB 44.22%  regexp/syntax.(*compiler).inst (inline)
 5140.59kB 14.95% 59.16%  5140.59kB 14.95%  github.com/markusmobius/go-dateparser/internal/data.merge
 2575.02kB  7.49% 66.65%  2575.02kB  7.49%  regexp/syntax.cleanAlt
 2048.22kB  5.96% 72.61%  2048.22kB  5.96%  regexp/syntax.(*parser).newRegexp (inline)
 1723.02kB  5.01% 77.62%  1723.02kB  5.01%  github.com/forPelevin/gomoji.map.init.0
 1024.16kB  2.98% 80.60% 21877.68kB 63.62%  regexp.compile
```

* **flat**: Memory allocated **directly in this function**
* **flat%:** % of total heap allocated **by this function alone**
* **cum:** Cumulative memory for this function **and the functions it calls**
* **cum%**: % of total memory including child calls

<figure><img src="../.gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

| Concept            | Meaning                                              |
| ------------------ | ---------------------------------------------------- |
| **Wide block**     | High memory allocation at that function              |
| **Tall stack**     | Lots of nested calls (deep call chain)               |
| Each block’s width | Memory allocated _by that function and its children_ |

Wide = expensive\
Low = deeper in call stack

### What you should look for

| Symptom                                    | Interpretation                            |
| ------------------------------------------ | ----------------------------------------- |
| Lots of goroutines waiting in `netpoll.go` | network I/O blocking (normal for servers) |
| Many goroutines stuck in `sync.Mutex.Lock` | lock contention (performance issue)       |
| Goroutines never exiting (growing count)   | goroutine leak                            |
