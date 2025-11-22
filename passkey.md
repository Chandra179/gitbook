---
description: >-
  webauthn & fido.
  https://github.com/Chandra179/go-sdk/blob/main/pkg/passkey/passkey.go
---

# Passkey

## Context

* **WebAuthn** is a web standard for secure authentication that allows users to log in to websites or applications without using passwords. It leverages public-key cryptography to authenticate users.
* **FIDO** (Fast IDentity Online) is a set of open standards for passwordless authentication, which includes WebAuthn as one of its protocols.
* **Purpose:** It is designed to reduce reliance on passwords, improve security against phishing, and enhance user convenience.
* **Issues with traditional auth:** Passwords can be stolen, reused, or phished; multi-factor auth can be cumbersome; servers storing passwords can be hacked.
* **Solution:** Passkeys are used as modern authentication credentials that are cryptographically secure and can be synced across devices, providing a seamless passwordless experience.

## Flow

<figure><img src=".gitbook/assets/image (13).png" alt="" width="563"><figcaption></figcaption></figure>

#### Client and Server Interaction

1. **Registration (Creating a Credential)**
   * Client requests to register a passkey.
   * Server generates a **challenge** and sends it to the client along with user information.
   * Client uses a secure authenticator (like device TPM, fingerprint, or FaceID) to generate a **public/private key pair**.
   * Private key stays on the client device; public key is sent to the server for storage.
   * Server verifies the response and stores the public key for future authentication.
2. **Authentication (Login)**
   * Client requests authentication.
   * Server sends a **challenge** to the client.
   * Client signs the challenge with the stored private key.
   * Server verifies the signature with the stored public key.
   * Successful verification authenticates the user without sending sensitive secrets over the network.

#### Algorithms Used

* **Public-key cryptography:** Usually **Elliptic Curve Cryptography (ECC)**, e.g., **ECDSA** or **EdDSA**.
* **Hashing:** SHA-256 (for data integrity and challenge verification).
* **Signatures:** Asymmetric digital signatures to verify that the client owns the private key.
