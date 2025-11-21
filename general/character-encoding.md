# Character Encoding

## ASCII

| Character       | Decimal | Binary   | Hex  |
| --------------- | ------- | -------- | ---- |
| A               | 65      | 01000001 | 0x41 |
| B               | 66      | 01000010 | 0x42 |
| a               | 97      | 01100001 | 0x61 |
| z               | 122     | 01111010 | 0x7A |
| Space           | 32      | 00100000 | 0x20 |
| Enter (newline) | 10      | 00001010 | 0x0A |

ASCII only defines **128 characters**, which works for English, but fails for other languages — no ñ, é, ü, 中, or 😄.

## **Unicode**

**Unicode** assigns a unique **code point** (a number) to every character in every writing system.

| Character | Unicode Code Point | Hex Notation |
| --------- | ------------------ | ------------ |
| A         | U+0041             | 0x0041       |
| ñ         | U+00F1             | 0x00F1       |
| 中         | U+4E2D             | 0x4E2D       |
| 😄        | U+1F604            | 0x1F604      |

A **code point** is _not_ a byte — it’s just a number (like an ID). Unicode defines several **encoding forms** to represent those code points as bytes.

### UTF-8 (most common)

* Variable-length encoding: **1–4 bytes per character**
* Backward compatible with ASCII

| Character | Code Point | UTF-8 Bytes (Hex) | Binary form                         |
| --------- | ---------- | ----------------- | ----------------------------------- |
| A         | U+0041     | 41                | 01000001                            |
| ñ         | U+00F1     | C3 B1             | 11000011 10110001                   |
| 中         | U+4E2D     | E4 B8 AD          | 11100100 10111000 10101101          |
| 😄        | U+1F604    | F0 9F 98 84       | 11110000 10011111 10011000 10000100 |

Notice:

* 1-byte for ASCII
* 2-byte for Latin symbols
* 3-byte for most Asian scripts
* 4-byte for emoji and rare symbols

### UTF-16

Uses 2 or 4 bytes per character

| Character | Code Point | UTF-16 (Hex)                             |
| --------- | ---------- | ---------------------------------------- |
| A         | U+0041     | 00 41                                    |
| ñ         | U+00F1     | 00 F1                                    |
| 中         | U+4E2D     | 4E 2D                                    |
| 😄        | U+1F604    | D83D DE04 (two 16-bit “surrogate pairs”) |

### UTF-32

* Always uses 4 bytes per character (fixed length)
* Simple but memory-heavy
* Example:

| Character | Code Point | UTF-32 (Hex) |
| --------- | ---------- | ------------ |
| A         | U+0041     | 00 00 00 41  |
| 😄        | U+1F604    | 00 01 F6 04  |

### Example

```go
package main

import "fmt"

func main() {
    s := "A中😄"
    for i, r := range s {
        fmt.Printf("Index: %d | Char: %c | Rune (decimal): %d | Unicode: U+%04X\n", i, r, r, r)
    }

    runes := []int{}
    for _, r := range s {
        runes = append(runes, int(r))
    }
    fmt.Println("\nRune slice:", runes)
}

/*
==== OUTPUT ====

Index: 0 | Char: A | Rune (decimal): 65 | Unicode: U+0041
Index: 1 | Char: 中 | Rune (decimal): 20013 | Unicode: U+4E2D
Index: 4 | Char: 😄 | Rune (decimal): 128516 | Unicode: U+1F604

Rune slice: [65 20013 128516]
*/

```
