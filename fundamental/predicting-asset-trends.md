# Predicting Asset Trends

## **Prerequisites**

Before implementing, study these specific chapters to align your code with industry standards:

* Academic Papers (The Foundations):
  * MacKinlay (1997): _"Event Studies in Economics and Finance"_ — The primary "blueprint" for your T-0, Estimation, and Event Window logic.
  * Fama et al. (1969): _"The Adjustment of Stock Prices to New Information"_ — Proves the historical validity of your "History Repeats" theory.
* Books (The Implementation Guides):
  * _Advances in Financial Machine Learning_ (López de Prado): Focus on Chapter 2 (Financial Data Structures) and Chapter 3 (Labeling). This will teach you how to "label" your news signals correctly.
  * _Quantitative Trading_ (Ernie Chan): Best for practical backtesting pitfalls.
* Concepts to Master:
  * Abnormal Returns (AR): The math of isolating a statement's impact from general market noise.
  * Dynamic Time Warping (DTW): For the "Shape Matching" algorithm in Rust.

***

## Ingestion (Go)

Focus: High-concurrency fetching of clean CSV/JSON data for news and price history.

* Logic: Use Go's `net/http` and `goroutines` to scrape/fetch from APIs (e.g., Alpha Vantage, Yahoo Finance, or Reddit).
* Audit Checklist:
  * Check rate limits (Free tiers often limit to 5 calls/minute or 500/day).
  * Implement SHA-256 deduplication (from your previous architecture) to ensure news signals aren't double-counted.
  * Tip: Look for "point-in-time" data to avoid "look-ahead bias" in your backtests.

***

## Signal Matrix (Go/Rust)

Focus: A lookup table mapping Events to Weights derived from historical truth (Supervised Labeling).

* Step 1: Event Identification (Labeling): Gather 100+ historical timestamps for a specific event type (e.g., "Fed Rate Hike").
* Step 2: Price Windowing (Observation): Pull price graphics for the windows surrounding those timestamps.
* Step 3: Average Percent Move (Calculation): Calculate the mean reaction.
* Step 4: Consistency Check ($$ $\sigma$ $$): Use Standard Deviation to determine if the move is reliable or just noise.
* Open Source Boost:
  * SenticNet: Use for pre-calculated semantic weights without LLM overhead.
  * Meta Prophet: Use to strip out "Seasonality" (e.g., markets usually dip on certain days) so your signal is pure.

***

## Backtesting Algorithm (Rust)

Focus: High-performance math engine to find "Abnormal Returns" and match shapes.

* T-0 (Event Time): The timestamp the statement was released.
* Estimation Window: 30–90 days of price data _before_ T-0 to establish a baseline.
* Event Window: 1–24 hours of price data _after_ T-0 to capture the reaction.
*   The Weight Formula:

    $$Weight = \frac{\text{Average Abnormal Return}}{\text{Volatility (Standard Deviation)}}$$

    * _Logic:_ High weights (close to 1 or -1) only occur if the market reaction is both strong and consistent across your 100 historical samples.

***

## Graphic Processor (Rust)

Implement the math to calculate percentage changes and store "pricewindows" as arrays.

## Shape Matching (Rust)

Use a basic Euclidean distance or Cosine similarity algorithm to find historical repeats
