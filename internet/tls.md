# TLS

Transport Layer Security is a encryption mechanism to encrypt message that are sent from

**Application → TLS → Transport**

* Your browser (HTTP request: `GET /index.html`) hands data to TLS.
* TLS encrypts the payload (plus integrity check).
* TLS hands the encrypted bytes to TCP (or QUIC).

**Transport → TLS → Application**

* TCP delivers the encrypted bytes reliably.
* TLS decrypts and verifies integrity.
* TLS hands the clean HTTP message back to the browser’s HTTP logic

## TLS handshake

The client begins a TLS handshake with the server by sending a **ClientHello** message. This message contains:

* Supported TLS versions (e.g., up to TLS 1.3).
* Cipher suites: a list of cryptographic options, where each suite defines a symmetric encryption algorithm and a hash function (e.g., `TLS_AES_128_GCM_SHA256 or TLS_CHACHA20_POLY1305_SHA256`).
* A client random: a fresh 32-byte random value used later in session key derivation.
* Key shares: one or more public parameters for an ephemeral Elliptic Curve Diffie–Hellman (ECDHE) key exchange, allowing the server to compute a shared secret without exposing private keys.

The server receives this message, parses the fields, and replies with a **ServerHello** message, also in plaintext. This contains:

* The chosen cipher suite (one from the client’s list).
* The server random, another 32-byte random value.
* A server key share, representing its half of the ECDHE exchange.

After this, the server also sends its **digital certificate** in X.509 format, which includes:

* The server’s long-term public key (RSA or ECDSA).
* The server’s identity (e.g., CN=[www.example.com](http://www.example.com)).
* A signature from a trusted Certificate Authority (CA), proving the certificate’s authenticity.

At this point, the client knows what the server claims to be, but it still needs proof that the server actually holds the private key corresponding to the certificate. To prove this, the server sends a **CertificateVerify** message:

* The server uses its long-term private key to create a digital signature over everything exchanged in the handshake so far.
* The client verifies this signature using the public key inside the certificate.

If the check passes, the client can be sure that:

1. The certificate is valid and signed by a trusted CA.
2. The server truly controls the private key that matches the certificate.
3. The handshake messages have not been altered in transit.

Finally, both sides complete the ECDHE computation, derive a shared secret, expand it with HKDF into session keys, and exchange **Finished** messages. From that point on, all traffic — including HTTP requests and responses — is encrypted and protected against tampering.

### Note on Connection Reuse and Caching

* On the **first request**, the client and server must perform this full handshake to establish a secure channel.
* For **subsequent requests over the same connection**, no new handshake is needed; the established TLS session keys are reused, and the client can immediately send encrypted application data.
* If a new TCP/TLS connection is opened later, the client and server may use **session resumption** (via session tickets or PSKs in TLS 1.3) to avoid repeating the full handshake, further reducing latency.
