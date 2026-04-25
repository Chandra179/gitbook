# Personal Knowledge Base

## Ingest

* data: markdown

## Chunking

* recursive
* sentence window chunking

## Embedding

* sparse vector: `prithivida/Splade_PP_en_v1`
* ollama embedder

## Qrels (Query Relevance)

```json
{
  "query": "How does the Go GPM scheduler work with goroutines and OS threads?",
  "chunk_id": "golang/goroutine.md:3",
  "file_path": "golang/goroutine.md",
  "relevant": true
}
```

## Search

* hybrid search
* sparse scorer
* rrf

## Reranking

* model: `cross-encoder/ms-marco-MiniLM-L-6-v2`
* endpoint

## Evaluation

* llm as a judge

***

## Storage

qdrant: vector size, dimensions, vector distance(cosine, etc..), sparse & dense vector config

indexing for full text search

keyword indexing based on filepath

## Config

Configuration for end to end process from ingestion to retrieval

#### Profiles

```json
[
  {
    "name": "tf-recursive256",
    "sparse_scorer": "tf",
    "chunk_size": 256,
    "chunk_overlap": 32
  },
  {
    "name": "splade-recursive256",
    "sparse_scorer": "splade",
    "chunk_size": 256,
    "chunk_overlap": 32
  }
]
```

#### Queries

Sample queries to test&#x20;

```json
{"query": "How does the Go GPM scheduler work with goroutines and OS threads?"}
{"query": "What causes goroutine leaks and how do you prevent them?"}
{"query": "How do Go channels work internally with sendq and recvq?"}
{"query": "What changed in Go 1.22 loop variable scoping semantics?"}
```

#### Query Relevance (qrels)

```json
{"query":"How does the Go GPM scheduler work with goroutines and OS threads?","chunk_id":"golang/goroutine.md:3","file_path":"golang/goroutine.md","relevant":true}
{"query":"How does the Go GPM scheduler work with goroutines and OS threads?","chunk_id":"golang/goroutine.md:83","file_path":"golang/goroutine.md","relevant":true}
{"query":"How does the Go GPM scheduler work with goroutines and OS threads?","chunk_id":"golang/goroutine.md:290","file_path":"golang/goroutine.md","relevant":true}

```
