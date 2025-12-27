# Polynomial Functions

use a polynomial when you have a set of data and you want to find a "best-fit" curve to describe it.

$$f(x) = a_n x^n + a_{n-1} x^{n-1} + \dots + a_1 x + a_0$$

* $$x$$: The variable.
* $$n$$: The degree (the highest exponent). It must be a whole number ($$0, 1, 2, \dots$$).
* $$a_n, a_{n-1}, \dots$$: The coefficients (real numbers).
* $$a_n$$: The leading coefficient (the number attached to the highest power).
* $$a_0$$: The constant term (the number with no variable).

***

$$x^4 - 13x^2 + 36 = 0$$

$$(x^2 - 9)(x^2 - 4) = 0$$

$$(x - 3)(x + 3)(x - 2)(x + 2) = 0$$

$$x = 3, \quad x = -3, \quad x = 2, \quad x = -2$$

***

$$3x^3 - x^2 - 10x = 0$$

$$x(3x^2 - x - 10) = 0$$

$$x(3x^2 - 6x + 5x - 10) = 0$$

$$x[3x(x - 2) + 5(x - 2)] = 0$$

***

$$x(3x + 5)(x - 2) = 0$$

$$\quad 3x + 5 = 0 \implies x = -\frac{5}{3}$$

$$\quad x - 2 = 0 \implies x = 2$$

***

$$x^3 - 7x + 6 = 0$$

$$(x - 1)(x^2 + x - 6) = 0$$

$$(x - 1)(x + 3)(x - 2) = 0$$

$$x = 1, \quad x = -3, \quad x = 2$$

***

$$2x^3 - 3x^2 - 11x + 6 = 0$$

$$(x - 3)(2x^2 + 3x - 2) = 0$$

$$(x - 3)(2x - 1)(x + 2) = 0$$

$$x = 3, \quad x = \frac{1}{2}, \quad x = -2$$

***

$$x^4 - 5x^2 - 36 = 0$$

$$(x^2 - 9)(x^2 + 4) = 0$$

$$(x - 3)(x + 3)(x^2 + 4) = 0$$

$$x = 3, \quad x = -3, \quad x = 2i, \quad x = -2i$$

***

$$x^4 - 4x^3 + 6x^2 - 4x + 1 = 0$$

$$(x - 1)^4 = 0$$

$$x = 1$$ (multiplicity 4)

***

$$x^5 - x^4 - 2x^3 + 2x^2 + x - 1 = 0$$

$$(x - 1)(x^4 - 2x^2 + 1) = 0$$

$$(x - 1)(x^2 - 1)^2 = 0$$

$$(x - 1)(x - 1)^2 (x + 1)^2 = 0$$

$$(x - 1)^3 (x + 1)^2 = 0$$

$$x = 1, \quad x = -1$$

***

**Synthetic Division**

main goal of synthetic division is to provide a "shorthand" or shortcut for polynomial division.

$$x^3 - 4x^2 + 9$$ by $$(x - 3)$$

| Row        | Divisor | x3 coeff. | x2 coeff. | x coeff. | Constant |
| ---------- | ------- | --------- | --------- | -------- | -------- |
| Top Row    | 3       | 1         | -4        | 0        | 9        |
| Middle Row |         |           | 3         | -3       | -9       |
| Bottom Row |         | 1         | -1        | -3       | 0        |

**The Remainder & Factor Theorems**
