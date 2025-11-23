# Basic

## Fraction

$$
\frac{\text{numerator}}{\text{denominator}}
$$

* Denominator (bottom number): tells how many equal pieces the whole is divided into.
* Numerator (top number): tells how many pieces you have.

### Distance, Time, and Speed Problem

An old car has to travel a 2-mile route, uphill and downhill. Because it is so old, the car can climb the first mile (the ascent) no faster than an average speed of 15 mi/h. How fast does the car have to travel the second mile (on the descent) to achieve an average speed of 30 mi/h for the trip?

Average speed is defined as:

$$
V_\text{avg} = \frac{\text{total distance}}{\text{total time}}
$$

Total distance:

$$
D = d_1 + d_2 = 1 + 1 = 2 \text{ miles}
$$

Total time:

$$
t_\text{total} = t_1 + t_2 = \frac{d_1}{v_1} + \frac{d_2}{v_2} = \frac{1}{15} + \frac{1}{v_2}
$$

$$
30 = \frac{2}{\frac{1}{15} + \frac{1}{v_2}}
$$

$$
\frac{1}{15} + \frac{1}{v_2} = \frac{2}{30} = \frac{1}{15}
$$

$$
v_2 = \frac{1}{0} \implies \text{undefined (infinite speed)}
$$

**Conclusion:** It is impossible for the car to achieve an average speed of 30 mi/h for the 2-mile trip because it is too slow uphill. To reach the average, the car would need to travel infinitely fast downhill.

### Comparing Discounts

Which price is better for the buyer: a **40% discount** or **two successive discounts of 20%**?

**Single 40% discount**

$$
\text{Price after 40% discount} = P - 0.40P = 0.60P
$$

***

**Two successive 20% discounts**

$$
P_1 = P - 0.20P = 0.80P
$$

$$
P_2 = P_1 - 0.20P_1 = 0.80 \times 0.80 P = 0.64P
$$

$$
0.60P < 0.64P
$$

**Conclusion:** The **single 40% discount** is better for the buyer

Two successive discounts **multiply the remaining price**, they do **not** add up directly:

$$
\text{Total discount} = 1 - (0.8 \times 0.8) = 1 - 0.64 = 0.36 = 36\%
$$

Notice **36% < 40%**, so successive discounts give a smaller total discount than one 40% discount.

### Cutting up a Wire

A piece of wire is bent such that one cut produces 4 pieces and two parallel cuts produce 7 pieces.

| Cuts ((n)) | Pieces |
| ---------- | ------ |
| 0          | 1      |
| 1          | 4      |
| 2          | 7      |

The number of pieces produced by (n) parallel cuts is given by the formula:

$$
\text{Pieces} = 3n + 1
$$

* n=0n = 0n=0 → 3(0)+1=3(0) + 1 = 3(0)+1=1 ✅
* n=1n = 1n=1 → 3(1)+1=3(1) + 1 = 3(1)+1=4 ✅
* n=2n = 2n=2 → 3(2)+1=3(2) + 1 = 3(2)+1=7 ✅

For example, 142 parallel cuts produce:

$$
\text{Pieces} = 3 \cdot 142 + 1 = 427
$$
