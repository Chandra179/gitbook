# Reading

## Reading Order with Specific Chapters

#### Phase 1: Conceptual Foundation

**Goal:** Understand what you're building before writing code.

| # | Resource                               | Chapter / Section                                                                   | Maps to Module             |
| - | -------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| 1 | **Narang – Inside the Black Box**      | All chapters (short book). Focus: Ch.3 Alpha Model, Ch.4 Risk Model, Ch.6 Execution | Entire architecture        |
| 2 | **Fama, Fisher, Jensen & Roll (1969)** | Entire paper (short, \~20 pages)                                                    | Signal Matrix, Backtesting |

_Why first:_ Narang gives you the mental model of a trading system. Fama et al. gives you the historical proof that the event study method works. Together they answer "what are we building and why should it work?"

***

#### Phase 2: Event Study Methodology

**Goal:** Master the exact mathematics your system implements.

| # | Resource             | Chapter / Section                                                                                                              | Maps to Module                                |
| - | -------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| 3 | **MacKinlay (1997)** | Sections 1–5. Core: Section 2 (Event Definition), Section 3 (Market Model & AR calculation), Section 4 (Aggregation & Testing) | Signal Matrix, Backtesting, Graphic Processor |

_Key formulas to extract:_

* Section 3: Abnormal Return = R\_it - (α\_i + β\_i × R\_mt)
* Section 4: CAR\_i = Σ AR\_it over Event Window
* Section 4: Cross-sectional t-test (this becomes your Weight Formula)

***

#### Phase 3: Data Ingestion & Structures

**Goal:** Build the Go pipeline that fetches clean, point-in-time data.

| # | Resource                                      | Chapter / Section                                                                                     | Maps to Module                    |
| - | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| 4 | **McKinney – Python for Data Analysis**       | Ch.4 (NumPy arrays), Ch.5 (pandas basics), Ch.10 (Data Aggregation), Ch.11 (Time Series)              | Ingestion (Go), Graphic Processor |
| 5 | **López de Prado – Advances in Financial ML** | Ch.2: Financial Data Structures (all sections). Core: 2.3 Tick Bars, 2.4 Volume Bars, 2.5 Dollar Bars | Ingestion (Go)                    |

_Why together:_ McKinney teaches you how to manipulate time series arrays (translate the patterns to Go). López de Prado teaches you _what_ to build—information-driven bars, not clock-driven bars. Your Go ingestion layer stores data in formats the Rust engine can consume efficiently.

***

#### Phase 4: Signal Matrix Construction

**Goal:** Build the event-to-weight lookup table.

| # | Resource                                        | Chapter / Section                                                                                                   | Maps to Module |
| - | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------- |
| 6 | **Jansen – Applied ML for Algorithmic Trading** | Ch.2 (Market Data), Ch.3 (Alternative Data), Ch.4 (Alpha Factor Research), Ch.8 (Text Data for Trading)             | Signal Matrix  |
| 7 | **López de Prado – Advances in Financial ML**   | Ch.3: Labeling (all sections). Core: 3.2 Fixed-Horizon Method, 3.3 Triple-Barrier Method, 3.4 Trend-Scanning Labels | Signal Matrix  |

_Why together:_ Jansen teaches you factor engineering from alternative data (news text). López de Prado teaches you how to label those events based on forward price movement. Your Step 1 (Event Identification) comes from Jansen; Steps 2–4 (Windowing, Average Move, Consistency) implement López de Prado's labeling logic.

***

#### Phase 5: Graphic Processor (Rust)

**Goal:** Compute percentage-change arrays around each T-0 event.

| # | Resource                                                | Chapter / Section                                                     | Maps to Module    |
| - | ------------------------------------------------------- | --------------------------------------------------------------------- | ----------------- |
| 8 | **MacKinlay (1997)** – Revisit                          | Section 3 (Market Model estimation), Section 5 (Issues & refinements) | Graphic Processor |
| 9 | **López de Prado – Advances in Financial ML** – Revisit | Ch.2: sections on sampling frequency and bar construction             | Graphic Processor |

_Specific implementation guidance:_

* Use MacKinlay's market model to compute expected returns during your Estimation Window (30–90 days before T-0)
* Subtract expected from actual during the Event Window (1–24 hours after T-0) to get Abnormal Return arrays
* Store each window as a fixed-length `Vec<f64>` in Rust, indexed by event type

***

#### Phase 6: Backtesting Engine (Rust)

**Goal:** Validate the Weight Formula and test for statistical significance.

| #  | Resource                                                      | Chapter / Section                                                                                                     | Maps to Module              |
| -- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 10 | **Chan – Quantitative Trading**                               | Ch.3 (Backtesting), Ch.4 (Transaction Costs), Ch.5 (Execution)                                                        | Backtesting                 |
| 11 | **ISLR – Introduction to Statistical Learning**               | Ch.2 (Statistical Learning), Ch.3 (Linear Regression), Ch.5 (Resampling Methods: 5.1 Cross-Validation, 5.2 Bootstrap) | Backtesting, Weight Formula |
| 12 | **Jeng – Contemporaneous Event Studies in Corporate Finance** | Ch.1 (Introduction), Ch.2 (Normal Return Models), Ch.3 (Event Study Tests), Ch.5 (Robustness Checks)                  | Backtesting, Weight Formula |

_Why in this order:_ Chan gives you the practitioner's reality check (survivorship bias kills event studies). ISLR gives you the statistical tools to validate your model (bootstrap your 100 events to see if your weight is robust). Jeng modernizes MacKinlay's tests—handling heteroskedasticity and cross-correlation that MacKinlay's simpler t-tests miss.

***

#### Phase 7: Shape Matching (Rust)

**Goal:** Find historical analogs using distance metrics.

| #  | Resource                                                                                              | Chapter / Section                                                                              | Maps to Module |
| -- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------- |
| 13 | **ISLR – Introduction to Statistical Learning** – Revisit                                             | Ch.10 (Unsupervised Learning): sections on distance metrics, clustering                        | Shape Matching |
| 14 | **Sakoe & Chiba (1978)** – _"Dynamic Programming Algorithm Optimization for Spoken Word Recognition"_ | Entire paper. Focus: Section 2 (Time-Normalization), Section 3 (Dynamic Programming Algorithm) | Shape Matching |
| 15 | **Berndt & Clifford (1994)** – _"Using Dynamic Time Warping to Find Patterns in Time Series"_         | Sections on DTW for financial/economic time series                                             | Shape Matching |

_Implementation path:_

* Start with Cosine Similarity (implemented in one afternoon: dot product over product of magnitudes)
* Test it on your historical window library
* If variable-speed reactions are a problem (they will be), implement DTW using the Sakoe & Chiba recurrence relation
* DTW constraint: use a Sakoe-Chiba band (10–20% of window length) to prevent pathological warpings

***

#### Quick Reference: Module → Chapter Map

| Module                       | Primary Chapters                                                           |
| ---------------------------- | -------------------------------------------------------------------------- |
| **Conceptual Map**           | Narang: All                                                                |
| **Ingestion (Go)**           | McKinney: 4, 5, 10, 11 • López de Prado: 2                                 |
| **Signal Matrix (Go/Rust)**  | Jansen: 2, 3, 4, 8 • López de Prado: 3 • MacKinlay: 2–4 • Fama et al.: All |
| **Graphic Processor (Rust)** | MacKinlay: 3, 5 • López de Prado: 2 • McKinney: 11                         |
| **Backtesting (Rust)**       | Chan: 3, 4, 5 • ISLR: 2, 3, 5 • Jeng: 1, 2, 3, 5                           |
| **Shape Matching (Rust)**    | ISLR: 10 • Sakoe & Chiba: 2, 3 • Berndt & Clifford: DTW sections           |

***

#### Suggested Pace

* **Weeks 1–2:** Phases 1–2 (Narang, Fama, MacKinlay)
* **Weeks 3–4:** Phase 3 (McKinney, López de Prado Ch.2) + start Go ingestion prototype
* **Weeks 5–6:** Phase 4 (Jansen, López de Prado Ch.3) + build Signal Matrix in Rust
* **Weeks 7–8:** Phase 5 (Graphic Processor) + Phase 6 start (Chan)
* **Weeks 9–10:** Phase 6 complete (ISLR, Jeng) + harden backtesting
* **Weeks 11–12:** Phase 7 (Shape Matching) + integration testing

<br>
