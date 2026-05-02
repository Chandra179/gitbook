# RAG

## RAG

### Chunking

#### Structure-Aware Chunking

Parse Markdown into an Abstract Syntax Tree (AST) using **markdown-it.**

```json
[
  {
    "type": "ElementType.HEADING",
    "content": "this is content abc",
    "level": 2,
    "children": [
      {
        "type": "ElementType.HEADING",
        "content": "on section abc we have ...",
        "level": 2,
        "children": []
      }
    ]
  }
]
```

Then, we build a section hierarchy. It groups content (tables, lists, paragraphs) under their respective headers. For example, Header 1 is the top-level header; all associated content is grouped under it. for example:

```json
[
  {
    "level": 1, 
    "heading": "Header A",
    "content_elements": [], 
    "subsections": [
      {
        "level": 2,
        "heading": "Header A.1",
        "content_elements": [
          "<tables>",
          "<list>"
        ],
        "subsections": []
      }
    ]
  },
  {
    "level": 1,
    "heading": "Header B",
    "content_elements": [
      "<paragraph>"
    ],
    "subsections": []
  }
]
```

Next we do chunking. Each the text, paragraphs, code, tables have their own strategies for chunking

1. paragraphs/text, if its to long split it by sentence/clauses/words, if its to short merged it into one
2. tables, if tables to large split by rows while still keep the table header
3. codes, split by lines
4. list, split by items

If the chunk size is bigger than the `token limits` we should split it into a new chunk. Also adds `context overlap` before and after the current chunk for better retrieval. example:

<figure><img src="https://2576044272-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F4G3qEfKKNTPjJ3BFGqg8%2Fuploads%2FnKMNSy4Qz5sCCmbFH4Ms%2Fimage.png?alt=media&#x26;token=b8627ec6-6946-4e07-96e7-107d6c026c73" alt=""><figcaption></figcaption></figure>

```md
# Header A
## Header A.1
<tables>
<list>

# Header B
<paragraph>
```

If we want to chunk `## Header A.1 <list>`, the "before" context is `<tables>` and the "after" context is `# Header B`. Since `# Header B` is at the same level as `# Header A` (Level 1), we do not add it as "after" context. The final output will be:

```json
[
  {
    "id": "86881823-686f-48c2-a574-b10d999a9235",
    "chunk_type": "table",
    "section_path": "Table of Contents",
    "parent_section": "Table of Contents",
    "next_chunk_id": "ec782819-99d5-4a61-a663-ec5a78504c6c",
    "prev_chunk_id": "d1faf125-e423-4e9b-bb21-778509df1c61",
    "document_id": "example",
    "content": "| Executive Summary …",
    "token_count": 677,
    "split_sequence": "28/40"
  }
]
```

* `id`: A unique string (UUID v4) assigned to this specific chunk to identify it within the vector store.
* `chunk_type`: Identifies the type of the content, ex: "table"
* `section_path`: A full breadcrumb path representing the document's hierarchical ancestry (e.g., "Introduction > Summary") to preserve global context.
* `parent_section`: The name of the immediate heading under which this chunk is located, used to anchor the data to a specific topic.
* `next_chunk_id`: The unique ID of the following chunk in the document
* `prev_chunk_id`: The unique ID of the preceding chunk in the document
* `document_id`: file name
* `content`: The actual text or markdown representation of the chunk
* `token_count`: The number of tokens in the content
* `split_sequence`: An index (e.g., "28/40") indicating this is the 28th part out of 40 total chunks created from the same original section or element.

#### Recursive Chunker

Instead of treating the document as a raw string, the chunker first uses the `goldmark` library to parse the Markdown into an **Abstract Syntax Tree (AST)**.

* **Heading-Based Grouping:** The `extractSections` function identifies headings (`#`, `##`, etc.) and groups all subsequent paragraphs, lists, and blockquotes under that specific header.
* **Context Preservation:** By grouping by header, each chunk "knows" its location in the document hierarchy.
* **Plain Text Conversion:** The `nodeToPlainText` utility strips Markdown syntax (like link brackets or image tags) while preserving the inner text, ensuring the LLM focuses on content rather than formatting noise.

When a section exceeds the `chunkSize`, the `splitText` method applies a hierarchical "drill-down" approach. It attempts to split the text using a sequence of increasingly granular separators:

1. **Paragraphs** (`\n\n`)
2. **Lines** (`\n`)
3. **Sentences** (`.` )
4. **Words** ( )

**Why this order?**

The goal is to split the text at the **largest possible semantic boundary**. If a section can be split by paragraphs without breaking a single paragraph across chunks, the system prefers that over splitting in the middle of a sentence.

Once the text is split into small parts by the chosen separator, the `mergeSplits` function recombines them:

* **Filling the Buffer:** It adds parts to a chunk until adding one more would exceed the `chunkSize`.
*   **Overlap Injection:** When a chunk is finalized, the next chunk starts with an **overlap suffix** from the previous chunk.

    > **Benefit:** This "sliding window" ensures that semantic context isn't lost if a key piece of information is split exactly at the boundary of two chunks.

**Before**

```
# Artificial Intelligence

Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals and humans. It is a broad field of study.

## Applications

AI is used in many fields today. Examples include medical diagnosis, electronic commerce, and robot control. It is truly everywhere.
```

**After**

```json
[
  {
    "Text": "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural",
    "FilePath": "intro.md",
    "Header": "Artificial Intelligence",
    "LineStart": 3
  },
  {
    "Text": "as opposed to the natural intelligence displayed by animals and humans. It is a broad field of study.",
    "FilePath": "intro.md",
    "Header": "Artificial Intelligence",
    "LineStart": 3
  },
  {
    "Text": "AI is used in many fields today. Examples include medical diagnosis, electronic commerce, and",
    "FilePath": "intro.md",
    "Header": "Applications",
    "LineStart": 7
  },
  {
    "Text": "electronic commerce, and robot control. It is truly everywhere.",
    "FilePath": "intro.md",
    "Header": "Applications",
    "LineStart": 7
  }
]
```

* **Semantic Integrity**: The split for the first section happened at a space between "natural" and "intelligence" because the chunker couldn't fit the whole paragraph.
* **Contextual Overlap**: In the second chunk, the text begins with `"as opposed to the natural"`. This is the 20-character overlap that ensures the LLM doesn't lose the start of the thought.
* **Metadata Extraction**: Even though the "Applications" section was split into two chunks, both retain the `Header: "Applications"`. This is crucial for RAG systems to know which topic the text belongs to.

***

### Embedding

<figure><img src="https://2576044272-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F4G3qEfKKNTPjJ3BFGqg8%2Fuploads%2FlCUQjnyoJCgu1EWcioXC%2Fvector_dense_sparse.png?alt=media&#x26;token=26d5c821-03ae-44cc-a730-91edca8360fa" alt=""><figcaption></figcaption></figure>

We need to store **dense vector** from the embed result, and also create **sparse vector** using SPLADE (Sparse Lexical and Expansion Model). Its needed for Hybrid Search retrieval.

```json
{
  "id": 31868393794739972,
  "payload": {
    "is_continuation": false,
    "token_count": 322,
    "extra": null,
    "document_id": "econ_nuclear",
    "split_sequence": null,
    "chunk_type": "text",
    "content": "The policy to promote the development of small-scale coal mines worked...",
    "section_path": "2.  The boom-and-bust road of the coal industry"
  },
  "vector": {
    "sparse": {
      "indices": [
        21447,
        21762
      ],
      "values": [
        0.14956795,
        0.12950781
      ]
    },
    "dense": [
      -0.011004133,
      -0.007966931
    ]
  }
}  
```

**Dense vector embed**

The dense vector maps the query's meaning into a fixed-size numerical space (768 dimensions). Every single dimension has a value, representing a "location" in a semantic map.

* model\_name: `BAAI/bge-base-en-v1.5`
* tokenizer\_path: "tokenizer.json" or HuggingFace model ID
* max\_token\_limit: 512 (model's actual limit)
* model\_dim: 768 (embedding dimension)

**Sparse vector embed**

The sparse vector maps the query onto a massive vocabulary ($$>30,000$$ tokens). Instead of a list of floats, it only stores the IDs of "activated" terms and their importance weights. Note how it "expands" to include relevant terms not present in the original query (like "concurrency" or "thread").

* model\_name: `prithivida/Splade_PP_en_v1` (The industry standard for high-performance SPLADE embeddings).
* max\_token\_limit: `512` (Matches dense model's limit for consistency during chunking).

{% hint style="info" %}
the model config flexible, we can change it later
{% endhint %}

***

### Pre Retrieval

* Multi-Query Generation: Generate 3-5 variations of the user's prompt to overcome poor phrasing.
* Semantic Router: Use a lightweight classifier to decide if a query needs the Vector DB, the Knowledge Graph, a web search tool, or just a direct LLM response.
* Step-back Prompting: Force the model to ask a broader "step-back" question to retrieve foundational concepts before answering the specific technical query.

***

### Retrieval

**BM25 (Keyword Precision)**

**Scenario:** Query is "Fast Car".

**Formula:** $$Score(D, Q) = \sum\_{q \in Q} IDF(q) \cdot \frac{f(q, D) \cdot (k\_1 + 1)}{f(q, D) + k\_1 \cdot (1 - b + b \cdot \frac{|D|}{avgdl})}$$

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

**SPLADE (Sparse Neural Expansion)**

**Scenario:** Query is "Fast Car".

**Formula:** $$w\_{j} = \sum\_{i \in \text{query}} \log(1 + \text{ReLU}(w\_{i,j}))$$

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

**Cosine Distance (The Metric)**

**Formula:** $$\text{similarity} = \cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{|\mathbf{A}| |\mathbf{B}|}$$

* **Logic:** Used by Qdrant to find the similarity between the Query Vector ($\mathbf{A}$) and Document Vector ($$\mathbf{B}$$) based on their angle in high-dimensional space.
* **Example:** If $$\mathbf{A}$$ is $\[1, 1]$ and $$\mathbf{B}$$ is $$\[2, 2]$$, the angle is $$0^\circ$$, so similarity is **1.0**.

***

**RRF (Reciprocal Rank Fusion)**

**Formula:** $$RRFscore(d) = \sum\_{r \in R} \frac{1}{k + r(d)}$$ _(Where_ $$k=60$$ _is the standard constant, and_ $$r(d)$$ _is the rank position)_

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

#### Enhanced Retrieval

**GraphRAG**

Extract entities and relationships from your Markdown files to build a Knowledge Graph.

**Agentic RAG (Corrective RAG)**

* Self-RAG / CRAG: Implement a loop where the LLM evaluates the retrieved documents. If they are irrelevant, the agent triggers a web search or a different retrieval strategy.
* Citation & Attribution: Develop a post-processing step that forces the LLM to provide precise Markdown-linked citations for every claim, verifying that the answer actually exists in the retrieved context.

**Nice To Have**

* Local Embedding Caching: Implement a high-performance LRU cache for embeddings to reduce API costs and latency.
* Quantization: Experiment with binary or scalar quantization in Qdrant. Reducing your vectors from `float32` to `int8` or `bit` can drastically speed up search with minimal recall loss.
* Streaming RAG: Ensure your Go backend handles streaming tokens and partial retrieval results to minimize "Time to First Byte" (TTFB) for the user.

***

### Evaluation

To illustrate these metrics, assume we run a test with **N=1 query** and **K=5**. The search returns 5 chunks, where relevance is marked as:

* **Rank 1:** Irrelevant (0)
* **Rank 2:** **Relevant (1)**
* **Rank 3:** Irrelevant (0)
* **Rank 4:** **Relevant (1)**
* **Rank 5:** Irrelevant (0)

***

**HitRate@K (Success@K)**

Measures if at least one relevant result exists in the top $$K$$.

* **Example:** Since Rank 2 and Rank 4 are relevant, the query is a "Hit."
* **Calculation:** $$1 / 1 = 1.0$$ (or 100%).
* **Formula:** $$HitRate\@K = \frac{1}{|Q|} \sum\_{q \in Q} \mathbb{1}\[\exists \text{ relevant doc in top-}K]$$

***

**MRR@K (Mean Reciprocal Rank)**

Focuses on the position of the **first** relevant result.

* **Example:** The first relevant chunk is at **Rank 2**.
* **Calculation:** $$1 / 2 = 0.5$$.
* **Formula:** $$MRR = \frac{1}{N} \sum\_{i=1}^{N} \frac{1}{\text{rank}\_i}$$

***

**Precision@K**

Measures the "signal-to-noise" ratio in the top $$K$$ results.

* **Example:** There are 2 relevant chunks out of 5 total results.
* **Calculation:** $$2 / 5 = 0.4$$.
* **Formula:** $$\text{Precision} = \frac{1}{N} \sum\_{i=1}^{N} \frac{\text{count}(\text{relevant chunks})\_i}{K}$$

***

**NDCG@K (Normalized Discounted Cumulative Gain)**

Measures the quality of the ranking, giving more credit for relevant items at the top.

**1. Calculate DCG:**

* Rank 2 (Relevant): $$1 / \log\_2(2+1) = 0.6309$$
* Rank 4 (Relevant): $$1 / \log\_2(4+1) = 0.4307$$
* **Total DCG** = $$1.0616$$

**2. Calculate IDCG (Ideal DCG):** The "Ideal" scenario would have put both relevant chunks at Rank 1 and Rank 2.

* Rank 1: $$1 / \log\_2(1+1) = 1.0$$
* Rank 2: $$1 / \log\_2(2+1) = 0.6309$$
* **Total IDCG** = $$1.6309$$

**3. Final NDCG:**

* $$1.0616 / 1.6309 = \mathbf{0.6509}$$

**Formulas:** $$DCG = \sum\_{j=1}^{K} \frac{rel\_j}{\log\_2(j+1)} \quad IDCG = \sum\_{j=1}^{\min(relCount, K)} \frac{1}{\log\_2(j+1)} \quad NDCG = \frac{DCG}{IDCG}$$

***

**RAGAS & G-Eval**

Focus on Faithfulness (hallucination check), Answer Relevance, and Context Precision.

LLM as a judge

***

**References**

* **Voorhees 1999** — MRR introduced for TREC QA track.
* **Thakur et al. 2021** — BEIR: Heterogeneous Benchmark for IR — uses nDCG@10.
* **Es et al. 2023** — RAGAS: Automated Evaluation of RAG — context recall, faithfulness, answer relevancy.
* **MS MARCO leaderboard** — uses MRR@10.

***

### Sentence Window Retrieval

**Problem:** Small chunks = precise retrieval. Large chunks = rich context for LLM. Can't have both with one chunk size.

**Solution:** Index small (single sentence), retrieve big (surrounding window).

At ingest: each sentence gets a vector. `WindowText` field stores N sentences before + after. At retrieval: vector search finds the sentence, but `WindowText` (the wider passage) is returned to the LLM.

**Why it works:** Embedding a sentence gives sharp semantic signal. Returning the window gives the LLM enough surrounding context to reason correctly. Precision and context are decoupled.

***

### Contextual Prefix Embedding

**Problem:** Chunk "It was introduced in 1995" is semantically ambiguous in isolation. Embedding it produces a weak, generic vector.

**Solution:** Prepend document structure before embedding:

```
<filePath> > <heading>
<chunk text>
```

Example:

```
economics/coal.md > The boom-and-bust road of the coal industry
It was introduced in 1995 as part of the state's reform program.
```

**Why it works:** The prefix anchors the chunk's meaning to its document context. The embedding now captures both the content and where it lives. Retrieval improves because similar queries naturally match similar document contexts. Stored text is unchanged — only the embedded representation is enriched.

***

### HyDE (Hypothetical Document Embedding)

**Paper:** Gao et al., ACL 2023 — _Precise Zero-Shot Dense Retrieval without Relevance Labels_

**Problem:** Query "what causes inflation?" is short and sparse. Documents are long and dense. Embedding the raw query produces a vector far from where the answer lives in embedding space.

**Solution:** Instead of embedding the query, generate a hypothetical document that would answer it, then embed that.

```
Query → LLM → "Inflation is caused by excess money supply relative to goods..."
             → embed hypothetical doc
             → search with that vector
```

For robustness: generate N hypothetical docs in parallel, embed each, average the vectors (L2-normalized), search with the average.

**Why it works:** The hypothetical doc lives in the same embedding space as real documents. The vocabulary, style, and density match. This closes the asymmetry between short queries and long passages.

**Tradeoff:** Adds LLM generation latency before every search. Use `numDocs=1` for low-latency; higher N reduces variance at cost of speed.

***

### Cross-Encoder Reranking

**Problem:** Bi-encoder (ANN) retrieval is fast but scores `(query, doc)` pairs independently — no interaction. Ranking quality is limited.

**Solution:** Two-stage retrieval.

**Stage 1 — Bi-encoder (recall):** Embed query once. ANN search returns top `K * multiplier` candidates fast. Approximate but high recall.

**Stage 2 — Cross-encoder (precision):** Feed full `(query, passage)` pairs through a cross-encoder model. It reads both jointly — captures term interaction, negation, context. Re-sorts candidates. Truncate to top K.

```
Bi-encoder: query vec → ANN → 30 candidates   (fast, ~ms)
Cross-encoder: (query, passage) × 30 → scores  (slower, ~100ms)
```

**Why it works:** Cross-encoder has full attention over both texts. It catches what bi-encoder misses: exact phrasing match, negations ("does NOT cause"), specificity. Tradeoff is latency — only feasible on small candidate sets, hence the two-stage design.

**Model:** `cross-encoder/ms-marco-MiniLM-L-6-v2` (6-layer MiniLM, fast + accurate on passage ranking tasks).

***

### Semantic Cache

**Problem:** Exact-string cache misses on paraphrased queries. "What causes inflation?" and "Why does inflation happen?" are different strings but same intent.

**Solution:** Cache keyed by query _embedding_, not query string. On lookup: embed incoming query, search cache by cosine similarity. If nearest cached query scores ≥ threshold (e.g. 0.90), return its stored results.

```
Query → embed → cosine search in cache collection
  score ≥ 0.90 → cache HIT  → return stored results (skip embed + search + rerank)
  score < 0.90 → cache MISS → run full pipeline → store results async
```

**Why it works:** Semantically equivalent queries map to nearby vectors. Cache hit absorbs the entire retrieval cost (embedding + ANN + reranking). Only novel queries pay full cost.

**Tradeoff:** Threshold sensitivity. Too high (0.99) → near-zero hit rate. Too low (0.70) → wrong results returned for different-intent queries. Tune on your query distribution. Typical range: 0.85–0.95.

TTL prevents stale results as knowledge base updates.
