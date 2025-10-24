---
description: security related
---

# Security

### Core Concepts

#### CIA triad

* **Confidentiality** — only the intended recipients can access data.
* **Integrity** — data cannot be secretly altered; changes are detectable.
* **Availability** — systems/services are accessible when needed.

Prioritize integrity and availability equally with confidentiality. In modern systems, tradeoffs are inevitable — design with measured redundancy and verification.

***

### DAD (opposites of CIA)

* **Disclosure** — breach of confidentiality.
* **Alteration** — compromise of integrity.
* **Destruction / Denial** — compromise of availability.

***

### Additional security characteristics

* **Authenticity** — proof the data/document came from the claimed source.
* **Non-repudiation** — originator cannot deny a sent message or action (important for e‑commerce, healthcare, banking).
* **Utility** — data is actually _useful_ (encrypted disk without key → available but zero utility).
* **Possession** — physical or logical control of data (e.g., stolen backup drive, ransomware encryption).

***

### Security models & principles

* **Common models**: Bell–LaPadula (confidentiality-focused), others exist for integrity and availability.
* **High-level principles**:
  * **Defence-in-Depth** — layered protections.
  * **Trust but Verify** — log + monitor even trusted actors.
  * **Zero Trust** — never trust implicitly; authenticate/authorize every access.

***

### ISO/IEC 19249:2017 — Summary

> _Information technology — Security techniques — Catalogue of architectural and design principles for secure products, systems and applications._

#### Architectural principles (high level)

1. **Domain Separation** — group related components, assign security attributes per domain (e.g., kernel vs user-mode).
2. **Layering** — structure systems into levels so policies can be applied/validated at different layers (think OSI or API stacks).
3. **Encapsulation** — hide internals; expose limited APIs to prevent invalid state.
4. **Redundancy** — ensure availability/integrity via backups, RAID, redundant power.
5. **Virtualization** — hardware sharing with isolation (sandboxing, secure detonation).

#### Design principles (practical guidance)

1. **Least Privilege** — give only necessary rights (read vs write).
2. **Attack Surface Minimisation** — disable unused services; remove unnecessary components.
3. **Centralized Parameter Validation** — validate inputs in one place (library/service).
4. **Centralized General Security Services** — authentication, logging, key management centrally (but handle availability).
5. **Preparing for Errors & Exceptions** — fail-safe behavior; avoid leaking sensitive info in errors.

***

### Testing & assessments

#### Testing types

* **Black box** — OSINT + no internal knowledge.
* **Gray box** — some information available (credentials, API docs).
* **White box** — full knowledge (source, architecture).

#### Scoping a test (APIs)

* Unique endpoints, methods, versions, auth mechanisms, privilege levels.
* Deliverables: discovered vulnerabilities + clear remediation steps.
* **Note:** avoid illegal/disruptive tests (DDoS, destructive social engineering) unless explicitly allowed and legally scoped.

#### Common tests & checks

* Authentication testing: role-based checks, MFA handling, password reset flows.
* Rate limiting testing.
* WAF evasion (test API logic, not just WAF effectiveness).
* API documentation audit (outdated docs leak vulnerabilities/business logic).
* Parameter manipulation, mass-assignment tests, authorization logic flaws.

***

### Reconnaissance & discovery

* **Passive recon** — gather info without direct interaction.
* **Active recon** — interact with target (scans, probes).

Useful techniques/tools:

* OSINT → mapping external footprint.
* Nmap baseline scanning.
* Gobuster / brute-forcing URIs.
* Chrome DevTools for exposed secrets.
* Kiterunner for API resource discovery.

***

### Authentication & token analysis

* **Auth attacks**: password brute-force, password spraying, reset/MFA bypass, Base64 brute-force.
* **Token analysis with Burp Sequencer**: test token randomness and structure.
  * Load many tokens (100+) for statistical testing.
  * Use sequencer for up to 20,000 tokens for in-depth entropy and correlation analysis.
  * Identify static vs variable token segments to optimize brute-force or prediction.
* **Live token capture**: intercept token generation flows and analyze. Ensure token invalidation and short TTLs.

***

### Fuzzing & common vulnerability patterns

* **Fuzzing** — automated malformed inputs to find crashes, logic faults, unexpected behavior.

**Common patterns**:

* **BOLA** — Broken Object Level Authorization.
* **BFLA** — Broken Function Level Authorization.
* **JWT issues** — weak signing, alg tampering, failure to validate claims.
* **Mass assignment** — unintended writable fields (e.g., `isAdmin`).
* **Injection classes** — SQL, command, template.
* **XSS / XAS** — cross-site scripting and related API-level XSS equivalents.

***

### API security controls & detection hints

* Look for secrets in headers: `Authorization`, custom middleware headers like `X-` prefixes.
* Check tokens in: headers, query strings, POST/PUT bodies.
* Test for missing or weak parameter validation and incorrect error messaging.

***

### Tools & vulnerable targets (quick list)

#### **Tools**

* Burp Suite (intercept, sequencer, intruder).
* FoxyProxy (proxy management).
* kiterunner — API content discovery: `https://github.com/assetnote/kiterunner`.
* OWASP ZAP — scanning automation: `https://github.com/zaproxy/zaproxy`.
* wfuzz — payload injection: `https://github.com/xmendez/wfuzz`.
* Arjun — HTTP param discovery: `https://github.com/s0med3v/Arjun.git`.

#### **Vulnerable apps (for practice)**

* OWASP crAPI
* OWASP Juice Shop
* OWASP DevSlop’s Pixi
* Damn Vulnerable GraphQL

***

### Recon & active discovery examples (recommended checklist)

* Run Amass for public asset discovery.
* Nmap for open ports/service enumeration.
* Gobuster / kiterunner for URI discovery.
* Use Chrome DevTools + local caches to find accidental leaks.

***

### Quick networking & foundations

* OSI model recap.
* TCP/IP basics, common protocols, how web servers/clients exchange requests.
* Understanding the stack helps map where controls belong (network, transport, application).

***

### References & further reading

* ISO/IEC 19249:2017 (official standard)
* Burp Suite docs, OWASP project pages (Juice Shop, crAPI, ZAP)
