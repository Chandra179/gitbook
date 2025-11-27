# Digital Wallet

#### 1. Wallet Service (The Manager)

* Role: The Orchestrator & Business Logic.
* Responsibility: It handles the "User Experience." It doesn't hold money; it manages _permissions_ and _workflows_.
* Key Functions:
  * Authentication & KYC status checks.
  * Transfer limits (e.g., "Max $500/day").
  * Fee calculation (e.g., "Take 1% fee").
  * Coordinating the transaction flow between Ledger and Payment.
* Why separate? Product managers change these rules constantly. You don't want to redeploy your core Ledger just to change a daily limit.

#### 2. Ledger Service (The Vault)

* Role: The Mathematician.
* Responsibility: Internal accounting and immutable record keeping. It is blind to the outside world.
* Key Functions:
  * Double-Entry Bookkeeping (Debit/Credit).
  * Account balances (Strict consistency).
  * Prevents money from being created out of thin air.
* Why separate? This is your most critical data. It requires high security, zero external network calls, and very strict code reviews.

#### 3. Payment Service (The Diplomat)

* Role: External Integration.
* Responsibility: Talking to the messy outside world (Stripe, PayPal, Banks, Blockchain).
* Key Functions:
  * Tokenizing credit cards (PCI-DSS compliance).
  * Handling retries (e.g., Bank is down).
  * Receiving Webhooks ("Payment Succeeded").
  * Mapping external error codes to internal statuses.
* Why separate? External APIs break, change versions, and are slow. This service creates a buffer so the rest of your system stays fast.

#### 4. Reconciliation Service (The Auditor)

* Role: The Safety Net.
* Responsibility: Verifying that `Ledger` matches `Payment Gateway` matches `Bank Statement`.
* Key Functions:
  * T+1 Processing: Runs typically once a day (or hourly).
  * Ingests CSV reports from the Bank/Gateway.
  * Compares them against the internal Ledger.
  * Flags "Orphaned Transactions" (Money moved in the bank, but not in our ledger, or vice versa).
* Why separate? This is a heavy data processing job (ETL). You don't want heavy data queries slowing down your live transaction database.
