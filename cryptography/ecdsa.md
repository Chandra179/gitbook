---
description: digital signature
---

# ECDSA

| Situation                  | Why signing matters                                 |
| -------------------------- | --------------------------------------------------- |
| Online banking transaction | Proves YOU approved it.                             |
| Blockchain transaction     | Proves the wallet owner signed the transaction.     |
| Software updates           | Verify it came from the real vendor (not tampered). |
| JWT tokens / OAuth tokens  | Issuer signs tokens so clients can verify them.     |

#### **1. Client requests key pair creation**

```
[1] Client → Server:
"Create key pair for me."
```

#### **2. Server generates the key pair**

* Server generates:
  * `private_key` (secret — never leaves server)
  * `public_key` (safe to share)

```
[2] Server (internal):
private_key = generateECDSA()
public_key  = derivePublicKey(private_key)
store private_key in secure storage (key_id=1234)
```

#### **3. Server returns the PUBLIC key**

```
[3] Server → Client:
{
   "key_id": "1234",
   "public_key": "<ECDSA PUBLIC KEY>"
}
```

Client stores the public key.

#### **4. Client has some data it wants signed**

```
data = "Send 10 coins to Alice"
```

Client requests the server to sign it.

```
[4] Client → Server:
{
   "key_id": "1234",
   "data": "Send 10 coins to Alice"
}
```

#### **5. Server signs the data using the PRIVATE key**

```
[5] Server (internal):

signature = Sign(private_key(1234), data)
```

Only the server can do this because only the server has the private key.

#### **6. Server returns the signature**

```
[6] Server → Client:
{
    "signature": "<ECDSA_SIGNATURE>",
    "key_id": "1234"
}
```

Client now has:

* the original data
* the public key
* the signature

#### **7. Client (or any verifier) checks the signature**

Verification uses **public key only**, no private key required.

```
[7] Client (or verifier):
VerifySignature(public_key, data, signature)
→ output: VALID / INVALID
```

If valid → they know:

* data wasn’t changed
* signature was produced using the private key stored on the server

