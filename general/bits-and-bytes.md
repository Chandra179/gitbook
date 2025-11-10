# Bits & Bytes

A **bit** is the smallest unit of information — it can be **0 or 1**.

* 1 bit → 2 possibilities → `0`, `1`
* 2 bits → 2² = 4 possibilities → `00`, `01`, `10`, `11`
* 3 bits → 2³ = 8 possibilities
* 8 bits → 2⁸ = 256 possibilities → **1 byte**

So if you have **n bits**, you can represent **2ⁿ unique values**.

| Encoding         | Alphabet size | Bits per symbol      | Example characters  |
| ---------------- | ------------- | -------------------- | ------------------- |
| **Base2**        | 2             | 1                    | 0,1                 |
| **Base16 (hex)** | 16            | 4 bits per char      | 0–9, A–F            |
| **Base32**       | 32            | 5 bits per char      | A–Z, 2–7            |
| **Base58**       | 58            | \~5.86 bits per char | Bitcoin addresses   |
| **Base62**       | 62            | \~5.95 bits per char | 0–9, A–Z, a–z       |
| **Base64**       | 64            | 6 bits per char      | A–Z, a–z, 0–9, +, / |

**Example**:

generate unique code 10.000/day using base64 with max length code 8

```
64^8 = if its represented to bits become (2^6)^8 = 2^48 
combinations = 281 474 976 710 656

10 000 codes/day = 10^4

281,474,976,710,656 / 10,000 = 28,147,497,671.0656 (days till it maxed out)
28,147,497,671.0656 / 365 = 77,127,390 years (approx.)
```

