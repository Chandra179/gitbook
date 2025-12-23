# Basic II

### Equations

<figure><img src="../.gitbook/assets/prop_equality.png" alt=""><figcaption></figcaption></figure>

### Linear Equation

its always a straight line, so the of degree power (exponent) is 1

* $$y = mx + b$$
* $$ax + by = c$$

### Non-Linear Equation

the exponent is greater than 1

* $$y = 3x^2 - 4x + 1$$
* $$x^3 + y = 7$$

### Quadratic Equation

Quadratic equations are essential for modeling paths, areas, and optimization problems. They are defined by the standard form $$ax^2 + bx + c = 0$$, where $$x$$ is the unknown, and $$a$$, $$b$$, and $$c$$ are known coefficients.

#### Completing Square

$$3x^2 + 5x - 4 = 0$$.

To start, you must divide everything by $$a=3$$

$$x^2 + \frac{5}{3}x - \frac{4}{3} = 0$$

Then, to complete the square, you need to add $$(\frac{b}{2})^2$$

$$\left(\frac{1}{2} \cdot \frac{5}{3}\right)^2 = \left(\frac{5}{6}\right)^2 = \frac{25}{36}$$

Working with those fractions is complex and prone to error.

#### Quadratic Formula

Must degree of 2

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

With the formula, you just plug in $$a=3$$, $$b=5$$, and $$c=-4$$ directly, avoiding all the complicated steps:

$$x = \frac{-5 \pm \sqrt{5^2 - 4(3)(-4)}}{2(3)}$$

We use quadratic functions whenever a relationship involves squaring a value, ex: Projectile Motion (Physics), Optimization (Business & Engineering)

#### Complex Number

Real number + imaginary number

$$a + bi$$

The Real Part ($$a$$): These are normal numbers like $$5$$, $$-3$$

The Imaginary Part ($$bi$$): This is a real number multiplied by $$i$$

<figure><img src="../.gitbook/assets/complex_number_table.png" alt=""><figcaption></figcaption></figure>

### Guidelines for Modeling with Equations

1. Identify the Variable. **Identify the quantity** that the problem asks you to find. This quantity can usually be determined by a careful reading of the question that is posed at the end of the problem. Then introduce notation for the variable (call it x or some other letter).
2. Translate from **Words to Algebra**. Read each sentence in the problem again, and express all the quantities mentioned in the problem in terms of the variable you defined in Step 1. To organize this information, it is sometimes helpful to draw a diagram or make a table.
3. Set Up the Model. Find the crucial fact in the problem that gives a relationship between the expressions you listed in Step 2. Set up an equation (or model) that expresses this relationship.
4. Solve the Equation and Check Your Answer. Solve the equation, check your answer, and state your answer as a sentence.

A car rental company charges $30 a day and 15¢ a mile for renting a car. A tourist rents\
a car for two days, and the bill comes to $108. How many miles was the car driven?

* Let $$x$$ = the number of miles driven.
* Daily cost: The company charges $$\$30$$ per day. Since the car was rented for 2 days, the cost is $$2 \times 30 = 60$$.
* Mileage cost: The company charges $$15¢$$ (or $$\$0.15$$) per mile. For $$x$$ miles, the cost is $$0.15x$$.
* Total Bill: The problem states the final bill comes to $$\$108$$.
* $$\text{Daily Cost} + \text{Mileage Cost} = \text{Total Bill}$$
* $$60 + 0.15x = 108$$

### Inequalities

<figure><img src="../.gitbook/assets/inequalities_rules.png" alt=""><figcaption></figcaption></figure>

A linear inequality is one where the variable has a power of 1. When you graph these, they always form a straight line that divides the plane into two regions.

* $$ax + b < c$$ or $$y > mx + b$$
* $$2x + 3 \leq 7$$

> Subtract 3: $$2x \leq 4$$
>
> Divide by 2: $$x \leq 2$$

A nonlinear inequality contains a variable with a power other than 1 (like $$x^2$$, $$x^3$$), or variables multiplied together, or variables in a denominator.

* Quadratic ($$x^2$$), Rational ($$\frac{1}{x}$$), or Absolute Value ($$|x|$$).
* $$x^2 - 4 > 0$$

> Find the "critical points" where $$x^2 - 4 = 0$$. This happens at $$x = 2$$ and $$x = -2$$.
>
> Test the intervals:
>
> * If $$x = 0$$ (between -2 and 2): $$0^2 - 4 > 0$$ is False.
> * If $$x = 3$$ (greater than 2): $$3^2 - 4 > 0$$ is True.
> *   If $$x = -3$$ (less than -2): $$(-3)^2 - 4 > 0$$ is True.
>
>     The solution is $$x < -2$$ or $$x > 2$$.

### The Coordinate Plane, Graphs of Equations, Circles

<figure><img src="../.gitbook/assets/coordinate_plane.png" alt="" width="563"><figcaption></figcaption></figure>

**Distance formula** $$d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$

* The Subtraction $$(x_2 - x_1)$$: This is just a math way of saying "how many steps did I walk sideways?" If you start at $$x=2$$ and end at $$x=5$$, you walked $$5 - 2 = 3$$ steps.
* The Squaring $$(...)^2$$: This comes directly from Pythagoras ($$a^2 + b^2 = c^2$$). Squaring also makes sure that even if you walk "backwards" (negative numbers), the result becomes positive, because distance is always positive.
* The Plus Sign $$(+)$$: We add the "sideways steps" squared and the "upward steps" squared together, just like $$a^2 + b^2$$.
* The Square Root $$(\sqrt{\dots})$$: In the Pythagorean theorem, we have $$c^2$$. To get just $$c$$ (the distance), we have to "undo" the square by taking the square root.

**Example**

<figure><img src="../.gitbook/assets/coorplane_example.png" alt="" width="375"><figcaption></figcaption></figure>

The goal is to find which point is closer to $$A(5, 3)$$. To do that, we find the distance to $$P(1, -2)$$ and the distance to $$Q(8, 9)$$.

Distance from $$A(5, 3)$$ to $$P(1, -2)$$

* Step 1 (Subtract): $$5 - 1 = 4$$ and $$3 - (-2) = 5$$
* Step 2 (Square): $$4^2 = 16$$ and $$5^2 = 25$$
* Step 3 (Add): $$16 + 25 = 41$$
* Step 4 (Root): The distance is $$\sqrt{41} \approx \mathbf{6.40}$$

Distance from $$A(5, 3)$$ to $$Q(8, 9)$$

* Step 1 (Subtract): $$5 - 8 = -3$$ and $$3 - 9 = -6$$
*   Step 2 (Square): $$(-3)^2 = 9$$ and $$(-6)^2 = 36$$

    (Notice how squaring makes the negatives disappear!)
* Step 3 (Add): $$9 + 36 = 45$$
* Step 4 (Root): The distance is $$\sqrt{45} \approx \mathbf{6.71}$$

The Conclusion

Since $$\sqrt{41}$$ is a smaller number than $$\sqrt{45}$$, Point $$P$$ is closer to $$A$$ than Point $$Q$$ is.

***

<figure><img src="../.gitbook/assets/midpoint_distance.png" alt="" width="563"><figcaption></figcaption></figure>

**Midpoint formula** finds the coordinates of the point that lies exactly halfway between two endpoints.

$$M = \left( \frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2} \right)$$

**Circle equation standard Form (Center-Radius Form)**

This is the most common and useful form because it tells you the center and the radius at a glance.

$$(x - h)^2 + (y - k)^2 = r^2$$

* $$(h, k)$$: The coordinates of the center.
* $$r$$: The radius of the circle.
* $$(x, y)$$: Any point on the edge of the circle.

### Lines

slope is the measure of steepness

$$slope = rise/sun$$

$$m = \frac{y_2 - y_1}{x_2 - x_1}$$

* Numerator ($$y_2 - y_1$$): This is the Rise. It tells you how much the line goes up or down.
* Denominator ($$x_2 - x_1$$): This is the Run. It tells you how much the line goes left or right.

<figure><img src="../.gitbook/assets/slope_of_line.png" alt=""><figcaption></figcaption></figure>

