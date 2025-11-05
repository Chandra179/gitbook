# DNS

## **DNS Flow**

<figure><img src="../.gitbook/assets/image.png" alt=""><figcaption></figcaption></figure>

When a browser needs to resolve a domain like `www.example.com`, i

* t first checks its **internal DNS cache** for a valid IP and TTL.&#x20;
* If not found, the query moves to the **OS resolver**, which also checks its own cache and the **hosts file** for manual overrides.&#x20;
* If still unresolved, the query is sent to a **recursive resolver** (ISP or cloud), which checks its cache and, if necessary, performs a **recursive lookup** by contacting a **root server**, then the appropriate **TLD server**, and finally the **authoritative server** that holds the domain’s actual DNS records (A, AAAA, MX, CNAME, etc.).&#x20;
* The recursive resolver returns the IP to the OS resolver, which passes it back to the browser. The browser then opens a **TCP connection** to the resolved IP on port 80 (HTTP) or 443 (HTTPS), performing a **TLS handshake** if HTTPS is used.&#x20;
* For example, resolving `www.example.com` might involve a browser query to Google Public DNS (`8.8.8.8`), recursive resolution through the root and `.com` TLD servers to the authoritative server, which responds with `93.184.216.34`, after which the browser connects and sends the HTTP/HTTPS request.

## Reference

* [RFC 1034 — Domain Names – Concepts and Facilities](https://datatracker.ietf.org/doc/html/rfc1034)
* [RFC 1035 — Domain Names – Implementation and Specification](https://datatracker.ietf.org/doc/html/rfc1035)
* [IANA Root Name Server Operational Overview](https://www.iana.org/domains/root/servers)
* [Google Public DNS Overview](https://developers.google.com/speed/public-dns/docs/overview)
