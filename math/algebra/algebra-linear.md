# Algebra Linear

1D Vector: A single value (a scalar).

2D Vector: A coordinate pair $$[x, y]$$ used to position a pixel on a screen.

n-Dimensional Vector: A list of 1,000 numbers representing a user's preferences in a Netflix recommendation algorithm.

***



### Linear Combination

Scalar Multiplication

$$\vec{v} = \begin{bmatrix} 2 \\ 3 \end{bmatrix}$$ and a scalar $$c = 2$$.

The scalar multiplication $$c\vec{v}$$ would be:

$$2 \times \begin{bmatrix} 2 \\ 3 \end{bmatrix} = \begin{bmatrix} 2 \times 2 \\ 2 \times 3 \end{bmatrix} = \begin{bmatrix} 4 \\ 6 \end{bmatrix}$$

***

Vector Addition

$$\vec{a} = \begin{bmatrix} 4 \\ 6 \end{bmatrix}$$ and $$\vec{b} = \begin{bmatrix} 1 \\ -2 \end{bmatrix}$$

The vector addition $$\vec{a} + \vec{b}$$ would be:

$$\begin{bmatrix} 4 \\ 6 \end{bmatrix} + \begin{bmatrix} 1 \\ -2 \end{bmatrix} = \begin{bmatrix} 4 + 1 \\ 6 + (-2) \end{bmatrix} = \begin{bmatrix} 5 \\ 4 \end{bmatrix}$$

### Dot Product

dot product is a single number that reveals the relationship between two vectors.&#x20;

$$\vec{A} = [3, 4]$$ and $$\vec{B} = [1, 2]$$

$$(3 \times 1) + (4 \times 2) = 3 + 8 = \mathbf{11}$$

The number 11. It is no longer a point on a graph; it is a "score."

***

the length is $$\|\vec{v}\| = \sqrt{x^2 + y^2}$$

Length of $$\vec{A}$$ is 5 (because $$\sqrt{3^2 + 4^2} = 5$$). The Length of $$\vec{B}$$ is 2.23.

This tells you how intense or strong the data is. example: In music: It’s the Volume. A loud song has a long vector; a quiet song has a short vector.

***

**Schwarz Inequality**

&#x20;$$|v \cdot w| \leq \|v\| \|w\|$$

$$\|v\| \|w\| = 5 \times 2.23 = \mathbf{11.15}$$. (length)

$$\text{Similarity} = \frac{\text{Actual Score (Dot Product)}}{\text{Potential Score (Product of Lengths)}}$$

$$\frac{11.0}{11.15} \approx \mathbf{0.986}$$

If a "Loud" song and a "Quiet" song are both Heavy Metal, they will point in the same direction (small angle).

***

**Unit Vector**

we often want to keep the direction of a vector but change its length to 1. This is called a Unit Vector ($$\mathbf{u}$$).

$$\mathbf{u} = \frac{\mathbf{v}}{\|\mathbf{v}\|}$$

$$\vec{A} = [3, 4]$$ and its length is $$5$$.

$$\mathbf{u} = [3/5, 4/5] = [0.6, 0.8]$$.

This "normalizes" data so you can compare different vectors fairly, regardless of how big the numbers started.

***

**Cosine Rule (The Angle)**

the "Similarity" as $$0.986$$. In Strang's book, that number is formally known as $$\cos(\theta)$$. formula ($$\frac{v \cdot w}{\|v\| \|w\|}$$) is exactly how we find the angle between two vectors.

* If the result is 1, the angle is 0° (Perfectly aligned).
* If the result is 0, the angle is 90° (Perpendicular).

***

**Triangle Inequality**

It states that the shortest distance between two points is a straight line.

$$\|v + w\| \leq \|v\| + \|w\|$$

Imagine you walk along vector $$\vec{v}$$, then turn and walk along vector $$\vec{w}$$.

* The total distance you walked is $$\|v\| + \|w\|$$.
* The "shortcut" (the direct line from start to finish) is $$\|v + w\|$$.
* The shortcut can never be longer than the two separate paths added together.

$$\vec{A} = [3, 4]$$ and $$\vec{B} = [1, 2]$$.

* Length of A: $$5$$
* Length of B: $$2.23$$
* Sum of Lengths: $$5 + 2.23 = \mathbf{7.23}$$

Now, let's find the "Shortcut" ($$\vec{A} + \vec{B}$$):

* $$\vec{A} + \vec{B} = [3+1, 4+2] = [4, 6]$$
* Length of Shortcut: $$\sqrt{4^2 + 6^2} = \sqrt{16 + 36} = \sqrt{52} \approx \mathbf{7.21}$$

$$7.21 \leq 7.23$$.

The shortcut ($$7.21$$) is slightly shorter than the long way around ($$7.23$$) because the two vectors aren't pointing in the exact same direction. They form a very thin triangle!

### Matrix
