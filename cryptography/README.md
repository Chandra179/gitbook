# Cryptography

| Foundation (Math)                                    | Cryptography Method     | Real-world Technology             |
| ---------------------------------------------------- | ----------------------- | --------------------------------- |
| Prime factorization / discrete log / elliptic curves | Asymmetric + Signatures | TLS, HTTPS, OAuth, JWT            |
| Block ciphers + authenticated encryption             | Symmetric               | VPNs, Disk encryption (AES)       |
| Hash functions + HMAC                                | Integrity               | Password storage, JWT, Blockchain |
| Key exchange + identity                              | Secure channels         | TLS handshake, SSH                |

## **Symmetric encryption**

Same key for encrypting/decrypting (e.g., AES).

<table><thead><tr><th>Generation</th><th width="153.96875">Algorithm (Examples)</th><th>How It Works</th><th>Weakness</th></tr></thead><tbody><tr><td><strong>Stream ciphers (1st gen)</strong></td><td>RC4</td><td>Encrypts data <strong>bit-by-bit</strong> using key stream</td><td>Key stream biases → predictable output → broken</td></tr><tr><td><strong>Block ciphers (2nd gen)</strong></td><td>DES (56-bit)</td><td>Encrypts data in <strong>64-bit blocks</strong> using substitution-permutation network</td><td>56-bit too short → brute-force feasible (EFF cracked in 1998)</td></tr><tr><td><strong>Multiple-round DES</strong></td><td>3DES (triple DES)</td><td>Run DES <strong>three times with different keys</strong></td><td>Slow, small block size → vulnerable to meet-in-the-middle attacks</td></tr><tr><td><strong>Modern block cipher (gold standard)</strong></td><td><strong>AES</strong> (AES-128/192/256)</td><td>SubBytes (substitution), ShiftRows, MixColumns (diffusion), AddRoundKey</td><td>No practical attack yet → strong when implemented properly</td></tr></tbody></table>

## **Asymmetric encryption (Public/Private keys)**

Different keys for encrypting/decrypting (e.g., RSA, ECC).

| Generation                   | Algorithm                                     | How It Works                                                             | Weakness                                                                                |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **1st gen (factorization)**  | RSA                                           | Based on difficulty factorizing large primes (n = p × q)                 | Requires huge key sizes (2048–4096 bits) → slower                                       |
| **2nd gen (discrete log)**   | Diffie–Hellman, DSA                           | Math on modular exponentiation                                           | DH without authentication is vulnerable to MITM                                         |
| **3rd gen (elliptic curve)** | **ECC (Curve25519, secp256r1)**               | Uses elliptic curve math; **same security as RSA with 10× smaller keys** | More complex to implement; incorrect curve choices → backdoors (Dual\_EC\_DRBG scandal) |
| **Next gen (post-quantum)**  | Kyber, Dilithium, Falcon (NIST PQC finalists) | Based on lattice problems (reduce via vectors, not primes)               | <p></p><p>Still researched; performance tradeoffs</p>                                   |

## **Hash functions**

One-way functions to verify integrity (e.g., SHA-256).

| Generation          | Algorithms                   | How They Work                                  | Weakness → Reason replaced                       |
| ------------------- | ---------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| **Early MD family** | MD4, MD5                     | Compress data into 128-bit hash                | **Collisions found** → unsafe                    |
| **SHA-1**           | SHA-1                        | Produces 160-bit hash via compression function | 2017 Google collision demonstration → deprecated |
| **Modern**          | **SHA-2 (SHA-256, SHA-512)** | Merkle–Damgård construction                    | Still strong                                     |
| **Future-proof**    | SHA-3 (Keccak)               | Sponge construction (absorbing → squeezing)    | Designed to survive attacks SHA-2 might not      |

## **Digital signatures**

Digital signatures prove WHO created/approved the data.

| Method         | Algorithm         | How It Works                                                 | Weakness Mitigation                                 |
| -------------- | ----------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| RSA Signatures | RSA-SHA256        | Encrypt hash using private key → verify with public key      | Slow for large messages                             |
| DSS            | DSA, ECDSA        | Signature derived from modular arithmetic or elliptic curves | ECDSA requires secure randomness or signatures leak |
| Post-quantum   | Dilithium, Falcon | Hard lattice problem                                         | Still in adoption phase                             |

## **Key exchange protocols**

How two parties agree on a secret key over insecure channels (e.g., Diffie-Hellman)

| Generation                | Algorithm                     | How It Works                                               | Weakness → Replacement                                  |
| ------------------------- | ----------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| Classic (no auth)         | Diffie–Hellman (DH)           | Two sides compute shared secret via modular exponentiation | MITM without authentication                             |
| Authenticated DH          | **DH + signatures (TLS 1.2)** | Adds certs to prove identity                               | Still slow compared to ECC                              |
| Modern (ECC)              | **ECDHE (TLS 1.3 default)**   | Uses ephemeral ECC → **forward secrecy**                   | Safe for now                                            |
| Post-quantum key exchange | Kyber                         | Based on lattice problems                                  | New standard (NIST 2024), replacing DH/ECDHE eventually |
