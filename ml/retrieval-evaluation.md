# Retrieval Evaluation

To illustrate these metrics, assume we run a test with **N=1 query** and **K=5**. The search returns 5 chunks, where relevance is marked as:

* **Rank 1:** Irrelevant (0)
* **Rank 2:** **Relevant (1)**
* **Rank 3:** Irrelevant (0)
* **Rank 4:** **Relevant (1)**
* **Rank 5:** Irrelevant (0)

***

#### HitRate@K (Success@K)

Measures if at least one relevant result exists in the top $$K$$.

* **Example:** Since Rank 2 and Rank 4 are relevant, the query is a "Hit."
* **Calculation:** $$1 / 1 = 1.0$$ (or 100%).
* **Formula:** $$HitRate@K = \frac{1}{|Q|} \sum_{q \in Q} \mathbb{1}[\exists \text{ relevant doc in top-}K]$$

***

#### MRR@K (Mean Reciprocal Rank)

Focuses on the position of the **first** relevant result.

* **Example:** The first relevant chunk is at **Rank 2**.
* **Calculation:** $$1 / 2 = 0.5$$.
* **Formula:** $$MRR = \frac{1}{N} \sum_{i=1}^{N} \frac{1}{\text{rank}_i}$$

***

#### Precision@K

Measures the "signal-to-noise" ratio in the top $$K$$ results.

* **Example:** There are 2 relevant chunks out of 5 total results.
* **Calculation:** $$2 / 5 = 0.4$$.
* **Formula:** $$\text{Precision} = \frac{1}{N} \sum_{i=1}^{N} \frac{\text{count}(\text{relevant chunks})_i}{K}$$

***

#### NDCG@K (Normalized Discounted Cumulative Gain)

Measures the quality of the ranking, giving more credit for relevant items at the top.

**1. Calculate DCG:**

* Rank 2 (Relevant): $$1 / \log_2(2+1) = 0.6309$$
* Rank 4 (Relevant): $$1 / \log_2(4+1) = 0.4307$$
* **Total DCG** = $$1.0616$$

**2. Calculate IDCG (Ideal DCG):** The "Ideal" scenario would have put both relevant chunks at Rank 1 and Rank 2.

* Rank 1: $$1 / \log_2(1+1) = 1.0$$
* Rank 2: $$1 / \log_2(2+1) = 0.6309$$
* **Total IDCG** = $$1.6309$$

**3. Final NDCG:**

* $$1.0616 / 1.6309 = \mathbf{0.6509}$$

**Formulas:** $$DCG = \sum_{j=1}^{K} \frac{rel_j}{\log_2(j+1)} \quad IDCG = \sum_{j=1}^{\min(relCount, K)} \frac{1}{\log_2(j+1)} \quad NDCG = \frac{DCG}{IDCG}$$

***

#### RAGAS & G-Eval

Focus on Faithfulness (hallucination check), Answer Relevance, and Context Precision.

LLM as a judge

***

### References

* **Voorhees 1999** — MRR introduced for TREC QA track.
* **Thakur et al. 2021** — BEIR: Heterogeneous Benchmark for IR — uses nDCG@10.
* **Es et al. 2023** — RAGAS: Automated Evaluation of RAG — context recall, faithfulness, answer relevancy.
* **MS MARCO leaderboard** — uses MRR@10.
