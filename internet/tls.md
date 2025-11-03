# TLS

Transport Layer Security is a encryption mechanism to encrypt message that are sent from

Application → TLS → Transport

* The application (e.g., a browser sending `GET /index.html`) hands plaintext data to TLS.
* TLS encrypts and authenticates the data (using AEAD — authenticated encryption).
* TLS hands the ciphertext to the transport layer:
  * **TCP** when using HTTP/1.1 or HTTP/2
  * **QUIC** when using HTTP/3 (QUIC uses TLS keys internally, not TLS records)

On receiving, Transport (TCP/QUIC) → TLS → Application

* TCP or QUIC delivers the encrypted bytes reliably.
* TLS decrypts them and verifies integrity.
* TLS passes the clean HTTP message back to the application.

## TLS 1.3 handshake

To establish a secure session, the client starts the handshake by sending a **ClientHello** message. It includes:

* **Supported TLS versions** (up to TLS 1.3)
* **Cipher suites** (each defines a symmetric cipher + hash), e.g.:
  * `TLS_AES_128_GCM_SHA256`
  * `TLS_CHACHA20_POLY1305_SHA256`
* **Client random** (32 bytes of fresh randomness)
* **Key shares** (public parameters for ephemeral ECDHE key exchange)

The server receives ClientHello and replies with a **ServerHello**, also in plaintext. It includes:

* The selected cipher suite
* A 32-byte server random value
* The server’s key share (its half of the ECDHE exchange)

{% hint style="info" %}
In TLS 1.3, **everything after ServerHello is encrypted** with early handshake keys.
{% endhint %}

Next, the server sends its **X.509 certificate**, which contains:

* The server’s public key (RSA or ECDSA)
* The server identity (`CN=www.example.com`)
* A CA signature proving the certificate's authenticity

To prove that it actually owns the private key, the server sends **CertificateVerify**:

* The server signs the handshake transcript using its private key.
* The client verifies the signature using the public key in the certificate.

If verification succeeds, the client knows:

* The certificate is valid and signed by a trusted CA.
* The server controls the private key corresponding to the certificate.
* The handshake messages have not been tampered with.

Finally:

1. Both sides finish the ECDHE computation to derive a shared secret.
2. HKDF expands it into session keys.
3. Client and server exchange **Finished** messages.

At that point, **all application data (including HTTP) is encrypted and authenticated.**

### Note on Connection Reuse and Caching

* The first connection requires the full handshake.
* For additional requests on the same connection, TLS simply reuses the established session keys.
* If a new TCP/TLS connection is created later, TLS 1.3 can use **session resumption** (via session tickets or PSKs) to avoid the full handshake, reducing latency.
