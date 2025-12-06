# NAT & P2P Traversal

#### Packet Flow

**Scenario:** A device inside a home network talks to a public server.

* **Internal:** Your Device (`192.168.1.50`)
* **Gateway:** Router (`WAN: 145.23.66.90` | `LAN: 192.168.1.1`)
* **External:** Spotify (`Public IP`)

**The Lifecycle:**

1. **Outbound:** Device sends `src=192.168.1.50:5000` → `dst=Spotify`.
2. **Rewrite (NAT):** Router replaces source with `src=145.23.66.90:41200` (an ephemeral port).
3. **Inbound:** Spotify replies to `145.23.66.90:41200`.
4. **Lookup & Forward:** Router checks its mapping table, translates back to `192.168.1.50:5000`, and forwards.

***

#### NAT Mapping & Filtering

Modern NAT behavior (RFC 4787) is defined by two rules: **How it maps outgoing** and **Who it lets in**.

**A. Mapping Behavior (Outgoing)**

* **Endpoint-Independent Mapping (EIM):** The router reuses the **same external port** (`:62000`) for the internal host, regardless of where it is sending packets.
* **Address-Dependent Mapping (ADM):** Sending to a **new IP** results in a **new external port**.
* **Address-and-Port-Dependent Mapping (Symmetric):** Sending to a **new IP** OR **new port** results in a **new external port**. (Strictest).

**B. Filtering Behavior (Incoming)**

* **Endpoint-Independent Filtering (EIF):** Once a mapping is open, **anyone** can send packets to it. (Great for P2P).
* **Address-Restricted:** Only the **IP you contacted** can reply.
* **Port-Restricted:** Only the exact **IP and Port** you contacted can reply.

***

#### NAT Types & Viability Table

_Synthesizing the mechanics into classic definitions and P2P impact._

| Classic Name        | Mapping Rule             | Filtering Rule       | STUN/Hole Punch |  Direct P2P? |
| ------------------- | ------------------------ | -------------------- | :-------------: | :----------: |
| **Full Cone**       | Endpoint-Independent     | Endpoint-Independent |      ✅ Easy     |     ✅ Yes    |
| **Restricted Cone** | Endpoint-Independent     | Address-Restricted   |     ✅ Likely    |     ✅ Yes    |
| **Port-Restricted** | Endpoint-Independent     | Port-Restricted      |    ⚠️ Complex   |   ⚠️ Maybe   |
| **Symmetric**       | Per-Destination (Strict) | Port-Restricted      |     ❌ Fails     | ❌ Relay Only |
| **CGNAT**           | ISP-level NAT            | Highly Restrictive   |       ❌ No      | ❌ Relay Only |

***

#### Traversal Solutions

_How to establish connectivity when behind NAT._

**A. STUN (Hole Punching)**

* **Mechanism:** Client asks a public STUN server: "What is my public IP:Port?"
* **Action:** Client shares this public address with a peer. Both peers send packets to each other simultaneously to create entries (holes) in their NAT tables.
* **Requirement:** Requires **Endpoint-Independent Mapping**. If the router changes the port when switching from talking to the STUN server to talking to the peer, this fails.

**B. TURN (Relay)**

* **Mechanism:** When direct connection fails (e.g., Symmetric NAT), both peers connect outbound to a TURN server.
* **Action:** The server relays data between them.
* **Trade-off:** 100% reliable but adds latency and bandwidth costs.
* **Why it works:** NATs always allow outbound connections.

**C. ICE**

* **Mechanism:** A protocol that gathers all possible addresses (**Candidates**) and tests them in priority order.
* **Priority Logic:**
  1. **Host Candidate:** Direct LAN connection (Best).
  2. **Server Reflexive:** Public IP via STUN (Good).
  3. **Relay:** Via TURN (Fallback/Slowest).

**D. Hairpinning (NAT Loopback)**

* **Scenario:** Two devices on the _same_ LAN try to talk via their _public_ IP.
* **Behavior:** The router recognizes the public IP is its own, loops the packet back to the LAN.
* **Relevance:** Essential for P2P apps so local peers don't fail when using public signaling addresses.

**E. UPnP / NAT-PMP**

* **Mechanism:** The app programmatically asks the router to reserve a specific external port.
* **Result:** Effectively an automated "Static Port Forward."

> **⚠️ Critical Note: Keep-Alives** NAT mappings are temporary. If a UDP connection is idle (typically >60s), the router deletes the mapping. Apps **must** send periodic empty packets ("heartbeats") to keep the path open.
