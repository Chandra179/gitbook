# BigInt

While `BigDecimal` is mathematically precise _internally_, it is operationally fragile in distributed systems. Here is why we are choosing BigInt (Integers storing Minor Units) over `BigDecimal`, and why giants like Stripe and Uber do the same.

### Money is Discrete, Not Continuous

* `BigDecimal` treats money as a continuous value. It allows you to store `$10.5000001`.
* `BigInt` treats money as discrete particles. If you store values in "cents" (or the smallest currency unit), it is physically impossible to store half a cent.

By using `BigInt` (e.g., storing `$10.50` as `1050`), we force the system to handle rounding logic _before_ the data ever hits the database. It enforces a hard constraint on data integrity.

### The "Invisible" Performance Cost

Before we even get to the bugs, let's talk about storage.

* Storage: A `BIGINT` is exactly 8 bytes. It fits perfectly into a 64-bit CPU register.
* Speed: Math operations (addition, subtraction) on Integers are single CPU instructions. They are blazing fast.
* The Cost of Decimal: Database `DECIMAL` types often take 5–17 bytes. Worse, the CPU cannot add them natively; it relies on software algorithms to perform the math. At the scale of millions of ledger rows, this overhead compounds.

### The "Fragile Boundary" Traps

`BigDecimal` usually works fine inside a single Java or C# class. The problems explode when that data has to leave the application to a database, a frontend, or another microservice.

#### Trap #1: The JSON Serialization "Silent Killer"

JSON is the standard for APIs, but it has a fatal flaw: It has no Decimal type. It only supports Strings and Floating Point numbers.

`The Scenario`: Your backend sends a precise decimal: `{"amount": 100.50}`.

`The Failure`: A JavaScript frontend (or Node.js service) receives it. JavaScript treats all numbers as IEEE 754 Floats.

JavaScript

```javascript
// Frontend logic
let total = response.amount + 0.10;
// Result: 100.60000000000001
```

You have just corrupted the transaction data simply by moving it between services.

**The BigInt Fix**: We send `{"amount": 10050}`. Every language in the world Java, Go, Python, Rust, JavaScript understands Integers exactly the same way. `10050 + 10 = 10060`. There is zero ambiguity.

#### Trap #2: The Java `equals()` Bug

In many languages (specifically Java), Decimal equality checks both value and scale.

The Scenario:

* Transaction A is stored as `$100.00` (Scale 2).
* A refund calculation results in `$100.0` (Scale 1).

The Bug:

```java
new BigDecimal("100.00").equals(new BigDecimal("100.0")) // Returns FALSE
```

If you use these values as keys in a HashMap (e.g., for deduplication or caching), the system treats them as two different numbers. This can lead to double-charging users or failing reconciliation jobs.

**The BigInt Fix**: `10000` is always equal to `10000`. Integers do not carry "metadata" that confuses equality checks.

#### Trap #3: The "Non-Terminating" Crash

If you don't configure `BigDecimal` division perfectly, it is arguably _too_ precise.

The Scenario: You need to split a $100 bill between 3 users.

The Bug: You run `amount.divide(3)`. The system tries to calculate `33.3333333...` to infinity.

* Result: `ArithmeticException: Non-terminating decimal expansion`.
* Impact: The payment thread crashes.

**The BigInt Fix**: Integer division (`10000 / 3`) results in `3333` with a remainder of 1. The use of Integers _forces_ the developer to write code to handle that remainder (the "extra penny"). You cannot accidentally crash the server; you are forced to handle the money correctly.

### Evidence

#### The Rails Incident (Issue #6033)

The Ruby on Rails team famously had to force `BigDecimal` to serialize as Strings in JSON because transmitting them as numbers was corrupting data in JavaScript frontends. They realized that the "boundary" between backend and frontend was unsafe for Decimals. [https://github.com/rails/rails/issues/6033](https://github.com/rails/rails/issues/6033)

#### Stripe (The Gold Standard)

Stripe processes billions of dollars and strictly uses Integers. [https://stripe.com/docs/api/charges/create](https://stripe.com/docs/api/charges/create)

> From the Stripe API Docs: Field: `amount` Type: `integer` Quote: _"A positive integer representing how much to charge in the \[smallest currency unit] (e.g., 100 cents to charge $1.00)._

### Summary

For our system, we follow the "Golden Rule" of Financial Engineering:

> "Do math with Decimals, but store and transmit Integers."

By using BigInts (Minor Units), we gain:

1. Safety: Impossible to store fractional cents.
2. Speed: Native CPU math operations.
3. Stability: No JSON serialization errors or scale-based bugs.

This ensures our ledger remains the immutable source of truth, free from the "dust" of floating-point arithmetic.
