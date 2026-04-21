# Retrieval

## Pre Retrieval

* Multi-Query Generation: Generate 3-5 variations of the user's prompt to overcome poor phrasing.
* Semantic Router: Use a lightweight classifier to decide if a query needs the Vector DB, the Knowledge Graph, a web search tool, or just a direct LLM response.
* Step-back Prompting: Force the model to ask a broader "step-back" question to retrieve foundational concepts before answering the specific technical query.

***

## Retrieval

#### BM25 (Keyword Precision)

**Scenario:** Query is "Fast Car".

**Formula:** $$Score(D, Q) = \sum_{q \in Q} IDF(q) \cdot \frac{f(q, D) \cdot (k_1 + 1)}{f(q, D) + k_1 \cdot (1 - b + b \cdot \frac{|D|}{avgdl})}$$

* **Logic:** It rewards documents where "Fast" and "Car" appear frequently, but saturates the score so that the 100th mention of "Car" adds less value than the 1st.
* **Example Calculation:**
  * **Doc 1 ("Fast sports car"):** Contains both. Score: **2.45**
  * **Doc 2 ("Speedy vehicle"):** Contains neither. Score: **0.00**
  * **Doc 3 ("Red car"):** Contains "car". Score: **1.10**

**Best Used For:** Exact matches: SKU numbers, legal terms, specific names (e.g., "RTX 4050").

* Extremely fast execution on massive datasets.

**When it Performs Poorly:**

* **The "Vocabulary Mismatch" Problem:** If the user types "apartment" but the document uses "flat," BM25 will return a score of 0.
* **Context Blindness:** It treats words as isolated units. It cannot distinguish between "Apple" (the company) and "apple" (the fruit) unless other keywords are present.

***

#### SPLADE (Sparse Neural Expansion)

**Scenario:** Query is "Fast Car".

**Formula:** $$w_{j} = \sum_{i \in \text{query}} \log(1 + \text{ReLU}(w_{i,j}))$$

* **Logic:** It expands "Fast Car" to include terms like "speed" or "engine" by activating weights in a BERT-sized vocabulary.
* **Example Calculation:**
  * **Doc 1 ("Fast sports car"):** Strong activation for "fast" and "car". Score: **3.10**
  * **Doc 2 ("Speedy vehicle"):** Strong activation because "speedy" is a neighbor of "fast". Score: **2.95**
  * **Doc 3 ("Red car"):** Weak activation. Score: **0.80**

**Best Used For:**

* Bridging the gap between keywords and meaning.
* Handling synonyms and "query expansion" automatically without needing a manual thesaurus.

**When it Performs Poorly:**

* **Inference Latency:** Unlike BM25 (which is a simple math lookup), SPLADE requires a neural network (BERT-based) pass to generate weights. This increases the "Time to First Token."
* **"Hallucinated" Keywords:** Sometimes the model expands a query too aggressively. Searching for "Java" (the language) might activate weights for "coffee" or "Indonesia," leading to irrelevant results in a technical corpus.
* **Resource Intensive:** Storing SPLADE vectors in Qdrant takes significantly more disk space/RAM than a standard BM25 index.

***

#### Cosine Distance (The Metric)

**Formula:** $$\text{similarity} = \cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$

* **Logic:** Used by Qdrant to find the similarity between the Query Vector ($\mathbf{A}$) and Document Vector ($$\mathbf{B}$$) based on their angle in high-dimensional space.
* **Example:** If $$\mathbf{A}$$ is $\[1, 1]$ and $$\mathbf{B}$$ is $$[2, 2]$$, the angle is $$0^\circ$$, so similarity is **1.0**.

***

#### RRF (Reciprocal Rank Fusion)

**Formula:** $$RRFscore(d) = \sum_{r \in R} \frac{1}{k + r(d)}$$ _(Where_ $$k=60$$ _is the standard constant, and_ $$r(d)$$ _is the rank position)_

| Document  | BM25 Rank (r\_1) | SPLADE Rank (r\_2) | RRF Calculation                     | Final Score |
| --------- | ---------------- | ------------------ | ----------------------------------- | ----------- |
| **Doc 1** | 1                | 1                  | $$\frac{1}{60+1} + \frac{1}{60+1}$$ | **0.0328**  |
| **Doc 2** | 3                | 2                  | $$\frac{1}{60+3} + \frac{1}{60+2}$$ | **0.0320**  |
| **Doc 3** | 2                | 3                  | $$\frac{1}{60+2} + \frac{1}{60+3}$$ | **0.0320**  |

**Result:** Doc 1 is the winner. Doc 2 (which had 0 keywords) is boosted to a tie for 2nd place because of its semantic relevance found by SPLADE.

**Best Used For:**

* Merging results from completely different scoring systems (e.g., a 0-1 cosine score and a 0-100 BM25 score) without needing to "normalize" the math.

**When it Performs Poorly:**

* **The "Tie-Breaker" Weakness:** RRF relies entirely on rank position. If two models both provide mediocre results, RRF might still rank them highly just because they both "agreed" they were mediocre.
* **Loss of Distributional Info:** If the top result in BM25 is a 99% match and the second is only a 10% match, RRF treats them simply as #1 and #2. It "squashes" the nuance of how much better the first result actually was.
* **Hyperparameter Sensitivity:** The constant $$k$$ (usually 60) determines how much weight is given to lower-ranked items. If $$k$$ is too low, the system becomes "top-heavy" and ignores any document that isn't in the top 3 of either list.



## Enhanced Retrieval

#### GraphRAG

Extract entities and relationships from your Markdown files to build a Knowledge Graph.

#### Agentic RAG (Corrective RAG)

* Self-RAG / CRAG: Implement a loop where the LLM evaluates the retrieved documents. If they are irrelevant, the agent triggers a web search or a different retrieval strategy.
* Citation & Attribution: Develop a post-processing step that forces the LLM to provide precise Markdown-linked citations for every claim, verifying that the answer actually exists in the retrieved context.



## Nice To Have

* Local Embedding Caching: Implement a high-performance LRU cache for embeddings to reduce API costs and latency.
* Quantization: Experiment with binary or scalar quantization in Qdrant. Reducing your vectors from `float32` to `int8` or `bit` can drastically speed up search with minimal recall loss.
* Streaming RAG: Ensure your Go backend handles streaming tokens and partial retrieval results to minimize "Time to First Byte" (TTFB) for the user.
