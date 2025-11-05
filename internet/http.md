---
layout:
  width: wide
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
  metadata:
    visible: true
---

# HTTP

HTTP is a medium to communicate browser (client) to server (e.g, your apps). Every request send from browser to server is **stateless** (server doesn’t remember your previous request unless you use cookies, sessions, or tokens).

* The messages (request) sent is in Plain  text human-readable text (ASCII/UTF-8).
* **Request-response model** → Client asks, server replies.

## HTTP version

### **HTTP/1.0 (1996)**&#x20;

* One TCP connection → one request → one response → then closed.
* When you open a page (each image, CSS, or JS file) = new connection.
* No concept of persistent connection.

**Problems / Limitations:**

* Super inefficient → every page load = hundreds of new TCP handshakes.
* No host header originally → couldn’t host multiple sites on one IP easily.
* Poor caching rules.

### **HTTP/1.1 (1997 – still widely used)**

**Fixes introduced:**

* **Persistent connections** (keep-alive): one TCP connection can handle multiple requests sequentially.
* **Chunked transfer encoding**: stream data without knowing total size upfront.
* **Host header**: enabled virtual hosting (multiple domains on one server/IP).
* Better caching, range requests (download partial files).

**Problems / Limitations:**

* **Head-of-line blocking**: even with keep-alive, requests must go sequentially → one slow response blocks all following ones.
* Lots of redundant headers sent with every request (e.g., `User-Agent`, `Cookies` repeated each time).
* Browsers worked around limits by opening 6–8 TCP connections per domain → wasted resources.

### **HTTP/2 (2015)**

**Fixes introduced:**

* **Binary framing**: replaced text protocol with compact binary → faster parsing, less overhead.
* **Multiplexing**: multiple requests/responses at once over a single TCP connection (no blocking).
* **Header compression (HPACK)**: repeated headers compressed efficiently.
* **Server push**: server can proactively send assets client will need.

**Problems / Limitations:**

* Still built on **TCP** → if one packet is lost, the entire TCP stream stalls (head-of-line blocking at transport layer).
* Server push ended up underused/abused (sent too much, wasted bandwidth).
* Complex debugging compared to plain text HTTP/1.1.

### **HTTP/3 (2020s, now rolling out)**

**Fixes introduced:**

* Runs on **QUIC (built on UDP)** instead of TCP.
* Eliminates transport-level head-of-line blocking: if one packet is lost, only that stream is affected, not the whole connection.
* Faster connection setup → 0-RTT handshakes with TLS 1.3 baked in.
* Connection migration → if you switch networks (Wi-Fi → 4G), session persists without reconnect.

**Problems / Tradeoffs:**

* More CPU intensive (encryption mandatory, QUIC is complex).
* Firewalls/middleboxes sometimes block UDP → fallback to HTTP/2.
* Debugging is harder than TCP-based protocols.

| Feature                   | HTTP/1.0 (1996)                             | HTTP/1.1 (1997)                                   | HTTP/2 (2015)                                                             | HTTP/3 (2020)                                               |
| ------------------------- | ------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Protocol encoding**     | Text-based (ASCII)                          | Text-based (ASCII/UTF-8)                          | Binary framing (HPACK for headers)                                        | Binary framing (QPACK for headers)                          |
| **Connections**           | One request per TCP connection              | Persistent connections (`keep-alive`)             | Single TCP connection, multiplexed streams                                | Single QUIC (UDP) connection, multiplexed streams           |
| **Head-of-line blocking** | Severe (every resource = new TCP handshake) | Still present (sequential per connection)         | Solved at app layer with multiplexing, but TCP-level HOL blocking remains | Eliminated via QUIC streams                                 |
| **Parallel requests**     | Multiple TCP connections needed (slow)      | Limited to \~6 TCP connections per domain         | Many streams over one TCP connection                                      | Many streams over one QUIC connection                       |
| **Host header**           | ❌ Not supported                             | ✅ Mandatory (`Host:`) → virtual hosting           | ✅                                                                         | ✅                                                           |
| **Caching**               | Basic/weak                                  | `Cache-Control`, `ETag`, validators               | Same as 1.1                                                               | Same as 1.1                                                 |
| **Transfer encoding**     | Must know Content-Length                    | Chunked transfer encoding supported               | Framed binary chunks                                                      | Framed binary chunks                                        |
| **Partial content**       | ❌ Not supported                             | ✅ `Range:` requests                               | ✅                                                                         | ✅                                                           |
| **Compression**           | ❌ None                                      | ❌ None (gzip only in body, optional)              | ✅ HPACK header compression                                                | ✅ QPACK header compression                                  |
| **Server push**           | ❌                                           | ❌                                                 | ✅ Server Push                                                             | ❌ (dropped in latest drafts, replaced by “103 Early Hints”) |
| **TLS/Encryption**        | Optional (via HTTPS, SSL 2/3 at the time)   | Optional (HTTPS/TLS 1.0+)                         | Mandatory in browsers (TLS 1.2+)                                          | Built-in TLS 1.3 in QUIC                                    |
| **Connection setup**      | TCP handshake                               | TCP handshake + optional TLS                      | TCP + TLS handshake (multiple round-trips)                                | QUIC with TLS 1.3 → 0-RTT or 1-RTT handshake                |
| **Connection migration**  | ❌ Breaks if IP changes                      | ❌ Breaks if IP changes                            | ❌ Breaks if IP changes                                                    | ✅ Connection survives IP/network changes                    |
| **Performance**           | Very slow for modern sites                  | Better (pipelining, keep-alive) but still limited | Big speed-up (multiplexing, compression)                                  | Faster, resilient (low latency, no HOL blocking)            |
| **Debugging**             | Easy (plain text)                           | Easy (plain text)                                 | Harder (binary)                                                           | Hardest (binary + encrypted over QUIC)                      |
| **Adoption status**       | Obsolete                                    | Still widely supported, fallback                  | Widely deployed (major CDNs, browsers)                                    | Rapid adoption (Google, Cloudflare, Facebook, YouTube)      |

## Reference

* [RFC 1945 — HTTP/1.0 (1996)](https://www.rfc-editor.org/rfc/rfc1945)
* [RFC 2616 — HTTP/1.1 (1997, now obsolete)](https://www.rfc-editor.org/rfc/rfc2616)
  * HTTP/1.1 was later split and replaced by:
    * [RFC 7230 — HTTP/1.1: Message Syntax and Routing](https://www.rfc-editor.org/rfc/rfc7230)
    * [RFC 7231 — HTTP/1.1: Semantics and Content](https://www.rfc-editor.org/rfc/rfc7231)
    * (7230–7235 as the full replacement set)
* [RFC 7540 — HTTP/2 (2015)](https://www.rfc-editor.org/rfc/rfc7540)
  * Header compression (HPACK):
    * [RFC 7541 — HPACK: Header Compression](https://www.rfc-editor.org/rfc/rfc7541)
* [RFC 9114 — HTTP/3 (2022)](https://www.rfc-editor.org/rfc/rfc9114)
  * QUIC transport layer:
    * [RFC 9000 — QUIC: A UDP-Based Multiplex Transport](https://www.rfc-editor.org/rfc/rfc9000)
  * QUIC + TLS 1.3 handshake:
    * [RFC 9001 — Using TLS with QUIC](https://www.rfc-editor.org/rfc/rfc9001)
  * Header compression (QPACK):
    * [RFC 9204 — QPACK: Header Compression for HTTP/3](https://www.rfc-editor.org/rfc/rfc9204)
