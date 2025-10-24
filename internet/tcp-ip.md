# TCP/IP

## Application layer

Using Network Protocol to communicate to other Host

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

then splits the data into segments. Each segment gets a TCP header. Segments are passed down to the **Internet Layer**.

### UDP

**connectionless, best-effort delivery** (no handshake or reliability).

## Internet Layer

After connection established, wraps each TCP segment inside an IP packet (with source/destination IP addresses). Passes the packet down to the **Link Layer**.

## Link Layer (Network Access Layer)

Encapsulates IP packets into frames. Adds MAC addresses, error checking, etc. and sends frames physically over the medium (cables, radio waves).





