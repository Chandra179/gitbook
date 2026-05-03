# Event-Driven Market Simulation

## High Level

abc

## Ingestion (Go)

**Focus:** High-concurrency fetching of clean CSV/JSON data for news and price history. Point-in-time data to avoid look-ahead bias. SHA-256 deduplication

**Goal**: Fetch news and price data, deduplicate, and store them point‑in‑time.

***

## Signal Matrix (Go/Rust)

**Focus:** A lookup table mapping Events to Weights derived from historical truth. Supervised labeling of 100+ historical timestamps, price windowing, average percent move calculation, and consistency checks with standard deviation.

***

## Backtesting Algorithm (Rust)

**Focus:** High-performance math engine to find abnormal returns and match shapes. T-0 → Event Time, Estimation Window → 30–90 days, Event Window → 1–24 hours. Weight Formula requiring both strong magnitude and consistency across 100 historical samples.

***

## Graphic Processor (Rust)

**What it does:** Transforms raw price data into arrays of percentage changes (price windows) around each T-0. These arrays become the input to both your Weight Formula and Shape Matching.

***

## Shape Matching (Rust)

**What it does:** Compares the current live market trajectory against your library of historical event windows to find the closest match. This is your "History Repeats" engine in code.
