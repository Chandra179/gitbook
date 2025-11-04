# Retriever

## **Dense Passage Retriever (DPR)**

**Dense Passage Retriever (DPR)**, introduced by Karpukhin et al. (2020), is a **neural retriever** that learns to embed questions and passages into the same vector space, so that **relevant passages have high inner product** with the question vector. [https://arxiv.org/pdf/2004.04906](https://arxiv.org/pdf/2004.04906)

**Encoders:**

* DPR uses **two BERT models**:
  * **Question Encoder** → converts a question into a vector q
  * **Passage Encoder** → converts a passage into a vector p

**Dense retrievers** (like **DPR**) use **neural embeddings** (vector representations).

* Both the query and passages are converted into vectors in a shared space.
* Similar meaning → closer vectors.
* Matching is done using **Maximum Inner Product Search (MIPS)**

```
Maximum Inner Product Search is just:

q = [3, 1]

v1 = [1, 2]
v2 = [4, 0]
v3 = [2, 1]

q · v1 = (3*1) + (1*2) = 5
q · v2 = (3*4) + (1*0) = 12
q · v3 = (3*2) + (1*1) = 7
Pick the item with the largest score. -> 12
```

## Comparison

| Aspect            | **Traditional Passage Retrieval (Sparse)**                        | **Dense Passage Retrieval (DPR / Dense)**                                 |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Examples          | **BM25**, TF-IDF, keyword search                                  | **DPR (bi-encoder)**, Sentence Transformers, embedding-based              |
| Representation    | Bag-of-words, counts frequencies                                  | Converts text into **vectors** (numerical embeddings)                     |
| Matching method   | Overlap of **words** (exact lexical match)\*\*                    | **Semantic similarity** (dot product / cosine similarity in vector space) |
| Query & documents | Uses same token space (words)                                     | Query encoder and passage encoder can be **different models**             |
| Good at           | Short precise queries, keyword-heavy text                         | Paraphrased questions, fuzzy meaning, synonyms                            |
| Struggles with    | Synonyms, rephrasing ("price of crude oil" vs "oil market price") | Exact keyword match when specific terms are needed                        |
| Storage/querying  | Inverted index (lightweight)                                      | Vector DB (Qdrant, Pinecone, Weaviate, FAISS)                             |
| Scalability       | Very scalable for text search                                     | Requires GPU to train; indexing costs more                                |
| Used in           | Search engines (Elasticsearch, Solr), older NLP                   | RAG systems, modern LLM retrieval (OpenAI, Meta)                          |
