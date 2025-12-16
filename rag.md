# RAG

## URLs Collector

we need some urls to be crawled so i was thinking to use **seed urls** and **browser automation** where we collect the urls from browser search like google, brave, etc..

## Crawl Config

* If we crawling on the same site (domain) multiple times in short time range we can get blocked so we need IP rotation we can use Residental/Tor proxy `zhaowde/rotating-tor-http-proxy`
* Domain whitelist
* handle URL visits deduplication avoid visiting same URL can cause a loop
* respect robots.txt
* rate limit request per domain, 10-15 req/sec, random delay
* define regex to skip junk URL, ex: `(contact|privacy|terms|faq|tag)`

## Content Extraction

Use Docling to extract PDFs to markdown (including image, table)

## Markdown Chunking & Embedding

For each new line `\n` check using regex if its `Headers, Tables, Lists, Paragraphs` . Below is the chunking strategy for  each component:

#### Tables

1. Count tokens of full table
2. If tokens <= target\_chunk\_size: → Keep intact → Add context (header path + surrounding paragraph)
3. If tokens > target\_chunk\_size: → Strategy: Split by rows
   * Calculate: rows\_per\_chunk = target\_chunk\_size / avg\_row\_tokens
   * Each chunk: table\_header + N\_rows + context
   * Metadata: {table\_id, chunk\_index, total\_chunks}

#### Lists (Bullet/Numbered)

1. Try to keep complete list together
2. If list tokens <= target\_chunk\_size: → Keep intact with header context
3. If list tokens > target\_chunk\_size: → Split by items (like table rows) → Each chunk: context + N\_items → Add metadata: {list\_id, item\_range: "1-5 of 20"}

#### Headers (Empty or Short)

If header has no content or very short: → Merge with next section → Preserve header hierarchy in metadata

#### Images

`![Caption text](images/image1.png)`

1. Include caption in surrounding text chunk
2. Context strategy:
   * Include paragraph before image (context)
   * Include caption
   * Include paragraph after image (explanation)
   * This keeps image reference meaningful

#### Then For each chunk

1. Count tokens using target model's tokenizer `tokenizer.json`. Ex: [https://huggingface.co/BAAI/bge-base-en-v1.5/blob/main/tokenizer.json](https://huggingface.co/BAAI/bge-base-en-v1.5/blob/main/tokenizer.json).
2. Add token overlap between consecutive chunks. Overlap\_tokens = 50 (configurable)
3. If token\_count > max\_embed\_space:
   * Do the chunking strategy again until its not exceed max\_embed\_space (recursive)

### **Embedding Config**

```
├── model_name: "BAAI/bge-base-en-v1.5"
├── tokenizer_path: "tokenizer.json" or HuggingFace model ID
├── max_token_limit: 512 (model's actual limit)
├── target_chunk_size: 400 (leave buffer for safety)
├── min_chunk_size: 100 (avoid too-small chunks)
├── overlap_tokens: 50 (for context preservation)
└── model_dim: 768 (embedding dimension)
```

### Metadata Schema

Store alongside embeddings in vector database:

```json
{
  // Identity
  "chunk_id": "doc_5_h2_3_chunk_7",
  "document_id": "financial_report_2024.md",
  "document_title": "Q4 Financial Report",
  "token_count": 387,
  "chunk_type": "table"
}
```

**Storage Options:** Vector DB Qdrant
