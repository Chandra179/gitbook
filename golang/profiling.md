---
description: reading profiling
---

# Profiling

## Heap

```
heap profile: 133: 4702984 [4006: 105007600] @ heap/1048576
0: 0 [3: 96] @ 0x99840b 0x99823a 0x99822d 0xad2dbb 0xad2e3d 0xf83deb 0xacc242 0xacc12d 0xacc0dc 0xac8e9e 0x4b2001
#	0x99840a	github.com/nlnwa/whatwg-url/url.(*parser).BasicParser+0xca		/app/vendor/github.com/nlnwa/whatwg-url/url/parser.go:115
#	0x998239	github.com/nlnwa/whatwg-url/url.(*parser).Parse+0x39			/app/vendor/github.com/nlnwa/whatwg-url/url/parser.go:53
#	0x99822c	github.com/nlnwa/whatwg-url/url.(*parser).ParseRef+0x2c			/app/vendor/github.com/nlnwa/whatwg-url/url/parser.go:61
#	0xad2dba	github.com/gocolly/colly/v2.(*Request).AbsoluteURL+0x7a			/app/vendor/github.com/gocolly/colly/v2/request.go:108
#	0xad2e3c	github.com/gocolly/colly/v2.(*Request).Visit+0x1c			/app/vendor/github.com/gocolly/colly/v2/request.go:119
#	0xf83dea	axora/crawler.(*Crawler).Crawl.(*Crawler).OnHTML.func1+0x8a		/app/crawler/dom_handler.go:24
#	0xacc241	github.com/gocolly/colly/v2.(*Collector).handleOnHTML.func1+0x3a1	/app/vendor/github.com/gocolly/colly/v2/colly.go:1191
#	0xacc12c	github.com/PuerkitoBio/goquery.(*Selection).Each+0x28c			/app/vendor/github.com/PuerkitoBio/goquery/iteration.go:12
#	0xacc0db	github.com/gocolly/colly/v2.(*Collector).handleOnHTML+0x23b		/app/vendor/github.com/gocolly/colly/v2/colly.go:1181
#	0xac8e9d	github.com/gocolly/colly/v2.(*Collector).fetch+0x6bd			/app/vendor/github.com/gocolly/colly/v2/colly.go:730
```

| Value                          | Meaning                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| **133**                        | Number of currently allocated objects (live objects in heap)          |
| **4702984 bytes (\~4.7 MB)**   | Current total live memory allocated                                   |
| **4006**                       | Total objects allocated since start of program (including freed ones) |
| **105007600 bytes (\~105 MB)** | Total cumulative memory allocated over time                           |

## Goroutine

```
http://localhost:8002/debug/pprof/goroutine?debug=1

goroutine profile: total 97926
97908 @ 0x4aa18e 0x43e1ab 0x43ddf7 0xad1d2b 0xad1667 0xac8d09 0x4b2001
#	0xad1d2a	github.com/gocolly/colly/v2.(*httpBackend).Do+0x8a	/app/vendor/github.com/gocolly/colly/v2/http_backend.go:172
#	0xad1666	github.com/gocolly/colly/v2.(*httpBackend).Cache+0x126	/app/vendor/github.com/gocolly/colly/v2/http_backend.go:133
#	0xac8d08	github.com/gocolly/colly/v2.(*Collector).fetch+0x528	/app/vendor/github.com/gocolly/colly/v2/colly.go:711

3 @ 0x4aa18e 0x46cab7 0x4a9365 0x52dd67 0x52f059 0x52f047 0x5ff905 0x60f325 0x73f234 0x6c3f63 0x6c4093 0x744a65 0x4b2001
#	0x4a9364	internal/poll.runtime_pollWait+0x84		/usr/local/go/src/runtime/netpoll.go:351
#	0x52dd66	internal/poll.(*pollDesc).wait+0x26		/usr/local/go/src/internal/poll/fd_poll_runtime.go:84
#	0x52f058	internal/poll.(*pollDesc).waitRead+0x278	/usr/local/go/src/internal/poll/fd_poll_runtime.go:89
#	0x52f046	internal/poll.(*FD).Read+0x266			/usr/local/go/src/internal/poll/fd_unix.go:165
#	0x5ff904	net.(*netFD).Read+0x24				/usr/local/go/src/net/fd_posix.go:68
#	0x60f324	net.(*conn).Read+0x44				/usr/local/go/src/net/net.go:196
#	0x73f233	net/http.(*connReader).Read+0x153		/usr/local/go/src/net/http/server.go:812
#	0x6c3f62	bufio.(*Reader).fill+0x102			/usr/local/go/src/bufio/bufio.go:113
#	0x6c4092	bufio.(*Reader).Peek+0x52			/usr/local/go/src/bufio/bufio.go:152
#	0x744a64	net/http.(*conn).serve+0x7c4			/usr/local/go/src/net/http/server.go:2145
```

```
http://localhost:6060/debug/pprof/goroutine?debug=2

goroutine 92399 [running]:
runtime/pprof.writeGoroutineStacks({0x1a66760, 0xc0395312c0})
	/usr/local/go/src/runtime/pprof/pprof.go:756 +0x6b
runtime/pprof.writeGoroutine({0x1a66760?, 0xc0395312c0?}, 0x31?)
	/usr/local/go/src/runtime/pprof/pprof.go:745 +0x25
runtime/pprof.(*Profile).WriteTo(0x2cb16b0?, {0x1a66760?, 0xc0395312c0?}, 0xc?)
	/usr/local/go/src/runtime/pprof/pprof.go:371 +0x14b
net/http/pprof.handler.ServeHTTP({0xc020d99631, 0x9}, {0x1a70a40, 0xc0395312c0}, 0xc02de2ea00)
	/usr/local/go/src/net/http/pprof/pprof.go:272 +0x52a
net/http/pprof.Index({0x1a70a40, 0xc0395312c0}, 0xc02de2ea00?)
	/usr/local/go/src/net/http/pprof/pprof.go:389 +0xda
net/http.HandlerFunc.ServeHTTP(0x2e7bc40?, {0x1a70a40?, 0xc0395312c0?}, 0x73ec56?)
	/usr/local/go/src/net/http/server.go:2322 +0x29
net/http.(*ServeMux).ServeHTTP(0x4a6b19?, {0x1a70a40, 0xc0395312c0}, 0xc02de2ea00)
	/usr/local/go/src/net/http/server.go:2861 +0x1c7
net/http.serverHandler.ServeHTTP({0xc02636a800?}, {0x1a70a40?, 0xc0395312c0?}, 0x6?)
	/usr/local/go/src/net/http/server.go:3340 +0x8e
net/http.(*conn).serve(0xc0218c8630, {0x1a729d8, 0xc002980c30})
	/usr/local/go/src/net/http/server.go:2109 +0x665
created by net/http.(*Server).Serve in goroutine 1
	/usr/local/go/src/net/http/server.go:3493 +0x485
```

### What you should look for

| Symptom                                    | Interpretation                            |
| ------------------------------------------ | ----------------------------------------- |
| Lots of goroutines waiting in `netpoll.go` | network I/O blocking (normal for servers) |
| Many goroutines stuck in `sync.Mutex.Lock` | lock contention (performance issue)       |
| Goroutines never exiting (growing count)   | goroutine leak                            |
