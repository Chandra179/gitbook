# Firewall & Port Forwarding

**Firewall** is a network security device or software that **controls incoming and outgoing network traffic** based on rules.

### **Types of Firewalls**

#### **Packet-filtering firewall**

* Works at the **network (IP) and transport (TCP/UDP) layer**.
* Looks at **source IP, destination IP, protocol, port number**.
* Simple allow/block rules.
*   Example rule:

    ```
    Allow TCP from 192.168.1.0/24 to 0.0.0.0/0 on port 80
    ```

    → Allows devices in your LAN to access any web server.

#### **Stateful firewall**

* Keeps track of **connection states** (NEW, ESTABLISHED, RELATED).
* Blocks unsolicited connections automatically.
* Example: If you open a browser to google.com, the firewall lets the return packets in because it’s part of an **established connection**.

#### **Application firewall (Layer 7)**

* Works on **application layer** protocols (HTTP, FTP, SMTP).
* Can block specific **URLs, commands, or payload content**.
* Example: Blocking access to `example.com/login`.

## **Firewall Rules**

A typical firewall rule has these components:

* **Action**: Allow / Deny / Drop
* **Direction**: Inbound / Outbound
* **Source IP / Network**
* **Destination IP / Network**
* **Protocol**: TCP, UDP, ICMP, etc.
* **Port**: 80, 443, 22, etc.

| Action | Direction | Source IP      | Dest IP     | Protocol | Port |
| ------ | --------- | -------------- | ----------- | -------- | ---- |
| Allow  | Inbound   | 0.0.0.0/0      | 192.168.1.5 | TCP      | 22   |
| Deny   | Outbound  | 192.168.1.0/24 | 0.0.0.0/0   | TCP      | 25   |

## **Port Forwarding**

**Port forwarding** is a **network technique to allow external devices to access services inside a private network**.

Imagine your LAN behind a NAT router. Your server has IP `192.168.1.100`, but external users only see the router’s public IP. Port forwarding tells the router:

> “Send any traffic coming to public IP on port X to internal IP 192.168.1.100 on port Y.”

#### **Use Case Example**

* You run a web server at `192.168.1.100:80`.
* Router public IP: `203.0.113.10`.
* Port forwarding rule: Forward TCP traffic from `203.0.113.10:80` → `192.168.1.100:80`.
* Now anyone can access your web server via `http://203.0.113.10`.

#### **Types of Port Forwarding**

1. **Local port forwarding**
   * Forwards **local machine ports** to remote servers.
2. **Remote port forwarding**
   * Lets **remote clients connect back** to your local service.
3. **Dynamic port forwarding**
   * Acts like a **proxy**, forwarding multiple ports dynamically.

#### **Firewall + Port Forwarding**

* The firewall must **allow the forwarded port**; otherwise, the traffic will be blocked even if NAT is configured.
