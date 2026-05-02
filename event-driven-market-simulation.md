# Event-Driven Market Simulation

## Ingestion (Go)

**Focus:** High-concurrency fetching of clean CSV/JSON data for news and price history. Point-in-time data to avoid look-ahead bias. SHA-256 deduplication.

* **Python for Data Analysis** – Wes McKinney\
  &#xNAN;_&#x43;hapters on data loading, cleaning, and time series._ While you're coding in Go, the concepts of resampling, handling timestamps, and deduplicating messy financial data are language-agnostic. Master these patterns before building your Go pipelines.
* **Advances in Financial Machine Learning** – Marcos López de Prado\
  &#xNAN;_&#x43;hapter 2: Financial Data Structures._ This chapter teaches you how to build tick bars, volume bars, and dollar bars from raw data. While your Go layer fetches news and price raw data, understanding these structures ensures you store data in formats that are actually useful downstream for the Signal Matrix and Backtesting engine.

#### Concepts to Reference

* **Point-in-Time Data Architecture** – Not a single paper, but a concept you'll find discussed in Chan (_Quantitative Trading_) and Jansen (_Applied Machine Learning for Algorithmic Trading_). They explain why using "as-of" timestamps prevents look-ahead bias from leaking future information into your backtests. Your Go ingestion layer must timestamp every news item and price tick with the moment it was _available_, not the moment it occurred.
* **SHA-256 Deduplication** – Standard cryptographic hashing (no single book). You already have this architecture; document it clearly here as your duplicate-detection method for news signals.

***

## Signal Matrix (Go/Rust)

**Focus:** A lookup table mapping Events to Weights derived from historical truth. Supervised labeling of 100+ historical timestamps, price windowing, average percent move calculation, and consistency checks with standard deviation.

#### Books

* **Applied Machine Learning for Algorithmic Trading** – Stefan Jansen\
  &#xNAN;_&#x43;hapters on alternative data and supervised learning for financial signals._ Jansen directly covers how to turn raw news into labeled features. He walks through factor engineering from text data and explains the exact type of lookup table you're building—mapping an event category to a predictive weight.
* **Advances in Financial Machine Learning** – Marcos López de Prado\
  &#xNAN;_&#x43;hapter 3: Labeling._ The triple-barrier method is the industry standard for labeling events based on future price movement. Your Step 2 (Price Windowing) and Step 3 (Average Percent Move) are essentially a simplified version of this. Read it to understand what you're doing and why.
* **Contemporaneous Event Studies in Corporate Finance** – Jau-Lian Jeng (2020)\
  &#xNAN;_&#x43;hapters on event identification and normal return models._ Jeng critiques traditional event studies and provides modern alternatives for assessing whether a reaction is "normal" or "abnormal." Your Step 4 consistency check maps directly to his robustness testing.

#### Papers

* **Fama, Fisher, Jensen & Roll (1969): "The Adjustment of Stock Prices to New Information"**\
  &#xNAN;_&#x54;he origin paper._ This established that stock prices react to new public information in a repeatable, measurable way. It's the academic justification for your "History Repeats" assumption—the entire premise that you can map an event type to a consistent price reaction weight.
* **MacKinlay (1997): "Event Studies in Economics and Finance"**\
  &#xNAN;_&#x54;he methodology blueprint._ Sections on event definition, sample selection, and cross-sectional aggregation. Your Steps 1–4 (Event Identification, Windowing, Average Percent Move, Consistency Check) are a direct implementation of MacKinlay's framework. The paper gives you the formulas to convert raw average moves into statistical test statistics that tell you whether the signal is noise or alpha.

#### Concepts to Reference

* **SenticNet** – Pre-computed semantic weights. Use this for initial news sentiment scoring without LLM overhead. Document the version you're using here.
* **Meta Prophet** – Facebook's time-series library for stripping out seasonality. Use it to remove day-of-week, time-of-day, and monthly effects from your price reactions before calculating the pure event-driven signal weight.

***

## Backtesting Algorithm (Rust)

**Focus:** High-performance math engine to find abnormal returns and match shapes. T-0 → Event Time, Estimation Window → 30–90 days, Event Window → 1–24 hours. Weight Formula requiring both strong magnitude and consistency across 100 historical samples.

#### Books

* **Quantitative Trading** – Ernie Chan\
  &#xNAN;_&#x43;hapters on backtesting and transaction costs._ Chan provides the reality check. Before you finalize your Rust engine, his discussions on survivorship bias, look-ahead bias, and data-snooping will help you validate that your backtest results are real, not artifacts. Your Estimation Window logic must follow his discipline.
* **Contemporaneous Event Studies in Corporate Finance** – Jau-Lian Jeng (2020)\
  &#xNAN;_&#x43;hapters on estimation windows and abnormal return testing._ Jeng provides robust statistical tests that replace the classic MacKinlay approach where assumptions break. Your 30–90 day estimation window choice and the significance thresholds for your weight formula should be informed by his critiques and alternatives.
* **Introduction to Statistical Learning (ISLR)** – James, Witten, Hastie, Tibshirani\
  &#xNAN;_&#x43;hapters 2, 3, 5, and Resampling Methods._ Your Weight Formula is effectively a statistical test across 100 events. ISLR teaches you resampling, cross-validation, and the bias-variance tradeoff—without this foundation, you'll overfit your weight matrix to historical noise and it will fail out-of-sample.

#### Papers

* **MacKinlay (1997): "Event Studies in Economics and Finance"**\
  &#xNAN;_&#x53;ections on the Market Model, CAR calculation, and significance testing._ This is where your T-0, Estimation Window, and Event Window logic comes from. MacKinlay provides the exact formulas:
  * Abnormal Return (AR) = Actual Return - Expected Return
  * Cumulative Abnormal Return (CAR) = Σ AR over the Event Window
  * Cross-sectional t-test to determine if the average CAR is statistically significant\
    Your Weight Formula is essentially a disciplined implementation of MacKinlay's test statistic: high weight = large, consistent CAR with low cross-sectional variance.

#### Concepts to Reference

* **Abnormal Returns (AR)** – The core math for isolating a news event's impact from the market baseline. Derivation from MacKinlay; implement in Rust with the market model regression.
* **Dynamic Time Warping (DTW)** – For your shape-matching algorithm. This is not in any of the books above. You'll need a separate paper or reference:
  * _Search for:_ "Dynamic Time Warping" – Berndt & Clifford (1994) or the classic Sakoe & Chiba (1978). DTW measures similarity between two price trajectories (e.g., the ideal post-Fed-hike pattern vs. the current observed pattern), even if they vary in speed. This is your shape-matching core in Rust.

***

## Graphic Processor (Rust)

**What it does:** Transforms raw price data into arrays of percentage changes (price windows) around each T-0. These arrays become the input to both your Weight Formula and Shape Matching.

#### Why it's essential

Without this module, your Signal Matrix has no numerical representation of "what happened after a Fed Rate Hike." MacKinlay's event study tells you to compute abnormal returns; this module executes it. It must:

* Align price data to irregular event timestamps
* Normalize by percentage change (not absolute price) so events across different assets and time periods are comparable
* Store windows as fixed-length arrays your Rust backtesting engine can iterate over efficiently

#### Books & Papers that directly support it

* **Python for Data Analysis** – Wes McKinney\
  &#xNAN;_&#x54;ime series alignment and vectorized percentage change operations._ The concepts (resampling to event time, shifting indices to T-0) translate directly to Rust's `ndarray` or custom vector operations.
* **MacKinlay (1997)**\
  &#xNAN;_&#x41;bnormal Return formula._ Your percentage change arrays are the raw material. MacKinlay gives you the subtraction: AR = Actual % Change - Expected % Change (from the estimation window baseline). The Graphic Processor computes the left side; the Backtesting Engine subtracts the right.
* **Advances in Financial Machine Learning** – López de Prado\
  &#xNAN;_&#x43;hapter 2 (Financial Data Structures)._ Defines how to build bars that are information-driven (e.g., volume bars) rather than time-driven (e.g., 1-minute bars). This matters because your T-0 events don't happen on a clock schedule; your window arrays need a consistent number of observations, not arbitrary clock ticks.

#### No specialized Rust book required

This is straightforward numerical computation: built-in Rust iterators, `ndarray` crate for multi-dimensional arrays, and `statrs` for basic statistics. The finance books give you the _what and why_; Rust's performance gives you the _how fast_.

***

## Shape Matching (Rust)

**What it does:** Compares the current live market trajectory against your library of historical event windows to find the closest match. This is your "History Repeats" engine in code.

#### Why it's essential

Your backtesting weight formula tells you _on average_ what a Fed hike does. Shape matching tells you _which specific historical event_ the current one resembles most. That enables:

* Real-time signal refinement (if today's trajectory matches a strong positive outlier in your 100-event library)
* Regime-change detection (if no historical shape matches, the event may be playing out differently this time)
* Confidence weighting (close match = high confidence; no match = lower position size)

#### Books & Papers that directly support it

* **Dynamic Time Warping (DTW) reference**\
  &#xNAN;_&#x45;ssential paper:_ Berndt & Clifford (1994) or Sakoe & Chiba (1978). DTW stretches and compresses the time axis to match shapes even when reactions unfold at different speeds. A Fed hike in 2022 might take 3 hours to fully price in; the same event in 2018 might have taken 90 minutes. DTW aligns the trajectories before measuring distance.\
  &#xNAN;_&#x4C;ighter resource:_ Search for the DTW chapter in _Algorithms for Time Series Data_ or the `dtaidistance` library's documentation for worked examples.
* **Introduction to Statistical Learning (ISLR)** – James, Witten, Hastie, Tibshirani\
  &#xNAN;_&#x43;hapters on distance metrics and clustering._ Euclidean distance and cosine similarity are covered in unsupervised learning sections. ISLR explains when each metric is appropriate and the curse of dimensionality (your price windows could have 24+ data points). Cosine similarity is often better than Euclidean for price windows because you care about the _shape_, not the absolute magnitude of the move.
* **Applied Machine Learning for Algorithmic Trading** – Stefan Jansen\
  &#xNAN;_&#x43;hapter on alternative data and pattern recognition._ Jansen covers how to convert raw market data into features for similarity search, including normalization concerns and the importance of aligning data before comparison.

#### Concept Considerations

* **Euclidean Distance**: Simple to implement in Rust, sensitive to magnitude. If one event moved +2% and another +0.5% but both traced the same _shape_, Euclidean says they're far apart. Cosine similarity would recognize them as similar.
* **Cosine Similarity**: More robust for shape comparison because it measures the angle between two vectors regardless of length. Implementing it in Rust is a dot product over the magnitude product.
* **DTW (Recommended Evolution)** : Start with Euclidean/Cosine for speed, then plan to add DTW. It's more computationally expensive but handles the varying-speed problem that Euclidean cannot. Your Rust implementation can start simple and add DTW as an optional algorithm later.

***

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
