# NAT & P2P Traversal

#### Packet Flow

* Your device sends: `src:192.168.1.50:5000 → dst:Spotify (35.186.224.25)`
* Router receives it and performs NAT: Converts private source → public source\
  `192.168.1.50:5000 → 145.23.66.90:41200`
* Router forwards the translated packet to Spotify: `src:145.23.66.90:41200 → dst:35.186.224.25`
* Spotify replies back to the router’s public IP: `reply → 145.23.66.90:41200`
* Router checks its NAT table entry: `145.23.66.90:41200 ↔ 192.168.1.50:5000`
* Router rewrites the reply back to the private address: `dst becomes 192.168.1.50:5000`
* Packet is delivered to your device.

***

#### NAT Mapping & Filtering

**Mapping Behavior (Outgoing)**

```
1. Endpoint-Independent Mapping (EIM)
   Internal: 192.168.1.50:5000
   → Sends to 1.1.1.1:443 → Router maps to 145.23.66.90:62000
   → Sends to 8.8.8.8:443 → STILL uses 145.23.66.90:62000
   (Same external port reused no matter the destination)

2. Address-Dependent Mapping (ADM)
   Internal: 192.168.1.50:5000
   → Sends to 1.1.1.1:443 → mapped to 145.23.66.90:62000
   → Sends to 8.8.8.8:443 → mapped to 145.23.66.90:62001
   (New external port for each NEW external IP)

3. Address-and-Port-Dependent (Symmetric NAT)
   Internal: 192.168.1.50:5000
   → Sends to 1.1.1.1:443 → mapped to 145.23.66.90:62000
   → Sends to 1.1.1.1:80  → mapped to 145.23.66.90:62001
   (New external port for EACH different IP OR PORT)
```

**Filtering Behavior (Incoming)**

<pre><code>1. Endpoint-Independent Filtering (EIF) 
   Router opened: 145.23.66.90:62000 → 192.168.1.50:5000 
   ANY external host can now send to 145.23.66.90:62000 
   (Most open, good for P2P)

2. Address-Restricted Filtering 
   145.23.66.90:62000  contacted 1.1.1.1 
   ONLY 1.1.1.1 can reply to 145.23.66.90:62000 
   (Different IPs are blocked)
<strong>
</strong><strong>3. Port-Restricted Filtering 
</strong><strong>   145.23.66.90:62000 contacted 1.1.1.1:443 
</strong><strong>   ONLY 1.1.1.1:443 can reply 
</strong><strong>   (Strictest; both IP AND port must match)
</strong></code></pre>

***

#### NAT Traversal Solutions

_How to establish connectivity when behind NAT._

**A. STUN (Hole Punching)**

* **Mechanism:** Client asks a public STUN server: "What is my public IP:Port?"
* Client shares this public address with a peer. Both peers send packets to each other simultaneously to create entries (holes) in their NAT tables.
* Requires **Endpoint-Independent Mapping**. If the router changes the port when switching from talking to the STUN server to talking to the peer, this fails.

**B. TURN (Relay)**

* **Mechanism:** When direct connection fails (e.g., Symmetric NAT), both peers connect outbound to a TURN server.
* The server relays data between them.

**C. ICE**

* **Mechanism:** A protocol that gathers all possible addresses (**Candidates**) and tests them in priority order.
* **Priority Logic:**
  1. **Host Candidate:** Direct LAN connection (Best).
  2. **Server Reflexive:** Public IP via STUN (Good).
  3. **Relay:** Via TURN (Fallback/Slowest).
