# Polynomial

A polynomial is a fundamental mathematical expression constructed from one or more variables and coefficients, using only the operations of `addition, subtraction, and multiplication, and non-negative integer exponents`.

The real world is almost never a straight line a linear function. Things curve, accelerate, decay, and fluctuate. Its used for modeling real-world problems and solving abstract mathematical problems.

General form

<p align="center"><span class="math">P(x) = a_n x^n + a_{n-1} x^{n-1} + \dots + a_1 x + a_0</span></p>

* The term $$\mathbf{a_n x^n}$$ is the leading term.
* The exponent $$\mathbf{n}$$ is the degree of the polynomial.
* The coefficient $$\mathbf{a_n}$$ is the leading coefficient.

<figure><img src="../.gitbook/assets/image (14).png" alt="" width="563"><figcaption><p>poly func</p></figcaption></figure>

The image shows that the linear, quadratic, and cubing functions are all types of polynomials. They create smooth, non-repeating curves. Compare those to the Goniometric Function (which repeats its wave pattern forever) or the Logarithmic/Exponential functions (which have limits or grow extremely fast), and you can see how different they are from the basic polynomial shape.

#### What Makes an Expression _Not_ a Polynomial?

An expression fails to be a polynomial if it violates the rule about exponents or operations:

* Negative Exponents: $$\frac{1}{x^2} = x^{-2}$$ (Cannot have $$x$$ in the denominator).
* Fractional/Rational Exponents: $$\sqrt{x} = x^{1/2}$$ (Cannot have variables inside a root).
* Other Functions: Expressions involving trigonometric functions ($$\sin(x)$$), logarithms ($$\log(x)$$), or absolute values ($$|x|$$).

#### Degree of a Polynomial

Degree tells you a lot about the shape of the graph, the maximum number of times it can cross the x-axis, and how quickly the function grows.

<table><thead><tr><th width="152.199951171875">Name</th><th width="137">Degree</th><th>Example</th><th>Leading Term</th></tr></thead><tbody><tr><td>Constant</td><td>0</td><td><span class="math">P(x) = 10</span></td><td><span class="math">10</span> (since <span class="math">10 = 10x^0</span>)</td></tr><tr><td>Linear</td><td>1</td><td><span class="math">P(x) = \mathbf{5x} - 2</span></td><td><span class="math">5x^1</span></td></tr><tr><td>Quadratic</td><td>2</td><td><span class="math">P(x) = 3x - \mathbf{2x^2} + 7</span></td><td><span class="math">-2x^2</span></td></tr><tr><td>Cubic</td><td>3</td><td><span class="math">$P(x) = \mathbf{x^3} + 4x^2 - 1</span></td><td><span class="math">x^3</span></td></tr><tr><td>Quartic</td><td>4</td><td><span class="math">P(x) = 8x + \mathbf{6x^4}</span></td><td><span class="math">6x^4</span></td></tr></tbody></table>

The degree ($$n$$) determines the maximum number of real roots (or zeros) the polynomial can have. The roots are the values of $$x$$ where $$P(x)=0$$, which is where the graph crosses or touches the x-axis.

* A degree 2 (quadratic) polynomial, like $$x^2 - 4$$, can cross the x-axis at most twice (at $$x=-2$$ and $$x=2$$).
* A degree 3 (cubic) polynomial can cross the x-axis at most three times.

The degree also determines the end behavior, which is what happens to the function's value ($$P(x)$$) as $$x$$ gets extremely large (approaching $$\infty$$) or extremely small (approaching $$-\infty$$). The sign of the leading coefficient ($$a_n$$) also plays a role.

<table><thead><tr><th>Degree Type</th><th width="169.4000244140625">Leading Coefficient (an​)</th><th>Graph Behavior</th><th>Analogy</th></tr></thead><tbody><tr><td>Even (e.g., 2, 4)</td><td>Positive</td><td>Both ends go up (<span class="math">\uparrow \dots \uparrow</span>)</td><td>A parabola opening up (<span class="math">y=x^2</span>).</td></tr><tr><td>Even (e.g., 2, 4)</td><td>Negative</td><td>Both ends go down (<span class="math">\downarrow \dots \downarrow</span>)</td><td>A parabola opening down (<span class="math">y=-x^2</span>).</td></tr><tr><td>Odd (e.g., 1, 3)</td><td>Positive</td><td>Starts down, ends up (<span class="math">\downarrow \dots \uparrow</span>)</td><td>A line going up (<span class="math">y=x</span>).</td></tr><tr><td>Odd (e.g., 1, 3)</td><td>Negative</td><td>Starts up, ends down (<span class="math">\uparrow \dots \downarrow</span>)</td><td>A line going down (<span class="math">y=-x</span>).</td></tr></tbody></table>

#### Example in Economics: Profit Maximization

A mobile phone manufacturer has the following functions, where $$x$$ is the number of phones manufactured:

* Cost Function ($$C$$): $$C(x) = 2000x + 750,000$$
* Revenue Function ($$R$$): $$R(x) = -0.09x^2 + 7000x$$

The Profit Function ($$P$$) is defined as $$P(x) = R(x) - C(x)$$. Find the polynomial function for profit and determine the profit when $$25,000$$ phones are produced.

Find the Profit Function $$P(x)$$: The profit function is calculated by subtracting the cost function from the revenue function:

$$
P(x) = R(x) - C(x)
$$

$$
P(x) = (-0.09x^2 + 7000x) - (2000x + 750,000)
$$

$$
P(x) = -0.09x^2 + 7000x - 2000x - 750,000
$$

$$
P(x) = -0.09x^2 + 5000x - 750,000
$$

The resulting profit function is a **quadratic polynomial**. Calculate Profit for $$x = 25,000$$ phones:

Substitute the value $$x = 25,000$$ into the profit function $$P(x)$$:

$$
P(25,000) = -0.09(25,000)^2 + 5000(25,000) - 750,000
$$

$$
P(25,000) = -0.09(625,000,000) + 125,000,000 - 750,000
$$

$$
P(25,000) = -56,250,000 + 125,000,000 - 750,000
$$

$$
P(25,000) = 68,000,000
$$

**Conclusion:** Producing $$25,000$$ phones yields a profit of **$68,000,000**.

***

#### Example in Software Engineering: Performance Modeling

A software team uses a **cubic polynomial** (degree 3) to model the **load time** ($$y$$, in seconds) of their application based on the **number of concurrent users** ($$x$$, in hundreds). The regression analysis resulted in the following model:

$$
y = 0.00001x^3 - 0.005x^2 + 0.8x + 5
$$

Determine the predicted load time when the application has 300 concurrent users.

Identify the input value $$x$$:

Since $$x$$ is the number of concurrent users in hundreds, 300 users corresponds to $$x=3$$. Substitute $$x=3$$ into the Polynomial Function:

Substitute the value $$x=3$$ into the load time polynomial function $$y(x)$$:

$$
y(3) = 0.00001(3)^3 - 0.005(3)^2 + 0.8(3) + 5
$$

$$
y(3) = 0.00001(27) - 0.005(9) + 2.4 + 5
$$

$$
y(3) = 0.00027 - 0.045 + 2.4 + 5
$$

$$
y(3) = 7.35527
$$

**Conclusion:** The predicted load time for the application with 300 concurrent users is approximately **7.36 seconds**.

### Polynomial Division

We use polynomial division (both long and synthetic) because it's a powerful tool that allows us to do things we cannot do easily (or at all) with basic factoring or substitution, especially when dealing with polynomials of degree three or higher.
