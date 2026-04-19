# Retrieval Evaluation

#### MRR@K

**Mean Reciprocal Rank** measures how early the system returns the _first_ relevant chunk. If the first relevant result is at rank 1, the score is 1.0; at rank 2, it is 0.5, etc.

**Formula:**

$$MRR = \frac{1}{N} \sum_{i=1}^{N} \frac{1}{\text{rank}_i}$$

(Where $$\text{rank}_i$$ _is the 1-based index of the first relevant chunk. If no relevant chunks are found in the top_ $$K$$_, the reciprocal rank is 0)._

#### NDCG@K

**Normalized Discounted Cumulative Gain** evaluates ranking quality by penalizing relevant documents that appear lower in the search results.&#x20;

**Formulas:**

$$DCG = \sum_{j=1}^{K} \frac{rel_j}{\log_2(j+1)}$$

(Where $$rel_j \in {0,1}$$. In the code, $$j+1$$ is represented as `rank + 2` because the loop is 0-indexed).

$$IDCG = \sum_{j=1}^{\min(relCount, K)} \frac{1}{\log_2(j+1)}$$

$$NDCG = \frac{1}{N} \sum_{i=1}^{N} \frac{DCG_i}{IDCG_i}$$

#### Precision@K

Measures the exact density of relevant items within the retrieved context window, indicating how much of the returned context is actually useful vs. noise.

**Formula:**

$$\text{Precision} = \frac{1}{N} \sum_{i=1}^{N} \frac{\text{count}(\text{relevant chunks})_i}{K}$$

***

### References

* **Voorhees 1999** — MRR introduced for TREC QA track
* **Thakur et al. 2021** — BEIR: Heterogeneous Benchmark for IR — uses nDCG@10
* **Es et al. 2023** — RAGAS: Automated Evaluation of RAG — context recall, faithfulness, answer relevancy
* **MS MARCO leaderboard** — uses MRR@10
