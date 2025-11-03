# DNS

## **DNS Flow**

<figure><img src="../.gitbook/assets/image.png" alt=""><figcaption></figcaption></figure>

#### **Step 1: Browser Cache Check**

* Modern browsers (Chrome, Firefox, Edge) keep an **internal DNS cache**.
* This cache stores previously resolved domains with their **IP addresses** and **TTL (Time to Live)**.
* If the domain exists and the TTL hasn’t expired → browser immediately uses it.
* If not → moves to the OS resolver.

#### **Step 2: OS Resolver Check**

* Operating systems (Windows, Linux, macOS) maintain their **own DNS cache**.
* Location examples:
  * Linux: `/etc/resolv.conf` (resolver config) and `nscd` cache
  * Windows: `ipconfig /displaydns` shows cache
* The OS checks if the domain is in cache.
* It may also check **hosts file** (`/etc/hosts` on Unix, `C:\Windows\System32\drivers\etc\hosts`) for manual overrides.
* If found → returns IP to browser.
* If not → sends a query to a **recursive resolver**.

#### **Step 3: Recursive Resolver (ISP / Cloud DNS)**

* The recursive resolver is your “middleman” for DNS queries.
* Steps inside recursive resolver:
  1. Check its **own cache**. If IP exists → return immediately.
  2. If not cached → start **recursive querying** process.
* Recursive resolver can query:
  * **Root server** → TLD server → Authoritative server.
  * Or respond from its own cache if recently resolved.

#### **Step 4: Query to Root Name Servers**

* There are **13 root server clusters** globally (`A.` to `M.`).
* Root server doesn’t know the exact IP of `example.com`.
* It **refers the recursive resolver** to the correct **TLD server** based on domain extension `.com`.

#### **Step 5: Query to TLD Name Servers**

* Each TLD (like `.com`) has **many authoritative TLD servers**.
* TLD servers **do not contain the domain IP**, but point to the **authoritative server** for the domain.
* Example response: `ns1.exampledns.com` is authoritative for `example.com`.

#### **Step 6: Query to Authoritative Name Server**

* Authoritative server **contains the actual DNS records** (A, AAAA, MX, CNAME, etc.).
* Responds with:
  * IPv4 address (`A` record) or IPv6 (`AAAA`)
  * TTL value → recursive resolver caches this response

#### **Step 7: Return Path**

* Recursive resolver sends IP back to the **OS resolver**, which stores it in its cache.
* OS resolver returns IP to **browser**.

#### **Step 8: Browser Connection**

* Browser initiates **TCP connection** to the IP on port 80 (HTTP) or 443 (HTTPS).
* If HTTPS → browser performs **TLS handshake** to encrypt the session.

