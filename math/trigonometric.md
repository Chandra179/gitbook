# Trigonometric

The trigonometric functions can be defined in two different but equivalent ways:\
as functions of real numbers (Chapter 5) or as functions of angles (Chapter 6). The\
two approaches are independent of each other, so either Chapter 5 or Chapter 6\
may be studied first.

### **Unit circle**

Because it is a circle with radius $$r = 1$$, its equation is derived from the Pythagorean theorem:

$$x^2 + y^2 = 1$$

Any point $$(x, y)$$ that lies on the boundary of this circle must satisfy that equation.

<figure><img src="../.gitbook/assets/circle_terminal_point.png" alt=""><figcaption></figcaption></figure>

a **terminal point** is the exact $$(x, y)$$ coordinate where an angle "ends" on the unit circle

<figure><img src="../.gitbook/assets/circle_reference_number.png" alt=""><figcaption></figcaption></figure>

#### **Reference Number**

<figure><img src="../.gitbook/assets/reference_number.png" alt=""><figcaption></figcaption></figure>

Reference Number (often denoted as $$\bar{t}$$ or $$t$$) is a "shortcut" tool. It is the shortest distance along the unit circle between a terminal point and the x-axis

### **Trigonometric Functions of Real Numbers (Circular Trigonometry)**

On the unit circle, the primary functions are defined as:

* Sine: $$\sin(\theta) = y$$
* Cosine: $$\cos(\theta) = x$$
* Tangent: $$\tan(\theta) = \frac{y}{x}$$ (where $$x \neq 0$$)

**Reciprocal Trigonometric Formulas**

These functions are the "flipped" versions of the primary ones:

* Cosecant: $$\csc(\theta) = \frac{1}{y}$$ (where $$y \neq 0$$)
* Secant: $$\sec(\theta) = \frac{1}{x}$$ (where $$x \neq 0$$)
* Cotangent: $$\cot(\theta) = \frac{x}{y}$$ (where $$y \neq 0$$)

<figure><img src="../.gitbook/assets/special_value_trigonometric_func.png" alt=""><figcaption></figcaption></figure>

### **Domain of trigonometric function**

<table><thead><tr><th width="137.39996337890625">Function</th><th>Domain (Input)</th><th>Range (Output)</th></tr></thead><tbody><tr><td><span class="math">\sin(x)</span></td><td>All Real Numbers <span class="math">(-\infty, \infty)</span></td><td><span class="math">[-1, 1]</span></td></tr><tr><td><span class="math">\cos(x)</span></td><td>All Real Numbers <span class="math">(-\infty, \infty)</span></td><td><span class="math">[-1, 1]</span></td></tr><tr><td><span class="math">\tan(x)</span></td><td>All <span class="math">x \neq \frac{\pi}{2} + n\pi</span> (Odd multiples of <span class="math">90^\circ</span>)</td><td><span class="math">(-\infty, \infty)</span></td></tr><tr><td><span class="math">\csc(x)</span></td><td>All <span class="math">x \neq n\pi</span> (Multiples of <span class="math">180^\circ</span>)</td><td><span class="math">(-\infty, -1] \cup [1, \infty)</span></td></tr><tr><td><span class="math">\sec(x)</span></td><td>All <span class="math">x \neq \frac{\pi}{2} + n\pi</span> (Odd multiples of <span class="math">90^\circ</span>)</td><td><span class="math">(-\infty, -1] \cup [1, \infty)</span></td></tr><tr><td><span class="math">\cot(x)</span></td><td>All <span class="math">x \neq n\pi</span> (Multiples of <span class="math">180^\circ</span>)</td><td><span class="math">(-\infty, \infty)</span> </td></tr></tbody></table>

### **Identities**

Use identities for Simplification, Solving trigonometric equation, etc..

**Reciprocal and Quotient Identities**

These define how the six functions relate to one another:

* Quotient: $$\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}$$ and $$\cot(\theta) = \frac{\cos(\theta)}{\sin(\theta)}$$
* Reciprocal: $$\csc(\theta) = \frac{1}{\sin(\theta)}$$, $$\sec(\theta) = \frac{1}{\cos(\theta)}$$, and $$\cot(\theta) = \frac{1}{\tan(\theta)}$$

**Pythagorean Identities**

Based on the Pythagorean theorem ($$a^2 + b^2 = c^2$$) applied to the unit circle:

* $$\sin^2(\theta) + \cos^2(\theta) = 1$$
* $$1 + \tan^2(\theta) = \sec^2(\theta)$$
* $$1 + \cot^2(\theta) = \csc^2(\theta)$$

**example**

$$f(x) = (\sin x + \cos x)^2 - 2\sin x \cos x$$

First, we use basic algebra to expand the squared part $$(a + b)^2 = a^2 + 2ab + b^2$$:

$$(\sin x + \cos x)^2 = \sin^2 x + 2\sin x \cos x + \cos^2 x$$

Now, put that back into the full equation:

$$f(x) = (\sin^2 x + 2\sin x \cos x + \cos^2 x) - 2\sin x \cos x$$

1. Notice $$+2\sin x \cos x$$ and a $$-2\sin x \cos x$$. They cancel each other out completely.
2. Pythagorean Identity: You are left with $$\sin^2 x + \cos^2 x$$. As we know from the fundamental identity, this always equals 1.

Result: $$f(x) = 1$$

Beyond the basics, there are several dozen "advanced" identities used in calculus, physics, and complex engineering:

* Even/Odd Identities (6): Based on the symmetry of the circle (e.g., $$\sin(-x) = -\sin x$$).
* Cofunction Identities (6): Relating sines to cosines of complementary angles (e.g., $$\sin(\frac{\pi}{2} - x) = \cos x$$).
* Sum and Difference (6): Formulas for $$\sin(A \pm B)$$, etc.
* Double-Angle (5+): Formulas for $$\sin(2x)$$, $$\cos(2x)$$, and $$\tan(2x)$$.
* Half-Angle (3): Formulas for $$\sin(\frac{x}{2})$$, etc.
* Product-to-Sum & Sum-to-Product (8): Used heavily in audio and signal processing.

### Inverse trigonometric function

Imagine you have a 10-foot long ladder. You lean it against a wall.

1. You want the top of the ladder to touch a window that is exactly 8 feet high.
2. The Question: How much do you need to tilt the ladder? (What is the angle between the ladder and the ground?)

In normal math, you have the angle and find the height. But here, you have the "result" (the height) and you need to find the "cause" (the angle).

* Step 1: You know the ladder length (10) and the height (8).
* Step 2: Height divided by Ladder is called Sine.
* Step 3: $$8 \div 10 = 0.8$$.
* Step 4: You ask your calculator: _"Which angle gives me a Sine of 0.8?"_
* $$\sin^{-1}(0.8)$$ = 53 degrees.

modelling harmonic motion, damped harmonic function
