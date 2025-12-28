# Algebra Linear

1D Vector: A single value (a scalar).

2D Vector: A coordinate pair $$[x, y]$$ used to position a pixel on a screen.

n-Dimensional Vector: A list of 1,000 numbers representing a user's preferences in a Netflix recommendation algorithm.

***

### Linear Combination

<figure><img src="../../.gitbook/assets/vector_addition.png" alt=""><figcaption></figcaption></figure>

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

This tells you how intense or strong the data is. example: In music: It’s the Volume. A loud song has a long vector; a quiet song has a short vector.

***

**Schwarz Inequality**

&#x20;$$|v \cdot w| \leq \|v\| \|w\|$$

***

the length is $$\|\vec{v}\| = \sqrt{x^2 + y^2}$$

Length of $$\vec{A}$$ is 5 (because $$\sqrt{3^2 + 4^2} = 5$$). The Length of $$\vec{B}$$ is 2.23.

$$\|v\| \|w\| = 5 \times 2.23 = \mathbf{11.15}$$. (Maximum possible dot product you could get if two specific vectors were perfectly aligned)

***

**Cosine Rule (The Angle)**

$$\text{Similarity} = \frac{\text{Actual Score (Dot Product)}}{\text{Potential Score (Product of Lengths)}}$$

$$\frac{11.0}{11.15} \approx \mathbf{0.986}$$

If a "Loud" song and a "Quiet" song are both Heavy Metal, they will point in the same direction (small angle).

* $$\cos(\theta) = 0.986$$.
* $$\cos^{-1}(0.986)$$ $$\approx 9.6^\circ$$

<table><thead><tr><th width="206.199951171875">If Similarity (Cosine) is...</th><th width="187.60003662109375">The Angle (θ) is...</th><th>What it means</th></tr></thead><tbody><tr><td>1.00</td><td>0°</td><td>Perfectly identical direction.</td></tr><tr><td>0.707</td><td>45°</td><td>Halfway between same and different.</td></tr><tr><td>0.00</td><td>90°</td><td>Completely different (Perpendicular).</td></tr></tbody></table>

***

**Unit Vector**

we often want to keep the direction of a vector but change its length to 1. This is called a Unit Vector ($$\mathbf{u}$$).

$$\mathbf{u} = \frac{\mathbf{v}}{\|\mathbf{v}\|}$$

$$\vec{A} = [3, 4]$$ and its length is $$5$$.

$$\mathbf{u} = [3/5, 4/5] = [0.6, 0.8]$$.

This "normalizes" data so you can compare different vectors fairly, regardless of how big the numbers started.

***

**Triangle Inequality**

<figure><img src="../../.gitbook/assets/triangle_inequality.png" alt=""><figcaption></figcaption></figure>

It states that the shortest distance between two points is a straight line.

$$\|v + w\| \leq \|v\| + \|w\|$$

Example

* Home: $$(0,0)$$
* Grocery Store: Point $$(4, 0)$$
* Coffee Shop: Point $$(4, 3)$$

First, you walk from Home to the Store, then from the Store to the Coffee Shop.

1. Vector $$\vec{v}$$ (Home to Store): You move 4 units East.
   * $$\vec{v} = [4, 0]$$
   * Length $$\|v\| = 4$$
2. Vector $$\vec{w}$$ (Store to Coffee): You move 3 units North.
   * $$\vec{w} = [0, 3]$$
   * Length $$\|w\| = 3$$

Total Distance of Path B: $$4 + 3 = \mathbf{7}$$

If you had walked straight from Home to the Coffee Shop, you are looking for the length of the vector $$\vec{v} + \vec{w}$$.

* Combined Vector: $$[4+0, 0+3] = [4, 3]$$
* Length $$\|v+w\|$$: Using Pythagoras: $$\sqrt{4^2 + 3^2} = \sqrt{16 + 9} = \sqrt{25} = \mathbf{5}$$

Now we plug these numbers into the inequality:

$$\|v + w\| \leq \|v\| + \|w\|$$

$$\mathbf{5} \leq \mathbf{4 + 3}$$

$$\mathbf{5} \leq \mathbf{7}$$

The inequality is True. The straight line ($$5$$) is shorter than the two-step path ($$7$$).

If you then walk from the Coffee Shop back to Home, you walk another $$5$$ units.

* Total Trip with the Store stop: $$4 + 3 + 5 = \mathbf{12}$$ units.
* Total Trip without the Store stop: $$5 + 5 = \mathbf{10}$$ units.

### Matrix

If Matrix $$A$$ is $$(m \times n)$$ and Matrix $$B$$ is $$(n \times p)$$, the resulting Matrix $$C$$ will be $$(m \times p)$$.

$$A = \begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \end{bmatrix}, \quad B = \begin{bmatrix} 7 & 8 \\ 9 & 10 \\ 11 & 12 \end{bmatrix}$$

Top-Left Entry (Row 1 of A $$\times$$ Column 1 of B)

$$(1 \times 7) + (2 \times 9) + (3 \times 11) = 7 + 18 + 33 = \mathbf{58}$$

Top-Right Entry (Row 1 of A $$\times$$ Column 2 of B):

$$(1 \times 8) + (2 \times 10) + (3 \times 12) = 8 + 20 + 36 = \mathbf{64}$$

Bottom-Left Entry (Row 2 of A $$\times$$ Column 1 of B):

$$(4 \times 7) + (5 \times 9) + (6 \times 11) = 28 + 45 + 66 = \mathbf{139}$$

Bottom-Right Entry (Row 2 of A $$\times$$ Column 2 of B):

$$(4 \times 8) + (5 \times 10) + (6 \times 12) = 32 + 50 + 72 = \mathbf{154}$$

$$C = \begin{bmatrix} 58 & 64 \\ 139 & 154 \end{bmatrix}$$

### Linear Equations

linear equations in matrix form, $$Ax = b$$

* Matrix $$A$$ (Coefficient Matrix): Contains only the numbers (coefficients) in front of the variables.
* Vector $$x$$ (Variable Vector): A column vector of the unknowns (e.g., $$x, y, z$$).
* Vector $$b$$ (Constant Vector): A column vector of the answers on the right side of the equals sign.

$$2x + 3y = 8$$

$$5x - y = 1$$

To write this in $$Ax = b$$ form:

$$\begin{bmatrix} 2 & 3 \\ 5 & -1 \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 8 \\ 1 \end{bmatrix}$$

***

### **Law Of Operations**

<table><thead><tr><th width="176.5999755859375">Operation</th><th width="187.4000244140625">Law</th><th>Formula</th></tr></thead><tbody><tr><td>Multiplication</td><td>Not Commutative</td><td><span class="math">AB \neq BA</span></td></tr><tr><td>Multiplication</td><td>Associative</td><td><span class="math">A(BC) = (AB)C</span></td></tr><tr><td>Transpose</td><td>Product Law</td><td><span class="math">(AB)^T = B^T A^T</span></td></tr><tr><td>Inverse</td><td>Product Law</td><td><span class="math">(AB)^{-1} = B^{-1} A^{-1}</span></td></tr><tr><td>Scalar</td><td>Distributive</td><td><span class="math">c(A + B) = cA + cB</span></td></tr></tbody></table>

***

### **Factorization**

**LU Decomposition (**$$A = LU$$**)**

This is the matrix version of Gaussian Elimination.

* L stands for Lower Triangular, and U stands for Upper Triangular.
* Once you factor $$A$$ into $$L$$ and $$U$$, you can solve $$Ax = b$$ for 1,000 different values of $$b$$ almost instantly. It is much faster than re-running elimination every time.

**QR Decomposition (**$$A = QR$$**)**

This breaks a matrix into an Orthogonal matrix ($$Q$$) and an Upper Triangular matrix ($$R$$). Computers love orthogonal matrices because they don't lose precision during calculations. This is the standard way to solve Least Squares problems (finding the best-fit line in Data Science).

**Singular Value Decomposition (**$$A = U\Sigma V^T$$**)**

It factors any matrix into three parts that represent its rotation, scaling, and rotation.

* Compression: You can throw away the small values in $$\Sigma$$ to shrink a high-res image into a tiny file while keeping it recognizable.
  * PCA (Principal Component Analysis): Finding the most important patterns in a massive dataset.

***

### **Augmented Matrix**

Often, when solving these equations by hand (using a method like Gaussian Elimination), we use an Augmented Matrix.&#x20;

$$\left[ \begin{array}{cc|c} 2 & 3 & 8 \\ 5 & -1 & 1 \end{array} \right]$$

To solve the equation we use&#x20;

### Identity Matrix

$$I = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

### Matrix Elimination

simplifying a complex fraction. make the matrix clean

#### **Matrix Inverse**

inverse matrix  is the mathematical "undo" button. Think of a matrix $$A$$ as a function that transforms data (moving a character in a game, encrypting a message, or blurring an image), the inverse $$A^{-1}$$ is the function that reverses that transformation exactly.

&#x20;($$x = A^{-1}b$$)

When you multiply a matrix by its inverse, you get the Identity Matrix.

$$A \cdot A^{-1} = I$$

This method is like basic algebra. If $$ax = b$$, then $$x = b/a$$. In matrices, we multiply by the inverse instead of dividing.

$$A = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}, \quad x = \begin{bmatrix} x \\ y \end{bmatrix}, \quad b = \begin{bmatrix} 5 \\ 11 \end{bmatrix}$$

For a $$2 \times 2$$ matrix $$\begin{bmatrix} a & b \\ c & d \end{bmatrix}$$, the inverse is $$\frac{1}{ad-bc} \begin{bmatrix} d & -b \\ -c & a \end{bmatrix}$$.

Determinant: $$(1 \times 4) - (2 \times 3) = 4 - 6 = \mathbf{-2}$$

Swap and Negate: Swap 1 and 4, make 2 and 3 negative $$\to \begin{bmatrix} 4 & -2 \\ -3 & 1 \end{bmatrix}$$

Multiply by 1/Det: $$A^{-1} = -\frac{1}{2} \begin{bmatrix} 4 & -2 \\ -3 & 1 \end{bmatrix} = \begin{bmatrix} -2 & 1 \\ 1.5 & -0.5 \end{bmatrix}$$

$$\begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} -2 & 1 \\ 1.5 & -0.5 \end{bmatrix} \begin{bmatrix} 5 \\ 11 \end{bmatrix} = \begin{bmatrix} (-2 \times 5) + (1 \times 11) \\ (1.5 \times 5) + (-0.5 \times 11) \end{bmatrix} = \mathbf{\begin{bmatrix} 1 \\ 2 \end{bmatrix}}$$

Solution: $$x = 1, y = 2$$

***

#### **Gaussian Elimination**

This method uses "row operations" to simplify the matrix into a form where we can read the answers.

We combine Matrix $$A$$ and Vector $$b$$ into one:

$$\left[ \begin{array}{cc|c} 1 & 2 & 5 \\ 3 & 4 & 11 \end{array} \right]$$

We want to eliminate the $$3$$ in the second row. We can do this by: Row 2 $$\to$$ Row 2 $$- (3 \times$$ Row 1).

$$(3 - 3 \times 1) = 0$$

$$(4 - 3 \times 2) = -2$$

$$(11 - 3 \times 5) = -4$$

New Matrix:

$$\left[ \begin{array}{cc|c} 1 & 2 & 5 \\ 0 & -2 & -4 \end{array} \right]$$

**Back-Substitution**

Now we turn the rows back into equations

1. Bottom row: $$-2y = -4 \implies \mathbf{y = 2}$$
2. Top row: $$x + 2y = 5$$
3. Substitute y: $$x + 2(2) = 5 \implies x + 4 = 5 \implies \mathbf{x = 1}$$

Solution: $$x = 1, y = 2$$
