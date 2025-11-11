# Cryptography

## **Symmetric Encryption**

### **AES (Advanced Encryption Standard)**

* **Example:** AES-128, AES-256
* **Use case:** Encrypting files, database storage, VPN traffic, HTTPS (bulk encryption)
* **Weakness:** Requires secure key distribution; if the key is stolen, encryption is broken; no authentication by itself

## **Asymmetric Encryption**

### **RSA**

* **Example:** RSA-2048, RSA-4096
* **Use case:** Secure key exchange, encrypting small messages, SSL/TLS handshakes
* **Weakness:** Slower than symmetric encryption; vulnerable to quantum attacks in the future

### **ECC (Elliptic Curve Cryptography)**

* **Example:** ECDSA, Curve25519
* **Use case:** Secure key exchange, digital signatures, lightweight encryption for mobile and IoT
* **Weakness:** More complex math; improper implementation can break security

## **Digital Signature**

### **RSA Signature / ECDSA**

* **Example:** Signing software updates, documents, blockchain transactions
* **Use case:** Authentication, integrity verification, non-repudiation
* **Weakness:** Signature relies on private key security; algorithm choice matters for long-term security (ECDSA preferred over RSA for modern usage)

## **Key Exchange**

### **Diffie-Hellman (DH) / Elliptic Curve Diffie-Hellman (ECDH)**

* **Example:** DH-2048, ECDH-P256
* **Use case:** Securely exchanging encryption keys over insecure channels; used in HTTPS/TLS
* **Weakness:** Vulnerable to man-in-the-middle if authentication is missing; classical DH slower than ECDH

