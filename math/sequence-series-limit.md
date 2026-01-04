# Sequence, Series, Limit

### Arithmetic

An arithmetic sequence is built on constant change. It is the mathematical version of a steady heartbeat or a clock ticking.

**The Anatomy of the Sequence**

Every term is defined by its position ($$n$$).

* Recursive Formula: $$a_n = a_{n-1} + d$$ (The current term is the last one plus the difference).
* Explicit Formula: $$a_n = a_1 + (n-1)d$$ (Find any term without knowing the one before it).

**The Arithmetic Series (Summation)**

The sum of an arithmetic sequence is called the Partial Sum.

* Formula: $$S_n = \frac{n(a_1 + a_n)}{2}$$
* The "Gauss" Insight: If you list the numbers $$1$$ to $$100$$ and add them in pairs ($$1+100$$, $$2+99$$, $$3+9$$), every pair equals $$101$$. Since there are $$50$$ pairs ($$100/2$$), the sum is $$50 \times 101$$.

***

### Geometric

A geometric sequence is built on proportional change. This is how things "scale"—like populations, computer virus spreads, or interest rates.

**The Anatomy of the Sequence**

* Explicit Formula: $$a_n = a_1 \cdot r^{n-1}$$
* The "Growth" Factor ($$r$$):
  * If $$|r| > 1$$: The sequence diverges (explodes to infinity).
  * If $$|r| < 1$$: The sequence converges (shrinks toward zero).
  * If $$r$$ is negative: The sequence oscillates (jumps between positive and negative).

**The Geometric Series**

The sum of a geometric progression is more complex because the numbers grow so fast.

* Finite Sum: $$S_n = a_1 \left( \frac{1 - r^n}{1 - r} \right)$$
* Infinite Sum ($$|r| < 1$$): $$S_\infty = \frac{a_1}{1 - r}$$
