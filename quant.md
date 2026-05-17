# Quant

### Core Terminology & Definitions

* **Quantitative / Systematic / Black‑Box Trading**\
  These terms refer to rule‑based, automated trading approaches that use mathematical models.
* **Alpha vs. Beta Strategies**
  * **Alpha strategies:** Attempt to generate returns by skillfully timing the selection and/or sizing of various portfolio holdings.
  * **Beta strategies:** Mimic or slightly improve on the performance of an index (e.g., the S\&P 500).\
    The discussion here focuses on **alpha‑oriented strategies** and largely ignores quantitative index traders or other beta implementations.
* **Statistical Arbitrage**\
  A classic statistical arbitrage example is a **pairs trade**.
* **LTCM (Long‑Term Capital Management)**\
  The history of LTCM is a lesson in the dangers of **mismeasuring risk**.
* **Running a Quant Shop**\
  A properly run quant shop simply tends to let the models run **without unnecessary, arbitrary interference**.

***

### Trading System Architecture

The trading system has **three modules**—an **alpha model**, a **risk model**, and a **transaction cost model**—which feed into a **portfolio construction model**, which in turn interacts with the **execution model**.

***

### Alpha Models: Six Classes of Phenomena

Most theory‑driven quant strategies fall into one of six categories, which are the same types that discretionary traders use to seek alpha:

| Category            | Data Type     |
| ------------------- | ------------- |
| Trend               | Price‑related |
| Mean Reversion      | Price‑related |
| Technical Sentiment | Price‑related |
| Value / Yield       | Fundamental   |
| Growth              | Fundamental   |
| Quality             | Fundamental   |

Understanding the **inputs to a strategy** is extremely important to understanding the strategy itself.

***

### Strategies Utilizing Price‑Related Data

Price‑related data come mostly from instrument prices and exchange‑provided information (e.g., trading volume).

#### Trend Following (Momentum)

* **Core Concept:** Markets sometimes move consistently in one direction long enough to identify and ride the trend. Trends exist because of gradual consensus‑building (or the “greater fools theory”).
* **Economic Rationale:** Uncertainty and conflicting information cause prices to shift slowly from one equilibrium to another; early adopters trade on a correct thesis, and the migration is the trend follower’s opportunity.
* **Key Risk:** **Whipsawing** – rapid up‑and‑down price movements that cause repeated losses. Trend followers filter for “significant” moves to avoid this.
* **Common Implementation:** Moving average crossover (e.g., when a 60‑day average crosses below a 200‑day average, sell short; when above, buy long). _Example: S\&P 500 trend in 2007–2008._

#### Mean Reversion

* **Core Concept:** Bet that prices will move in the opposite direction of the recent trend, returning to an equilibrium level.
* **Theoretical Rationale:**
  * Short‑term imbalances between buyers and sellers (liquidity needs, index tracking) cause overbought/oversold conditions.
  * Market participants aren’t aware of each other’s actions, leading to price overshooting.
* **Key Characteristics:**
  * Mean reversion traders provide liquidity and bear **adverse selection risk**.
  * When discretionary traders use this approach, they are often called **contrarians**.
  * Trend and mean reversion can coexist: long‑term trends with short‑term oscillations around them.
* **Famous Example – Statistical Arbitrage (Stat Arb):**
  * Bets on convergence of similar stocks whose prices have diverged.
  * Pioneered by Nunzio Tartaglia’s team at Morgan Stanley (including Gerry Bamberger and David Shaw, influenced by Ed Thorp).
  * Focus shifted from “is a stock cheap/expensive?” to “is it over/undervalued relative to another stock?”

#### Technical Sentiment

* **Core Concept:** Track investor sentiment expressed through price, volume, and volatility behaviors as a forecast of future returns. No single, clear economic rationale exists—practitioners interpret sentiment in conflicting ways.
* **Three Conflicting Views:**
  1. **High positive sentiment → Instrument is overbought and ready to decline** (contrarian).
  2. **High positive sentiment → Instrument has support to move higher** (trend‑following).
  3. **Sentiment as a conditioning variable → Only act on trends if accompanied by significant volume** (most common use).
* **Examples of Standalone Sentiment Strategies:**
  * **Options Market Sentiment:**
    * Put/call volume ratio: higher put volume → bearish; lower put volume → bullish.
    * Put vs. call implied volatility: divergence from the historical ratio signals sentiment shifts.
    * Other proxies: implied volatility or credit default swaps (CDS).
  * **Volume‑Based Sentiment:**
    * **Short‑term (high‑frequency):** Limit order book shape (bid/offer sizes away from mid‑market, aggregate bid vs. offer size).
    * **Longer‑term:** Trading volume, turnover (trading vs. float), or open interest.
    * **Common research finding:** Contrarian—high‑volume/high‑turnover stocks expected to underperform; low‑volume stocks outperform.

***

### Strategies Utilizing Fundamental Data

Most strategies using fundamental data in their alpha models fall into one of three groups: **Value/Yield**, **Growth**, and **Quality**.

#### Value / Yield

* **Concept:** Buy cheap instruments (high yield relative to price). Markets tend to overestimate risk in risky assets, so owning higher‑yielding assets can pay off as prices revert to fair value.
* **Quant Approach:** Invert standard ratios (e.g., E/P earnings yield instead of P/E) to avoid issues with negative or zero earnings.
* **Carry Trade:** Buy undervalued, sell overvalued; profit from the yield spread (carry) as a margin of safety. Common in currencies (buy high‑yield, sell low‑yield) and bonds.
* **Equities:** Relative value strategies (quant long/short) rank stocks by metrics like book‑to‑price, buying high‑ranked and shorting low‑ranked.
* **Commodities:** Roll yield (backwardation = positive yield; contango = negative yield).

#### Growth

* **Concept:** Buy assets experiencing rapid economic/earnings growth, sell those with slow or negative growth—regardless of price or valuation.
* **Justification:** Growth tends to trend; strong growers gain market share.
* **Macro example:** Long currencies of countries with strong growth (future higher interest rates).
* **Equity example:** QLS (quant long/short) uses growth signals; a key variant focuses on analysts’ earnings estimate revisions (a sentiment‑based strategy closely related to growth).

#### Quality

* **Concept:** All else equal, own high‑quality instruments, sell low‑quality ones. Protects in stressful “flight‑to‑quality” environments.
* **Five categories of quality signals:**
  1. **Leverage** – Long less‑levered, short more‑levered (e.g., debt‑to‑equity).
  2. **Revenue diversity** – Prefer companies with diverse, stable revenue sources (less volatile earnings).
  3. **Management quality** – Harder to quantify; uses signals like changes in discretionary accruals.
  4. **Fraud risk** – Long low‑fraud risk; uses earnings quality signals (free cash flow vs. reported EPS).
  5. **Quality sentiment** – Forward‑looking views on the above; CDS markets provide regular data.
* **Performance:** Quality excels during crises (e.g., 2008 banking stocks, early‑2000s accounting scandals) but performs poorly in euphoric markets.
