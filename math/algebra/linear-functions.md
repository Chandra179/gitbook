# Linear Functions

### **Slope**

When you have two points $$(x_1, y_1)$$ and $$(x_2, y_2)$$ and need to find the steepness ($$m$$).

$$slope(m) = rise/run$$

$$m = \frac{y_2 - y_1}{x_2 - x_1}$$

* $$(2, 3)$$ and $$(5, 9)$$
* $$m = \frac{9 - 3}{5 - 2}$$

### **Slope-Intercept**

$$y=mx+b$$

Use this when you know the slope ($$m$$) and exactly where the line hits the vertical axis, called the y-intercept ($$b$$)

$$m = -\frac{1}{2}$$ and $$b = 4$$

* $$y = -\frac{1}{2}x + 4$$
* $$y = -\frac{1}{2}(10) + 4 \rightarrow y = -5 + 4$$.
* $$y = -1$$

### **Point-Slope**

$$y - y_1 = m(x - x_1)$$

Use this when you have one point $$(x_1, y_1)$$ and the slope ($$m$$), but you don't know where the line crosses the $$y$$-axis.

Write the equation of a line that has a slope of $$3$$ and passes through the point $$(4, -1)$$.

* Identify $$m = 3$$, $$x_1 = 4$$, and $$y_1 = -1$$.
* $$y - (-1) = 3(x - 4)$$
* $$y + 1 = 3(x - 4)$$
* $$y + 1 = 3(x - 4)$$

### **Standard Form**

$$Ax + By = C$$. used it to find intercepts easily or to solve systems of equations using the "Elimination"

Find the x-intercept and y-intercept for the line $$3x + 4y = 12$$.

* To find the x-intercept, set $$y=0$$ ⇒ $$3x + 4(0) = 12 \rightarrow 3x = 12 \rightarrow x = 4$$.
* To find the y-intercept, set $$x=0$$ ⇒ $$3(0) + 4y = 12 \rightarrow 4y = 12 \rightarrow y = 3$$.
* The line hits the x-axis at $$(4, 0)$$ and the y-axis at $$(0, 3)$$.

<figure><img src="../../.gitbook/assets/circle_problem.png" alt="" width="563"><figcaption></figcaption></figure>

* We had two points: $$(5, 5)$$ and $$(8, 1)$$. We calculated the slope $$m = -\frac{4}{3}$$.
*   Point-Slope: We plugged the point $$(5, 5)$$ into the Point-Slope formula:

    $$y - 5 = -\frac{4}{3}(x - 5)$$.
*   Slope-Intercept: we move the $$-5$$ to the other side to get the Slope-Intercept version:

    $$y = -\frac{4}{3}x + \frac{35}{3}$$.

### Linear Inequalities

If you multiply or divide both sides of an inequality by a negative number, you must flip the direction of the inequality sign.

* $$-2x < 10$$, then $$x > -5$$.

Adding or subtracting numbers does not change the sign, even if the numbers are negative.

### Substitution & Elimination

**Elimination**

$$\begin{cases} 3x + 4y = 7 \\ 2x + 3y = 5 \end{cases}$$

Multiply the top by $$2$$ and the bottom by $$-3$$:

$$\begin{cases} 6x + 8y = 14 \\ -6x - 9y = -15 \end{cases}$$

$$-y = -1 \implies y = 1$$

$$2x + 3(1) = 5 \implies 2x = 2 \implies x = 1$$

$$(1, 1)$$

***

**Substitution**

$$\begin{cases} 2x - 3y = -2 \\ 4x + y = 24 \end{cases}$$

Isolate $$y$$ in the second equation: $$y = 24 - 4x$$

Substitute into the first: $$2x - 3(24 - 4x) = -2$$

$$2x - 72 + 12x = -2$$

$$14x = 70 \implies x = 5$$

Substitute: $$y = 24 - 4(5) \implies y = 4$$

$$(5, 4)$$

### Inverse Functions

The $$-1$$ in $$f^{-1}(x)$$ is not an exponent. It doesn't mean $$\frac{1}{f(x)}$$. It is simply a special symbol used to label the inverse

Find the inverse of $$f(x) = 2x + 3$$

1.  Replace $$f(x)$$ with $$y$$

    $$y = 2x + 3$$
2.  Swap $$x$$ and $$y$$

    $$x = 2y + 3$$
3.  Solve for the new $$y$$

    $$x - 3 = 2y$$\
    $$\frac{x - 3}{2} = y$$
4.  Replace $$y$$ with $$f^{-1}(x)$$

    $$f^{-1}(x) = \frac{x - 3}{2}$$

To prove the answer is correct, use Function Composition. If you plug the inverse into the original, they should "cancel out" to leave just $$x$$:

$$f(f^{-1}(x)) = 2\left(\frac{x - 3}{2}\right) + 3$$

1. The $$2$$s cancel: $$(x - 3) + 3$$
2. The $$3$$s cancel: $$x$$ > Result: If you get $$x$$, your inverse is perfect.

