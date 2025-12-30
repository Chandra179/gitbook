# Core

### **Terms**

<table><thead><tr><th width="128.2000732421875">Terms</th><th width="177.199951171875">Name</th><th>Example</th></tr></thead><tbody><tr><td>0</td><td>Zero Polynomial</td><td><span class="math">0</span></td></tr><tr><td>1</td><td>Monomial</td><td><span class="math">7x^3</span></td></tr><tr><td>2</td><td>Binomial</td><td><span class="math">x - 5</span></td></tr><tr><td>3</td><td>Trinomial</td><td><span class="math">x^2 + 2x + 1</span></td></tr><tr><td>4+</td><td>Polynomial</td><td><span class="math">x^3 + 3x^2 - x + 10</span></td></tr></tbody></table>

### **Exponential**

<table><thead><tr><th width="207.800048828125">Rule Name</th><th width="237.2000732421875">Mathematical Definition</th><th>Example</th></tr></thead><tbody><tr><td>Product Rule</td><td><span class="math">x^a \cdot x^b = x^{a+b}</span></td><td><span class="math">x^4 \cdot x^5 = x^{4+5} = x^9</span></td></tr><tr><td>Quotient Rule</td><td><span class="math">\frac{x^a}{x^b} = x^{a-b}</span></td><td><span class="math">\frac{x^7}{x^3} = x^{7-3} = x^4</span></td></tr><tr><td>Power of a Power</td><td><span class="math">(x^a)^b = x^{a \cdot b}</span></td><td><span class="math">(x^3)^2 = x^6</span></td></tr><tr><td>Negative Exponent</td><td><span class="math">x^{-a} = \frac{1}{x^a}</span></td><td><span class="math">x^{-2} = \frac{1}{x^2}</span></td></tr><tr><td>Zero Exponent</td><td><span class="math">x^0 = 1</span> (where <span class="math">x \neq 0</span>)</td><td><span class="math">1,250^0 = 1</span></td></tr></tbody></table>

### **Radical**

<table><thead><tr><th width="172.5999755859375">Radical Form</th><th width="165.7999267578125">Exponent Form</th><th>Logic</th></tr></thead><tbody><tr><td><span class="math">\sqrt{x}</span></td><td><span class="math">x^{1/2}</span></td><td>The "invisible" root is 2.</td></tr><tr><td><span class="math">\sqrt[3]{x}</span></td><td><span class="math">x^{1/3}</span></td><td>The root is 3.</td></tr><tr><td><span class="math">\sqrt[3]{x^2}</span></td><td><span class="math">x^{2/3}</span></td><td>The power is 2, the root is 3.</td></tr><tr><td><span class="math">(\sqrt[4]{x})^5</span></td><td><span class="math">x^{5/4}</span></td><td>The power is 5, the root is 4.</td></tr></tbody></table>

### **Factoring** &#x20;

$$x^2 + 7x + 10$$

* What multiplies to $$10$$? (Possible pairs: $$1 \times 10$$ or $$2 \times 5$$).
* Which pair adds to $$7$$? ($$2 + 5 = 7$$).
* Factored Form: $$(x + 2)(x + 5)$$.

### Complex & Imaginary Numbers

$$a + bi$$

* $$i = \sqrt{-1}$$
* $$i^2 = -1$$
* $$x = \sqrt{-9} \rightarrow \sqrt{9} \cdot \sqrt{-1} \rightarrow \mathbf{3i}$$

**The Cycle of** $$i$$

One of the most unique things about $$i$$ is that it repeats in a four-step cycle when you raise it to higher powers.

* $$i^1 = i$$
* $$i^2 = -1$$
* $$i^3 = -i$$
* $$i^4 = 1$$ (The cycle then restarts: $$i^5$$ is the same as $$i^1$$)

**Multiplication (FOIL)**

$$(2 + i)(3 + i)$$

$$6 + 5i + i^2$$

$$6 + 5i - 1 = \mathbf{5 + 5i}$$

### **Binomial Theorem**

Binomial Theorem is a shortcut used to expand expressions where two terms (a binomial) are raised to a high power, such as $$(x + y)^{10}$$

Instead of manually multiplying $$(x + y)$$ by itself ten times which would take a lot of time and likely lead to errors. The theorem provides a formula to find the expanded version instantly.

<p align="center"><span class="math">(a + b)^n = \sum_{k=0}^{n} \binom{n}{k} a^{n-k} b^k</span></p>

* $$n$$ is the power
* $$\binom{n}{k}$$ (Binomial Coefficient): This is the "n choose k" combination. It tells you the number in front of each term. You can find these using factorials or Pascal’s Triangle.
* $$a^{n-k}$$: The power of the first term starts at $$n$$ and decreases by 1 for each term.
* $$b^k$$: The power of the second term starts at 0 and increases by 1 for each term.
* $$n + 1$$ Terms: There will always be one more term than the power you started with (e.g., $$(x+y)^3$$ has 4 terms).

$$(x + 2)^3$$

Since $$n = 3$$, there will be $$3 + 1 = 4$$ terms

* Term 1 ($$k=0$$): $$\binom{3}{0} x^3 (2)^0 = 1 \cdot x^3 \cdot 1 = \mathbf{x^3}$$
* Term 2 ($$k=1$$): $$\binom{3}{1} x^2 (2)^1 = 3 \cdot x^2 \cdot 2 = \mathbf{6x^2}$$
* Term 3 ($$k=2$$): $$\binom{3}{2} x^1 (2)^2 = 3 \cdot x \cdot 4 = \mathbf{12x}$$
* Term 4 ($$k=3$$): $$\binom{3}{3} x^0 (2)^3 = 1 \cdot 1 \cdot 8 = \mathbf{8}$$

$$(x + 2)^3 = x^3 + 6x^2 + 12x + 8$$

### Transformation

<table><thead><tr><th width="166.5999755859375">Function</th><th width="262">Parent Shape</th><th>Transformation Equation</th></tr></thead><tbody><tr><td>Linear</td><td>Straight Line</td><td><span class="math">f(x) = a(x - h) + k</span></td></tr><tr><td>Quadratic</td><td>Parabola (U)</td><td><span class="math">f(x) = a(x - h)^2 + k</span></td></tr><tr><td>Absolute Value</td><td>V-Shape</td><td><span class="math">f(x) = a</span></td></tr><tr><td>Exponential</td><td>The "L" Curve</td><td><span class="math">f(x) = a \cdot b^{(x - h)} + k</span></td></tr><tr><td>Logarithmic</td><td>The "Sideways" Curve</td><td><span class="math">f(x) = a \cdot \log_b(x - h) + k</span></td></tr><tr><td>Rational</td><td>The "Split" Curves</td><td><span class="math">f(x) = \frac{a}{x - h} + k</span></td></tr></tbody></table>

### Function Composition

$$f(g(x))$$ is called a composite function

the output of $$g(x)$$ becomes the input for $$f(x)$$
