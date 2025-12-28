# Matrix

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

***

**Schwarz Inequality:** $$|v \cdot w| \leq \|v\| \|w\|$$

$$\|v\| \|w\| = 5 \times 2.23 = \mathbf{11.15}$$.

$$\text{Similarity} = \frac{\text{Actual Score (Dot Product)}}{\text{Potential Score (Product of Lengths)}}$$

$$\frac{11.0}{11.15} \approx \mathbf{0.986}$$
