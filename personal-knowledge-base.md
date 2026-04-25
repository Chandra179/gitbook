# Personal Knowledge Base

## Ingestion

#### Data Source

* **Format:** Markdown

#### Chunking Strategies

* **Recursive Character:** Standard hierarchical splitting.
* **Sentence Window:** Contextual enrichment for retrieval.

#### Embedding Models

* **Sparse Vector:** `prithivida/Splade_PP_en_v1`
* **Dense Vector:** Ollama Embedder (local)

***

## Storage & Indexing

#### Vector Configuration

* **Dense:** Vector size, dimensions, and distance metric (e.g., Cosine).
* **Sparse:** Configuration for SPLADE/BM25 compatibility.

#### Search Optimization

* **Full-Text Search:** Indexing for lexical matches.
* **Keyword Indexing:** Filtering based on `file_path` metadata.

***

## Retrieval Pipeline

#### Semantic Cache (The Entry Point)

* **Strategy:** Vector-based similarity lookup for queries.
* **Function:** Checks if a semantically similar query exists in the cache (e.g., using RedisVL or GPTCache). If a match is found (e.g., >0.95 similarity), it returns the cached response immediately, bypassing the LLM and Retrieval steps.

#### Query Transformation (HyDE)

* **Strategy:** Hypothetical Document Embeddings.
* **Function:** Uses an LLM to generate a synthetic answer to the query before embedding to improve dense retrieval performance.

#### Retrieval

* **Hybrid Search:** Combining sparse and dense results.
* **Sparse Scorer:** Logic for keyword/SPLADE weighting.
* **RRF (Reciprocal Rank Fusion):** Merging ranked lists from multiple search types.

#### Reranking

* **Model:** `cross-encoder/ms-marco-MiniLM-L-6-v2`
* **Endpoint:** Internal inference service.

***

### Evaluation & Testing

#### Ground Truth (Qrels)

```json
{
  "query": "How does the Go GPM scheduler work with goroutines and OS threads?",
  "chunk_id": "golang/goroutine.md:3",
  "file_path": "golang/goroutine.md",
  "relevant": true
}
```

## Metrics

prometheus

latency and cache hit
