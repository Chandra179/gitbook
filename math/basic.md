# Basic

### Diameter, Circumference, Pi

* Every circle, no matter how big or small, has a special property. If you divide the distance around the circle (circumference) by the distance across the circle (diameter), you always get the same number, which is π 3.14.

$$
\pi = \frac{\text{Circumference}}{\text{Diameter}}
$$

* **Radius**: distance from center to edge
* **Diameter**: Distance straight across the circle through the center.

<p align="center"><span class="math">D = 2r</span></p>

* **Circumference**: distance around the circle (using radius & diameter)

<p align="center"><span class="math">C = 2 \pi r</span></p>

<p align="center"><span class="math">C = \pi D</span></p>

***

### Law of Exponents

$$
a^m \cdot a^n = a^{m+n}
$$

$$
2^3 \cdot 2^4 = 2^{3+4} = 2^7 = 128
$$

***

$$
\frac{a^m}{a^n} = a^{m-n}
$$

$$
\frac{2^5}{2^2} = 2^{5-2} = 2^3 = 8
$$

***

$$
(a^m)^n = a^{m \cdot n}
$$

$$
(2^3)^4 = 2^{3 \cdot 4} = 2^{12}
$$

***

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

### Amoeba Propagation

An amoeba doubles every 3 minutes. A container is full in 60 minutes starting with 1 amoeba.

If the number of amoebas doubles every 3 minutes:

$$
N(t) = N_0 \cdot 2^{t/3}
$$

* (N\_0) = initial number of amoebas
* (t) = time in minutes
* (N(t)) = number of amoebas at time (t)

Starting with 2 amoebas instead of 1, the growth formula becomes:

$$
2 \cdot 2^{t/3} = 2^1 \cdot 2^{t/3} = 2^{t/3 + 1}
$$

$$
2 \cdot 2^{t/3} = 2^{20}
$$

* (2) = starting amoebas
* (t/3) = number of doublings in (t) minutes
* (2^{20}) = total amoebas to fill the container (20 doublings for 1 amoeba in 60 minutes)

Compare exponents:

$$
t/3 + 1 = 20
$$

$$
t/3 = 19
$$

$$
t = 57 \text{ minutes}
$$

**Conclusion:** Starting with 2 amoebas, the container is full in **57 minutes**, 3 minutes faster than starting with 1 amoeba.

### Wrapping the World

A ribbon is tied tightly around the Earth at the equator. How much more ribbon would you need if you raised it 1 ft above the surface everywhere?

$$
C = 2 \pi r
$$

Original ribbon

$$
C_\text{original} = 2 \pi r
$$

Ribbon raised 1 ft

$$
C_\text{new} = 2 \pi (r + 1)
$$

Extra ribbon needed

$$
\Delta C = C_\text{new} - C_\text{original} = 2 \pi (r + 1) - 2 \pi r = 2 \pi
$$

#### Answer

$$[ \Delta C = 2 \pi \text{ ft} \approx 6.283 \text{ ft} ]$$

**Remark:** The extra length does **not depend on the size of the Earth**.

***

### Ending Up Where You Started

A woman starts at a point (P) on the Earth's surface and walks:

1. 1 mile south
2. 1 mile east
3. 1 mile north

She ends up **back at her starting point** (P).

* Start **just a tiny distance north of the South Pole**, on a small circle of latitude.
* Walk 1 mile south → reach the small circle near the South Pole.
* Walk 1 mile east → the circle is so small that walking 1 mile completes **a full loop**, returning to the same longitude.
* Walk 1 mile north → back to the starting point.
