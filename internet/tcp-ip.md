# TCP/IP

<figure><img src="../.gitbook/assets/image (7).png" alt=""><figcaption></figcaption></figure>

## Application layer

Using Network Protocol to communicate to other Host, **HOW** apps speak to the network, not **WHAT** apps do.

* Your app (e.g., browser) → Application Layer (HTTP request)
* **Common protocols:** HTTP, HTTPS, DNS, FTP, SMTP, SSH.
* That data is handed down through Transport → Internet → Link layers → the network → up the stack on the remote machine
* On the destination, the **Application Layer of the remote host** receives it (e.g., the web server running HTTP).

## Transport layer

### TCP

At receiving request it do connection Establishment (**3-way handshake)**  before sending the data.&#x20;

1. Your client sends **SYN** to the server → “I want to start a connection.”&#x20;
2. Server replies **SYN-ACK** → “I acknowledge, and I’m ready too.”
3. Client sends **ACK** → connection established.

Once connected, TCP ensures that data is

* delivered **reliably and in order**
* split the data into smaller chunks called **segments**
* attaches a TCP header to each segment. The header contains sequence numbers so that the receiver can reorder segments if they arrive out of sequence.&#x20;

**TCP** also guarantees reliability: if a packet is lost or corrupted, TCP will retransmit it. This reliability comes with extra overhead — more control messages, more tracking, and more memory to maintain the connection state. After the data transfer is complete, TCP also includes a connection teardown sequence to properly close the session.

### UDP

**UDP** is **connectionless and lightweight**. There is no handshake before sending data. When an application wants to send information. For example streaming video or sending a DNS query — it simply hands data to UDP, which wraps it into a **datagram** with a very small header. UDP then sends the datagram to the destination without checking whether the receiving host is ready or even exists. This makes UDP extremely fast and efficient because it does not wait for acknowledgments or track state.

The trade-offs. UDP offers **no reliability**: packets may get lost, arrive duplicated, or come in the wrong order, and UDP itself does nothing to correct that. If reliability or ordering is needed, the **application layer** must handle it manually. Many real-time applications prefer UDP because timely delivery is more important than perfect accuracy. Examples include video calls, online gaming, and live streaming — losing a packet or two is acceptable, but delays caused by retransmissions would degrade the real-time experience. In short, UDP favors speed and low overhead, while TCP prioritizes accuracy and reliability.

{% hint style="info" %}
TCP: Establish a connection → send data reliably → ensures order and retransmits lost packets.\
UDP: Send data immediately → no connection, no guarantee → faster, minimal overhead.
{% endhint %}

## Internet Layer

The Internet Layer takes each TCP segment (or UDP datagram) and **wraps it inside an IP packet**. This process is called _encapsulation_. The IP packet contains an **IP header**, which includes the **source IP address** (your machine’s address) and the **destination IP address** (the remote machine/server). These addresses ensure that routers and networking devices know where the packet is coming from and where it should go. Unlike the Transport Layer, the Internet Layer doesn’t care about the connection or reliability — it simply forwards packets.

Routing is the most important function of this layer. When an IP packet is created, the Internet Layer determines the **next hop** — whether the destination is in the same local network (LAN) or must be sent to a router (gateway) to reach another network.&#x20;

As the packet travels, each router only looks at the destination IP address and decides where to send it next; it doesn’t care about the packet’s internal contents. The Internet Layer does not guarantee that packets arrive in order or even that they arrive at all — IP is **best-effort delivery**, meaning routers do not resend dropped packets. Reliability is handled by TCP (Transport Layer), not IP.

When the packet reaches its destination, the remote machine’s Internet Layer removes the IP header (decapsulation), recognizes that the packet belongs to TCP or UDP (based on a protocol field in the IP header), and passes it back up the stack to the Transport Layer.

{% hint style="info" %}
**Internet Layer = addressing + routing + IP packet delivery.**\
It puts the source/destination IP on the packet and sends it through routers until it reaches the right host.
{% endhint %}

## Link Layer (Network Access Layer)

The Link Layer — also called the **Network Access Layer** in the TCP/IP model, or **Data Link + Physical Layers** in the OSI model — is responsible for getting data **onto the physical network** (Ethernet, Wi-Fi, fiber optics, etc.).&#x20;

After the Internet Layer finishes creating an IP packet, the Link Layer **encapsulates that packet into a frame**, which is the data format used on the local network. This frame contains the IP packet plus a new header and trailer.&#x20;

The header includes the **source MAC address** and **destination MAC address**, so the local network knows exactly which machine to send the frame to. MAC addresses operate only within the local network segment and do not leave the LAN; they are used for communication between devices on the same network, such as your laptop → router or router → modem.

{% hint style="info" %}
The Link Layer turns IP packets into **frames**, adds **MAC addresses** and **error checking**, and sends them physically over Ethernet/Wi-Fi.\
IP → packet (Internet Layer)\
Frame → sent over the wire/air (Link Layer)
{% endhint %}

## Reference

* [RFC 793 (TCP)](https://www.rfc-editor.org/rfc/rfc793)
* [RFC 9293 (TCP — updated spec)](https://www.rfc-editor.org/rfc/rfc9293)
* [RFC 768 (UDP)](https://www.rfc-editor.org/rfc/rfc768)
* [RFC 791 (IP)](https://www.rfc-editor.org/rfc/rfc791)
* [RFC 1122 (TCP/IP communication layer requirements)](https://www.rfc-editor.org/rfc/rfc1122)
* [RFC 1180 (TCP/IP tutorial)](https://www.rfc-editor.org/rfc/rfc1180)
* [RFC 894 (IP over Ethernet — framing)](https://www.rfc-editor.org/rfc/rfc894)
* [RFC 826 (ARP — mapping IP to MAC)](https://www.rfc-editor.org/rfc/rfc826)
* [IANA protocol numbers (TCP=6, UDP=17)](https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml)

