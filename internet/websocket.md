# WebSocket

A **WebSocket** is a protocol that provides **full-duplex, persistent communication** between a client (usually a browser) and a server over a single TCP connection.

* Unlike HTTP, which is **request-response**, WebSocket allows **both client and server to send data at any time**.
* Often used for **real-time applications**: chat apps, live notifications, gaming, trading platforms.

## How it works?

#### **Step 1: Handshake**

* The client sends an HTTP request with a special header:

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

* Key points:
  * **Upgrade: websocket** → asking server to switch protocols.
  * **Connection: Upgrade** → keep TCP connection open.
  * **Sec-WebSocket-Key** → Base64 key for server to validate handshake.
* The server responds with:

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

* After this, the connection switches from HTTP to **WebSocket protocol**.

#### **Step 2: Data Frames**

* Communication happens in **frames**, not HTTP messages.
* Each frame can carry:
  * **Text** (UTF-8)
  * **Binary data** (like images, audio)
  * **Control frames** (ping/pong, closing connection)
* Frames are **smaller and more efficient** than repeated HTTP requests.

#### **Step 3: Full-duplex**

* Both client and server can **send messages independently**:
  * Browser can push chat messages.
  * Server can push live updates instantly.
* No repeated HTTP handshakes, which reduces latency.
