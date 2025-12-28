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

### General Transformations

**General transformation** is used to describe how a "parent" graph is moved, stretched, or flipped on a coordinate plane.

$$f(x) = a \cdot b^{x-h} + k$$

The **Vertical** Shift ($$k$$)

* The value of $$k$$ controls the Horizontal Asymptote (the invisible floor).
* If $$k$$ is positive ($$+3$$): The entire graph slides up 3 units. Your "floor" moves from $$y=0$$ to $$y=3$$.
* If $$k$$ is negative ($$-5$$): The entire graph slides down 5 units. Your "floor" is now at $$y=-5$$.

The **Horizontal** $$h$$ value sits in the exponent with $$x$$. This transformation moves the graph in the opposite direction of the sign you see.

* If you see $$(x - 3)$$: The graph moves Right 3 units.
* If you see $$(x + 2)$$: The graph moves Left 2 units.
* Why is it backward? To get the same output ($$y$$) as the original graph, you now have to use an $$x$$ value that is 3 units larger to "cancel out" the $$-3$$.

The **Vertical Stretch/Compression** $$a$$ value (the number in front) acts like you are grabbing the graph and pulling it taller or squishing it flatter.

* If $$|a| > 1$$: The graph gets "steep" faster (Vertical Stretch).
* If $$0 < |a| < 1$$: The graph looks flatter (Vertical Compression).
* If $$a$$ is negative ($$-a$$): The graph flips over the x-axis. Instead of exploding upward, it explodes downward.

$$f(x) = 2^{x-3} + 1$$:

1. Identify $$k$$: The asymptote is at $$y = 1$$. Draw a dashed line there first.
2. Identify $$h$$: The graph is moved Right 3.
3.  Find Y-Intercept: Plug in $$x = 0$$ to find exactly where it hits the y-axis.

    $$f(0) = 2^{0-3} + 1 = 2^{-3} + 1 = \frac{1}{8} + 1 = 1.125$$
