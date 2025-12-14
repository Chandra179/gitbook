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

**STUN (Hole Punching)**

* A client behind a NAT sends a request to a STUN server on the public internet.
* The NAT translates the client's private IP and port to a public IP and port.
* The STUN server sees the public IP/port in the packet's source address.
* The STUN server sends this public IP/port back to the client.
* The client then shares this public address information with its peer via a separate signaling mechanism.
* The peers attempt a direct peer-to-peer (P2P) connection using the discovered public addresses.

**TURN (Relay)**

TURN is an extension of STUN that acts as a fallback when STUN fails (most commonly due to Symmetric NAT or strict firewall policies).

* The **ICE framework** attempts STUN first. If the direct connection attempt fails, the clients fall back to TURN.
* The client requests an Allocation on the TURN server. The TURN server reserves a public IP address and port (the Relayed Transport Address) for the client.
* The client sends this Relayed Transport Address to its peer via the signaling mechanism.
* The peer sends all its traffic _to_ the TURN server's Relayed Transport Address.
* The TURN server receives the data and relays it to the first client.
* All communication for the duration of the session flows through the TURN server
