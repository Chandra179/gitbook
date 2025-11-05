---
description: networking related concepts.
---

# NAT

### Home network example (packet flow)

**Setup:**

* Your device: `192.168.1.50` (private)
* Router LAN IP: `192.168.1.1` (private)
* Router WAN (public): `145.23.66.90` (assigned by ISP)
* Destination: `Spotify` (public IP)

**Flow:**

1. Device sends packet: `src=192.168.1.50` → `dst=SpotifyIP`.
2. Router performs NAT: rewrites source to `src=145.23.66.90:ephemeral`.
3. Packet leaves to internet; replies return to router's public IP.
4. Router maps reply back to the original private IP/port and forwards to the device.

**Key point:** Private addresses (e.g., `192.168.1.0/24`) are not routable on the public Internet.

### Private vs public IP ranges

Common RFC1918 private ranges (not routable on the public internet):

* `10.0.0.0/8`
* `172.16.0.0/12`
* `192.168.0.0/16`

**Example:** `192.168.1.0/24` → available host addresses `192.168.1.1`–`192.168.1.254`.

**Exposing private hosts:** only possible with VPN, port forwarding, reverse proxy, or tunneling.

### NAT mapping & filtering

NAT behavior is described by two orthogonal properties

#### Mapping behavior (how internal IP:port → external IP:port is assigned)

**Endpoint-Independent Mapping (EIM)** \
internal endpoint maps to the same external port regardless of destination.

```
Internal: 192.168.1.10:5000 → External: 203.0.113.5:62000
Destination #1: 8.8.8.8:53 → 203.0.113.5:62000
Destination #2: 1.1.1.1:53 → 203.0.113.5:62000
Same external port for all destinations.
```

**Address-Dependent Mapping (ADM)** \
mapping depends on the remote IP (different remote IP → new external port).

```
Internal: 192.168.1.10:5000
Destination #1: 8.8.8.8:53 → External: 203.0.113.5:62001
Destination #2: 1.1.1.1:53 → External: 203.0.113.5:62002
Mapping changes with different remote IPs.
```

**Address-and-Port-Dependent Mapping (APDM / Symmetric mapping)** \
mapping depends on remote IP _and_ remote port (strictest).

```
Internal: 192.168.1.10:5000 → 
• To 8.8.8.8:53 → External: 203.0.113.5:62003
• To 8.8.8.8:80 → External: 203.0.113.5:62004
• To 1.1.1.1:53 → External: 203.0.113.5:62005
Mapping changes with both remote IP and port.
```

#### Filtering behavior (what incoming packets are accepted)

**Endpoint-Independent Filtering (EIF)** \
any host may send back to the mapped external port (once mapping exists) i.e, P2P apps, online games, VoIP (because peers may change IPs or come from multiple sources).

```
Outgoing: 192.168.1.10:5000 → 8.8.8.8:53 (mapped to 203.0.113.5:62000)
Incoming: Any host can send to 203.0.113.5:62000 and it will be accepted.
Open to any source once mapping exists.
```

**Endpoint-Dependent Filtering (EDF)** \
only the remote IP that was contacted can send back. ie. General internet access, where you only expect responses from the same server you contacted.

```
Outgoing: 192.168.1.10:5000 → 8.8.8.8:53 (mapped to 203.0.113.5:62000)
Incoming: Only packets from 8.8.8.8:* are accepted.
Restricted by remote IP.
```

**Port-Restricted Filtering** \
only the exact remote IP+port can send back.

```
Outgoing: 192.168.1.10:5000 → 8.8.8.8:53 (mapped to 203.0.113.5:62000)
Incoming: Only packets from 8.8.8.8:53 are accepted.
Restricted by remote IP and port.
```

{% hint style="info" %}
The router (or NAT device) decides which rule to use for (mapping & filtering)
{% endhint %}

### NAT variants & practical impacts

* **Full Cone NAT** — easiest for incoming connections: 1:1 mapping, accepts from any remote. Great for P2P.
* **Restricted Cone NAT** — accepts replies only from IPs you previously contacted.
* **Port-Restricted Cone** — accepts replies only from same IP _and_ port.
* **Symmetric NAT** — different external port per destination; strict filtering: breaks direct P2P; usually needs relays.
* **Double NAT** — two layers of NAT (e.g., home router behind ISP CGN): makes traversal harder.
* **Carrier-Grade NAT (CGNAT)** — ISP-level NAT, shared public IPs, often disallows direct inbound connections.

#### Table: P2P/Traversal viability

| NAT Type             |         Mapping behavior | Filtering behavior      |     UPnP    |   Hole punch   |     Direct P2P     |
| -------------------- | -----------------------: | ----------------------- | :---------: | :------------: | :----------------: |
| Full Cone            | 1:1 (same external port) | Accepts from any remote |      ✅      |     ✅ Easy     |        ✅ Yes       |
| Restricted Cone      |                      1:1 | Known IPs only          |      ✅      |    ✅ Likely    |  ✅ Yes (with STUN) |
| Port-Restricted Cone |                      1:1 | Known IPs & ports       | ✅ Sometimes |  ⚠️ Sometimes  |      ⚠️ Maybe      |
| Symmetric NAT        |    per-destination ports | Known IP+port only      |   ❌ Rarely  | ❌ Almost never | ❌ No — needs relay |
| Double NAT           |                   Varies | Varies                  |   ❌ Rarely  |  ❌ Usually not |        ❌ No        |
| CGNAT                |                ISP-level | Highly restrictive      |     ❌ No    |     ❌ Never    |       ❌ Never      |

### Hairpinning (NAT loopback)

**Scenario:** Two hosts behind the same NAT (router) want to communicate via the public IP.

* Host A (`192.168.1.10`) → Host B (`192.168.1.11:5000`) is mapped to `203.0.113.5:40000`.
* A sends to `203.0.113.5:40000`.
* NAT recognizes the destination is one of its own external mappings and forwards the packet back to `192.168.1.11:5000`.

**Result:** Internal-to-internal communication via the router's public address — useful for P2P bootstrap and some signaling flows.

### NAT traversal techniques for P2P

#### **STUN (hole punching)**&#x20;

* STUN (Session Traversal Utilities for NAT) is used to **discover your public IP and port mapping** created by the NAT.
* Your app sends a request to a **STUN server** on the internet. The server replies with the public IP and port it sees (the NAT’s external mapping).
* Then, both peers exchange these public endpoints and simultaneously send packets to each other, creating NAT table entries (“holes”) on both sides.

```
Peer A (192.168.1.10:5000) → STUN → gets 203.0.113.5:62000
Peer B (10.0.0.20:4000) → STUN → gets 198.51.100.7:53000
Peers exchange these addresses and send UDP packets directly:
203.0.113.5:62000 ⇄ 198.51.100.7:53000
```

Both peers **must send packets from the same local port** used for STUN discovery.\
Why?\
Because the NAT mapping is tied to a specific `(internal IP:port)` → `(external IP:port)` pair.\
If the app opens a new local port when talking to the peer, the NAT creates a _new_ mapping — the other peer’s stored address becomes invalid, and packets are dropped.

That’s why many P2P systems (like **WebRTC**) **bind a single UDP socket** and reuse it for both STUN and peer traffic — to guarantee same-port usage and stable mappings. Works when

* NAT mapping is **Endpoint-Independent (EIM)** (stable across destinations).
* Sometimes works under **Address-Dependent Mapping (ADM)**, if both peers send to the exact remote IP discovered via STUN.

Fails under **Symmetric NAT** or **Carrier-Grade NAT (CGNAT)** because mappings change per destination or inbound packets are blocked.

#### **TURN (relay)**&#x20;

TURN (Traversal Using Relays around NAT) is a **relay-based fallback**. When direct connection fails (e.g., under Symmetric NAT), both peers establish **outbound connections** to a TURN server. The TURN server **forwards data** between them guaranteeing connectivity but with added latency and cost.&#x20;

**Relay works with** **All NAT types** because both peers only make **outbound** connections (which NATs always allow). Even Symmetric and Carrier-Grade NAT (CGNAT) users can connect through TURN.&#x20;

TURN **is required** when **either peer’s NAT mapping changes per destination**, **and** STUN hole punching fails.

**Trade-off:**

* Always works, but slower (extra hop) and consumes server bandwidth.
* Used only as a last resort when STUN hole punching fails.

{% hint style="info" %}
TURN doesn’t rely on inbound holes — both sides connect outward to the relay, which NATs always permit.
{% endhint %}

#### **UPnP / NAT-PMP**&#x20;

UPnP (Universal Plug and Play) and NAT-PMP (NAT Port Mapping Protocol) are **router APIs** that let a local device **ask the router to open and forward a port** automatically. This creates a **static port mapping** on the NAT device like manual port forwarding, but dynamic and programmatic.

```
App → Router (UPnP request): "Please map 192.168.1.10:5000 → external 203.0.113.5:62000"
Router sets up mapping.
Now any external peer can connect to 203.0.113.5:62000 directly.
```

#### ICE (Interactive Connectivity Establishment)&#x20;

ICE is a **combined, adaptive approach** that automatically tests and selects the best possible connection path.\
It uses:

* **STUN** → try direct hole punching first.
* **TURN** → use relay if direct fails.
* **UPnP/NAT-PMP** → use local port mapping if possible.

Each peer gathers **candidates** (possible connection endpoints: local, public via STUN, and relay via TURN), exchanges them, and tests connectivity.

```
Peer A candidates:
 - Local: 192.168.1.10:5000
 - STUN: 203.0.113.5:62000
 - TURN: turn.example.com:3478

Peer B candidates:
 - Local: 10.0.0.20:4000
 - STUN: 198.51.100.7:53000
 - TURN: turn.example.com:3478

ICE tries each path until one succeeds.

```

### Checking your router / tools

* Quick local checks: `upnpc -l` (UPnP client)
* NAT type test tools: `punch-check` (GitHub: delthas/punch-check)

## Reference

* [RFC 1918 — Address Allocation for Private Internets](https://datatracker.ietf.org/doc/html/rfc1918)
* [RFC 4787 — NAT Behavioral Requirements for Unicast UDP](https://datatracker.ietf.org/doc/html/rfc4787)
* [RFC 5128 — Common Requirements for NAT Traversal in Peer-to-Peer Applications](https://datatracker.ietf.org/doc/html/rfc5128)
* [STUN RFC 5389 — Session Traversal Utilities for NAT](https://datatracker.ietf.org/doc/html/rfc5389)
* [TURN RFC 8656 — Traversal Using Relays around NAT](https://datatracker.ietf.org/doc/html/rfc8656)
* [ICE RFC 8445 — Interactive Connectivity Establishment](https://datatracker.ietf.org/doc/html/rfc8445)
