# Cryptography

<table data-full-width="true"><thead><tr><th>Category</th><th>Example Algorithms</th><th>Real-World Use Cases</th></tr></thead><tbody><tr><td><strong>Symmetric Encryption</strong></td><td>AES, ChaCha20, DES (legacy)</td><td><p>Encrypting files on disk (BitLocker, FileVault), </p><p>VPN traffic, bulk data encryption in HTTPS after handshake, database encryption at rest</p></td></tr><tr><td><strong>Asymmetric Encryption</strong></td><td>RSA, ECC (ECIES), ElGamal</td><td>Secure key distribution, HTTPS certificates, SSH authentication, encrypted email without prior shared key</td></tr><tr><td><strong>Digital Signature</strong></td><td>RSA Signature, ECDSA, Ed25519</td><td>Software signing (OS binaries), document signing (PDF signature), blockchain transactions, verifying firmware updates</td></tr><tr><td><strong>Key Exchange</strong></td><td>Diffie–Hellman (DH), ECDH, X25519</td><td>Generate shared encryption keys in HTTPS handshake, secure messaging apps (Signal/WhatsApp), VPN key negotiation (IPSec/IKE)</td></tr></tbody></table>

## **Symmetric encryption**

Same key for encrypting/decrypting (e.g., AES).

<table data-full-width="true"><thead><tr><th>Generation</th><th width="153.96875">Algorithm (Examples)</th><th>How It Works</th><th>Weakness</th></tr></thead><tbody><tr><td><strong>Stream ciphers (1st gen)</strong></td><td>RC4</td><td>Encrypts data <strong>bit-by-bit</strong> using key stream</td><td>Key stream biases → predictable output → broken</td></tr><tr><td><strong>Block ciphers (2nd gen)</strong></td><td>DES (56-bit)</td><td>Encrypts data in <strong>64-bit blocks</strong> using substitution-permutation network</td><td>56-bit too short → brute-force feasible (EFF cracked in 1998)</td></tr><tr><td><strong>Multiple-round DES</strong></td><td>3DES (triple DES)</td><td>Run DES <strong>three times with different keys</strong></td><td>Slow, small block size → vulnerable to meet-in-the-middle attacks</td></tr><tr><td><strong>Modern block cipher (gold standard)</strong></td><td><strong>AES</strong> (AES-128/192/256)</td><td>SubBytes (substitution), ShiftRows, MixColumns (diffusion), AddRoundKey</td><td>No practical attack yet → strong when implemented properly</td></tr></tbody></table>

## **Asymmetric encryption (Public/Private keys)**

Different keys for encrypting/decrypting (e.g., RSA, ECC).

<table data-full-width="true"><thead><tr><th>Generation</th><th>Algorithm</th><th>How It Works</th><th>Weakness</th></tr></thead><tbody><tr><td><strong>1st gen (factorization)</strong></td><td>RSA</td><td>Based on difficulty factorizing large primes (n = p × q)</td><td>Requires huge key sizes (2048–4096 bits) → slower</td></tr><tr><td><strong>2nd gen (discrete log)</strong></td><td>Diffie–Hellman, DSA</td><td>Math on modular exponentiation</td><td>DH without authentication is vulnerable to MITM</td></tr><tr><td><strong>3rd gen (elliptic curve)</strong></td><td><strong>ECC (Curve25519, secp256r1)</strong></td><td>Uses elliptic curve math; <strong>same security as RSA with 10× smaller keys</strong></td><td>More complex to implement; incorrect curve choices → backdoors (Dual_EC_DRBG scandal)</td></tr><tr><td><strong>Next gen (post-quantum)</strong></td><td>Kyber, Dilithium, Falcon (NIST PQC finalists)</td><td>Based on lattice problems (reduce via vectors, not primes)</td><td><p></p><p>Still researched; performance tradeoffs</p></td></tr></tbody></table>

## **Hash functions**

One-way functions to verify integrity (e.g., SHA-256).

<table data-full-width="true"><thead><tr><th>Generation</th><th>Algorithms</th><th>How They Work</th><th>Weakness</th></tr></thead><tbody><tr><td><strong>Early MD family</strong></td><td>MD4, MD5</td><td>Compress data into 128-bit hash</td><td><strong>Collisions found</strong> → unsafe</td></tr><tr><td><strong>SHA-1</strong></td><td>SHA-1</td><td>Produces 160-bit hash via compression function</td><td>2017 Google collision demonstration → deprecated</td></tr><tr><td><strong>Modern</strong></td><td><strong>SHA-2 (SHA-256, SHA-512)</strong></td><td>Merkle–Damgård construction</td><td>Still strong</td></tr><tr><td><strong>Future-proof</strong></td><td>SHA-3 (Keccak)</td><td>Sponge construction (absorbing → squeezing)</td><td>Designed to survive attacks SHA-2 might not</td></tr></tbody></table>

## **Digital signatures**

Digital signatures prove WHO created/approved the data.

<table data-full-width="true"><thead><tr><th>Method</th><th>Algorithm</th><th>How It Works</th><th>Weakness</th></tr></thead><tbody><tr><td>RSA Signatures</td><td>RSA-SHA256</td><td>Encrypt hash using private key → verify with public key</td><td>Slow for large messages</td></tr><tr><td>DSS</td><td>DSA, ECDSA</td><td>Signature derived from modular arithmetic or elliptic curves</td><td>ECDSA requires secure randomness or signatures leak</td></tr><tr><td>Post-quantum</td><td>Dilithium, Falcon</td><td>Hard lattice problem</td><td>Still in adoption phase</td></tr></tbody></table>

## **Key exchange protocols**

How two parties agree on a secret key over insecure channels (e.g., Diffie-Hellman)

<table data-full-width="true"><thead><tr><th>Generation</th><th>Algorithm</th><th>How It Works</th><th>Weakness</th></tr></thead><tbody><tr><td>Classic (no auth)</td><td>Diffie–Hellman (DH)</td><td>Two sides compute shared secret via modular exponentiation</td><td>MITM without authentication</td></tr><tr><td>Authenticated DH</td><td><strong>DH + signatures (TLS 1.2)</strong></td><td>Adds certs to prove identity</td><td>Still slow compared to ECC</td></tr><tr><td>Modern (ECC)</td><td><strong>ECDHE (TLS 1.3 default)</strong></td><td>Uses ephemeral ECC → <strong>forward secrecy</strong></td><td>Safe for now</td></tr><tr><td>Post-quantum key exchange</td><td>Kyber</td><td>Based on lattice problems</td><td>New standard (NIST 2024), replacing DH/ECDHE eventually</td></tr></tbody></table>
