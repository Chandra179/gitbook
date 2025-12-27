# Logarithmic & Exponential Functions

Exponential Function: $$f(x) = b^x$$

* $$b$$ (Base): A constant number greater than 0 (and not 1).
* $$x$$ (Exponent): The variable (the input).

Unlike a linear function ($$2x$$) which grows at a steady pace, an exponential function ($$2^x$$) doubles every time $$x$$ increases by 1. This leads to very rapid growth.

Growth vs. Decay:

* If $$b > 1$$, it's Exponential Growth (e.g., population growth).
* If $$0 < b < 1$$, it's Exponential Decay (e.g., radioactive decay).

Logarithmic Function: $$f(x) = \log_b(x)$$

Where:

* $$b$$ (Base): Must be greater than 0 and not equal to 1.
* $$x$$ (Argument): The number you are finding the log of (must be positive).
* $$f(x)$$: The exponent needed to reach $$x$$ from base $$b$$

We use logarithms when we deal with values that grow very quickly (exponentially) but we want to understand them on a scale that is easier to manage.

**Relationship Between Exponential and Logarithms**

| Exponential (2^x=y)                     | Logarithmic (log2​(y)=x)                |
| --------------------------------------- | --------------------------------------- |
| If $$x=3$$, then $$y=8$$ (3, 8)         | If $$y=8$$, then $$x=3$$ (8, 3)         |
| If $$x=0$$, then $$y=1$$ (0, 1)         | If $$y=1$$, then $$x=0$$ (1, 0)         |
| If $$x=-2$$, then $$y=0.25$$ (-2, 0.25) | If $$y=0.25$$, then $$x=-2$$ (0.25, -2) |

**Log-to-Exponential Conversion**

$$\log_b(x) = y \quad \longleftrightarrow \quad b^y = x$$

$$2^4 = 16$$, then $$y = 4$$. So, $$\log_2(16) = 4$$.

**Logarithm Rules**

<table><thead><tr><th width="153.800048828125">Rule Name</th><th width="334.2000732421875">Formula</th><th>What it does</th></tr></thead><tbody><tr><td>Product Rule</td><td><span class="math">\log_b(M \cdot N) = \log_b(M) + \log_b(N)</span></td><td>Turns multiplication into addition.</td></tr><tr><td>Quotient Rule</td><td><span class="math">\log_b(\frac{M}{N}) = \log_b(M) - \log_b(N)</span></td><td>Turns division into subtraction.</td></tr><tr><td>Power Rule</td><td><span class="math">\log_b(M^k) = k \cdot \log_b(M)</span></td><td>Moves an exponent to the front.</td></tr></tbody></table>

1. The Identity Rule: $$\log_b(b^x) = x$$. (The log and the base "cancel" each other out).
2. The Inverse Identity: $$b^{\log_b(x)} = x$$. (The base and the log power "cancel" each other out).

**Natural Logarithm**, $$\ln(x)$$, a logarithm with a very special base: the mathematical constant $$e$$ (approximately 2.71828)

* The "Cancel" Rules: $$\ln(e^x) = x$$ and $$e^{\ln(x)} = x$$. (They undo each other).
* The Reference Points: $$\ln(1) = 0$$ (because $$e^0 = 1$$) and $$\ln(e) = 1$$ (because $$e^1 = e$$).

**Arithmetic & Geometric Sequences and Summation (**$$\Sigma$$**)**
