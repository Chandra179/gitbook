# Quant

<figure><img src=".gitbook/assets/image.png" alt=""><figcaption></figcaption></figure>

quantitative trading,\
systematic trading, or black box trading



alpha‐oriented strategies and largely ignore quantitative index traders or\
other implementations of beta strategies



Alpha strategies attempt to generate returns by skillfully timing the selection and/or sizing of various portfolio holdings; beta strategies mimic or slightly improve on the performance\
of an index, such as the S\&P 500.



statistical arbitrage, and\
a classic statistical arbitrage example is a pairs trade.



history of LTCM is a lesson in the\
dangers of mismeasuring risk.



a properly\
run quant shop simply tends to let the models run without unnecessary,\
arbitrary interference



The trading system has three modules—an alpha model, a risk model,\
and a transaction cost model—which feed into a portfolio construction\
model, which in turn interacts with the execution model.



The trend follower determines when to buy and sell various instruments, as\
does the value trader. Each of these is a type of alpha. In the first case, alpha is generated from the skill in identifying trends, which allows the trend\
follower to know when it is good to be long or short a given instrument.



In fact—and in defiance of both the presumed need for secrecy and the\
claims that what quants do cannot be understood by those without doctorate degrees—most of what theory‐driven quants do can be relatively easily\
fit into one of six classes of phenomena: trend, reversion, technical sentiment, value/yield, growth, and quality It is worth noting that the kinds of\
strategies that quants utilize are actually exactly the same as those that can\
be utilized by discretionary traders seeking alpha. These six categories can\
be further understood by examining the data that they use: price‐related\
data and fundamental data. As we will see throughout this book, understanding the inputs to a strategy is extremely important to understanding\
the strategy itself. The first two categories of strategies, trend and mean\
reversion, are based on price‐related data.



understanding the inputs to a strategy is extremely important to understanding\
the strategy itself. The first two categories of strategies, trend and mean\
reversion, are based on price‐related data. Technical sentiment strategies are\
less commonly found, but can be thought of as a third class of price‐based\
strategies. The remaining three strategies, value/yield, growth/sentiment,\
and quality, are based on fundamental and/or fundamental sentiment data.



## Strategies Utilizing Price-Related Data

<figure><img src=".gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

First we will focus on alpha models that utilize price‐related data, which\
are mostly about the prices of various instruments or other information\
that generally comes from an exchange (such as trading volume).



The first is that an established\
trend will continue, and the second is that the trend will reverse. In other\
words, the price can either keep going in the direction it was going already,\
or it can go in the opposite direction. We call the first idea trend following or\
momentum, and we call the second idea counter‐trend or mean reversion. A\
third idea will be explored as well, which we refer to as technical sentiment.

### Trend Following

**Core Concept:** Trend following is a strategy based on the idea that markets sometimes move consistently in one direction long enough to identify and ride the trend. Trends exist due to gradual consensus-building among market participants (or the "greater fools theory," where people buy/sell simply because prices are moving, perpetuating the trend).

**Economic Rationale:** Uncertainty and conflicting information cause prices to shift slowly from one equilibrium to another. Early adopters of a correct thesis trade accordingly, and as more data supports them, the price migrates gradually—this migration is the trend follower's opportunity.

**Key Risks:** The main risk is "whipsawing" (rapid up-and-down price movements), which can cause repeated losses. Trend followers filter for "significant" moves to avoid this.

**Common Implementation:** Moving average crossover (e.g., when a 60-day average crosses below a 200-day average, sell short; when above, buy long). Example: S\&P 500 trend in 2007–2008.

***

### Mean Reversion

**Core Concept:** Mean reversion strategies bet that prices will move in the _opposite_ direction of the recent trend, returning to a "center of gravity" or equilibrium level.

**Theoretical Rationale:**

* Short-term imbalances between buyers and sellers (e.g., due to liquidity needs or index tracking) cause prices to become overbought or oversold.
* Market participants aren't aware of each other's actions, leading to price overshooting as equilibrium is reached.

**Key Characteristics:**

* Mean reversion traders provide liquidity by betting against momentum, but they bear the risk of adverse selection.
* When discretionary traders use this approach, they're typically called _contrarians_.
* Trend and mean reversion can coexist: long-term trends with short-term oscillations around them.

**Famous Example – Statistical Arbitrage (Stat Arb):**

* Bets on convergence of similar stocks whose prices have diverged.
* Pioneered by Nunzio Tartaglia's team at Morgan Stanley, including scientists Gerry Bamberger and David Shaw (and influenced by Ed Thorp).
* Shifted focus from whether a stock is cheap/expensive to whether it's over/undervalued _relative to another stock_.

***

### Technical Sentiment

**Core Concept:** Technical sentiment strategies track investor sentiment expressed through price, volume, and volatility behaviors as a forecast of future returns. Unlike momentum or mean reversion, there's **no clear economic rationale**—practitioners disagree on how to interpret sentiment.

**Three Conflicting Views on Sentiment:**

1. **High positive sentiment** → Instrument is overbought and ready to decline (contrarian)
2. **High positive sentiment** → Instrument has support to move higher (trend-following)
3. **Sentiment as a conditioning variable** → Only act on trends if accompanied by significant volume (most common use)

**Examples of Standalone Sentiment Strategies:**

**1. Options Market Sentiment:**

* **Put/call volume ratio:** Higher put volume than normal suggests bearish sentiment; lower put volume suggests bullish sentiment
* **Put vs. call implied volatility:** Stocks tend to drop quickly and rise slowly, so put volatility is naturally higher than call volatility. Divergences from the historical ratio can signal sentiment shifts
* **Other proxies:** Implied volatility or credit default swaps (CDS)

**2. Volume-Based Sentiment:**

* **Short-term (high-frequency):** Analyze limit order book shape (bid/offer sizes away from mid-market, aggregate bid vs. offer size)
* **Longer-term:** Analyze trading volume, turnover (trading vs. float), or open interest
* **Common approach (most research):** Contrarian—high-volume or high-turnover stocks are expected to underperform; low-volume stocks outperform

***

### Strategies Utilizing Fundamental Data

Most strategies utilizing fundamental data in their alpha models can be\
easily classified into one of three groups: value/yield, growth, or quality.

| Category        | Core Idea             | What You Buy                                                          | What You Sell                                                             |
| --------------- | --------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Value/Yield** | Cheap is good         | Assets that are undervalued (high yield relative to price)            | Assets that are overvalued (low yield)                                    |
| **Growth**      | Fast-growing is good  | Assets with rapid earnings/economic growth                            | Assets with slow or negative growth                                       |
| **Quality**     | Safe/well-run is good | Assets with low debt, stable revenue, good management, low fraud risk | Assets with high debt, unstable revenue, poor management, high fraud risk |

#### Value/Yield

* **Concept:** All else equal, own high-quality instruments, sell low-quality ones. Protects in stressful “flight-to-quality” environments.
* **Five categories of quality signals:**
  1. **Leverage** – Long less-levered, short more-levered (e.g., debt-to-equity).
  2. **Revenue diversity** – Prefer companies with diverse, stable revenue sources (less volatile earnings).
  3. **Management quality** – Harder to quantify; uses signals like changes in discretionary accruals.
  4. **Fraud risk** – Long low-fraud risk; uses earnings quality signals (free cash flow vs. reported EPS).
  5. **Quality sentiment** – Forward-looking views on the above; CDS markets provide regular data.
* **Performance:** Quality excels during crises (e.g., 2008 banking stocks, early 2000s accounting scandals) but performs poorly in euphoric markets.

#### Quality

* **Concept:** Buy assets experiencing rapid economic/earnings growth, sell those with slow or negative growth—regardless of price or valuation.
* **Justification:** Growth tends to trend; strong growers gain market share.
* **Macro example:** Long currencies of countries with strong growth (future higher interest rates).
* **Equity example:** QLS uses growth signals; a key variant focuses on **analysts’ earnings estimate revisions** (a sentiment-based strategy, closely related to growth).

#### Growth

* **Concept:** Buy cheap instruments (high yield relative to price). Markets tend to overestimate risk in risky assets, so owning higher-yielding assets can pay off as prices revert to fair value.
* **Quant approach:** Invert standard ratios (e.g., use E/P earnings yield instead of P/E) to avoid issues with negative or zero earnings.
* **Carry trade:** Buy undervalued, sell overvalued; profit from the yield spread (carry) as a margin of safety. Common in currencies (e.g., buy high-yield currency, sell low-yield one) and bonds.
* **Equities:** Relative value strategies (quant long/short, QLS) rank stocks by metrics like book-to-price, buying high-ranked and shorting low-ranked.
* **Commodities:** Roll yield (backwardation = positive yield; contango = negative yield).

<br>
