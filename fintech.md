---
description: fintech core & business model
---

# Fintech

## **Core**

#### **Money Movement (Payments / Transfers / Settlement)**

> _How money moves between accounts._

Core concepts:

* Payment rails (SWIFT, ACH, RTP, SEPA, FAST - depending on country)
* Card networks (Visa, Mastercard)
* Payment gateway vs payment processor
* Authorization → capture → settlement → reconciliation

If you understand:

```
Charge → Authorize → Capture → Settlement → Reconciliation
```

You already understand 50% of fintech.

***

#### **Identity & Risk (KYC / KYB / Fraud / Credit Risk)**

> _How you verify users and manage risk._

* KYC: Know Your Customer (identity verification)
* KYB: Know Your Business (company verification)
* AML: Anti-money laundering
* Fraud detection
* Credit scoring / risk modeling (especially for multifinance)

Every fintech must answer:

> “Who is this user?”\
> “Can we trust them with money?”

#### **Ledgering & Accounting (Double-entry systems)**

> _How balances are tracked consistently._

Core concepts:

* Ledger: system of record
* Double-entry accounting (every transaction has debit/credit)
* Consistency + immutability (auditability)
* Reconciliation (matching ledger vs bank statement)

This is why **fintech backends behave differently** than normal apps.

You don’t "update balance".\
You **append a ledger event**, like a blockchain.

#### **Regulations & Compliance**

> _Every fintech product is constrained by law._

Examples:

* PCI-DSS (if dealing with credit cards)
* GDPR / PDPA (personal data rules)
* MAS / OJK / SEC / FDIC depending on jurisdiction
* Money transmitter licensing

Most engineers ignore this until they hit reality.

> Fintech is not “build fast and break things”.\
> Fintech is “move fast without going to jail.”

## Secondary Components

| Component            | Description                           |
| -------------------- | ------------------------------------- |
| Onboarding           | Signup → KYC → account creation       |
| Wallet               | Store value (internal balance)        |
| Disbursement         | Sending money to other banks/accounts |
| Collections          | Auto-debit, autopay, reminders        |
| Loan / Credit Engine | Scoring, limit, repayment schedule    |
| Reporting            | General ledger → financial report     |

## Paper-to-Implementation

Step 1: Read paper (architecture, flow)\
Step 2: Extract core parts as components (ledger / scoring / workflow)\
Step 3: Design architecture in diagram (your adaptation)\
Step 4: Implement simplified MVP (code + docs)\
Step 5: Publish write-up on GitHub "Case Study: Implementing Stripe Treasury Ledger"

| Category                 | Where to get real papers / specs                                             |
| ------------------------ | ---------------------------------------------------------------------------- |
| Ledgering / Core banking | **Stripe Treasury Papers**, Fineract, Mifos whitepapers, Double-entry Ledger |
| Lending / Underwriting   | Kasisto, Affirm S-1 filing, Credit scoring research                          |
| Reconciliation           | ISO20022, SWIFT specs                                                        |
| Fraud detection          | Visa/Mastercard risk scoring whitepapers                                     |
| BNPL / Cashflow lending  | Klarna & Afterpay filings (public numbers + architecture)                    |
| Regulations              | OJK / MAS (Singapore) digital banking frameworks                             |

## Resources

* Overview of the industry — payments, lending, blockchain, regulation. [https://www.amazon.com/FINTECH-Book-Technology-Entrepreneurs-Visionaries/dp/111921887X](https://www.amazon.com/FINTECH-Book-Technology-Entrepreneurs-Visionaries/dp/111921887X)
*   Deep focus on payment rails, acquiring, issuing, merchant flows. youll learn\


    * Authorization vs capture vs settlement
    * Gateways vs processors vs schemes (Visa/MasterCard)

    [https://www.amazon.com/PayTech-Book-Technology-Entrepreneurs-Visionaries/dp/1119551919](https://www.amazon.com/PayTech-Book-Technology-Entrepreneurs-Visionaries/dp/1119551919)
* How banks digitize operations and fintech challenges the industry. [https://www.amazon.com/Digital-Bank-Strategies-Launch-Become/dp/9814516465](https://www.amazon.com/Digital-Bank-Strategies-Launch-Become/dp/9814516465)
*   How modern banking is shifting into embedded finance.

    [https://www.amazon.com/Bank-4-0-Banking-everywhere-never/dp/9814771767](https://www.amazon.com/Bank-4-0-Banking-everywhere-never/dp/9814771767)
* **Designing Digital Financial Services** — Dietz & Kazzaz (McKinsey)
* Interledger / Payment Flows / Card Networks Specs
* Credit Risk Analytics: Measurement Techniques, Applications
* **The CREDIT Book** (by Fintech Circle)
* **Fighting Fraud and Financial Crime** — Chris Mathers
