# Diffie–Hellman

```
formula: (g^a)^b mod p = g^(a*b) mod p = (g^b)^a mod p
```

<table><thead><tr><th width="133.80938720703125">Variable</th><th>Who chooses it</th><th width="159.625">Private or Public?</th><th>Meaning</th></tr></thead><tbody><tr><td><strong>p</strong></td><td>both agree</td><td>✅ Public</td><td>A large <strong>prime number</strong> used as the "playground" for operations. Prevents infinite results (modular arithmetic).</td></tr><tr><td><strong>g</strong></td><td>both agree</td><td>✅ Public</td><td>A <strong>generator</strong> (base). Think of it as a starting number used to produce unpredictable results when exponentiated mod p.</td></tr><tr><td><strong>a</strong></td><td>Alice picks</td><td>❌ Private</td><td>Alice’s <strong>secret key</strong> (never shared).</td></tr><tr><td><strong>b</strong></td><td>Bob picks</td><td>❌ Private</td><td>Bob’s <strong>secret key</strong> (never shared).</td></tr><tr><td><strong>A</strong></td><td>computed by Alice: <code>A = g^a mod p</code></td><td>✅ Public</td><td>Alice's <strong>public key</strong> sent to Bob.</td></tr><tr><td><strong>B</strong></td><td>computed by Bob: <code>B = g^b mod p</code></td><td>✅ Public</td><td>Bob's <strong>public key</strong> sent to Alice.</td></tr><tr><td><strong>shared_secret</strong></td><td>computed independently by both</td><td>❌ Private</td><td>Final key both compute but never transmit.</td></tr></tbody></table>

```
------------------------------------------------------------
🔹 PUBLICLY AGREED VALUES (everyone knows these)
------------------------------------------------------------
p = 23          ← prime number
g = 5           ← generator

------------------------------------------------------------
🔹 STEP 1: Alice picks a private secret number (never shared)
------------------------------------------------------------
Alice chooses:
    a = 6

Alice computes her PUBLIC value:
    A = g^a mod p
      = 5^6 mod 23
      = 15625 mod 23
      = 8

Alice sends to Bob (public):
    A = 8

------------------------------------------------------------
🔹 STEP 2: Bob picks a private secret number (never shared)
------------------------------------------------------------
Bob chooses:
    b = 15

Bob computes his PUBLIC value:
    B = g^b mod p
      = 5^15 mod 23
      = 30517578125 mod 23
      = 19

Bob sends to Alice (public):
    B = 19

------------------------------------------------------------
🔹 STEP 3: Both compute the SHARED SECRET independently
------------------------------------------------------------

Alice receives Bob’s public value B = 19
Alice computes:
    shared_secret = B^a mod p
                   = 19^6 mod 23
                   = 47045881 mod 23
                   = 2

Bob receives Alice’s public value A = 8
Bob computes:
    shared_secret = A^b mod p
                   = 8^15 mod 23
                   = 35184372088832 mod 23
                   = 2

------------------------------------------------------------
✅ FINAL RESULT (same for both)
------------------------------------------------------------
Alice's shared secret: 2
Bob's shared secret:   2

Even though Alice and Bob generated secrets independently,
and only exchanged A and B (public), they derived the SAME secret.

```

## Why it cant be reserved?

```
------------------------------------------------------------
❓ Why can’t an attacker reverse it?
------------------------------------------------------------

An attacker sees only public information:

    p = 23
    g = 5
    A = 8   (Alice's public value)
    B = 19  (Bob's public value)

But does NOT know:

    a = 6   (Alice's secret)
    b = 15  (Bob's secret)

To break Diffie–Hellman, the attacker must find `a`:

    A = g^a mod p
    8 = 5^a mod 23     ← attacker wants to reverse this

------------------------------------------------------------
⚠️ The problem is: exponentiation mod p is one-way
------------------------------------------------------------

Computing forward is easy:

    5^6 mod 23 = 8

But reversing it is hard:

    ?^        "What number raised to power gives 8 mod 23?"

That reversal requires solving the **Discrete Logarithm Problem**.

------------------------------------------------------------
🛑 Best possible attack: brute-force guessing
------------------------------------------------------------

Attacker tries all possible values of `a`:

    a = 1 → 5^1 mod 23 = 5
    a = 2 → 5^2 mod 23 = 2
    a = 3 → 5^3 mod 23 = 10
    a = 4 → 5^4 mod 23 = 4
    a = 5 → 5^5 mod 23 = 20
    a = 6 → 5^6 mod 23 = 8   ✅ FOUND

With small numbers, brute-force works.

------------------------------------------------------------
🔐 REAL DIFFIE–HELLMAN DOES NOT USE SMALL NUMBERS
------------------------------------------------------------

In real cryptography:

    p is ~ 2^2048 (617 digits long)
    a is a 256-bit random number (2^256 possibilities)

Number of possibilities:

    2^256 ≈ 115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039
           (more than atoms in the universe)

Brute forcing is impossible.

------------------------------------------------------------
✅ Final takeaway
------------------------------------------------------------

Forward (easy):
    A = g^a mod p

Reverse (impossible):
    a = log_g(A) mod p   ← no efficient method known

This unbreakability is based on:
    ➤ Discrete Logarithm Problem
    ➤ Modular arithmetic
    ➤ Very large prime numbers

```
