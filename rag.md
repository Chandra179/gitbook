# RAG

### URLs Collector

we need some urls to be crawled we can use **seed urls** and **browser automation** (where we collect the urls from browser search like google, brave, etc..)&#x20;

### Crawl Config

* If we crawling on the same site (domain) multiple times in short time range we can get blocked so we need IP rotation. We can use Residental/Tor proxy `zhaowde/rotating-tor-http-proxy`
* Domain whitelist, crawl only trusted domain
* handle URL visits deduplication avoid visiting same URL can cause infinite loop
* respect robots.txt
* rate limit request per domain, 10-15 req/sec, random delay
* define regex to skip junk URL, ex: `(contact|privacy|terms|faq|tag)`

### Content Extraction

Use Docling to extract PDFs to markdown (including image, table, etc..)

### Markdown Chunking

```
Input: Markdown Text
    ↓
[Parser] → MarkdownElement objects
    ↓
[SectionAnalyzer] → Hierarchical sections
    ↓
[SemanticChunker] → Create chunks with ancestry
    ↓
[ChunkSplitters] → Handle element-specific logic
    ↓
[OverlapHandler] → Apply sliding window
    ↓
Output: SemanticChunk objects with relationships
```

Parsed markdown into structured AST (Abstract Syntax Tree) format, table example:

* `table_open` (The container)
  * `thead_open` (The header section)
    * `tr_open` (The header row)
      * `th_open` / `inline` / `th_close` (Each header cell)
    * `tr_close`
  * `thead_close`
  * `tbody_open` (The body section)
    * `tr_open` (A data row)
      * `td_open` / `inline` / `td_close` (Each data cell)
    * `tr_close`
  * `tbody_close`
* `table_close`

the extracted elements will be created as object, the final output will be collection of extracted objects

```json
[
    {
        "type": "ElementType.CODE_BLOCK",
        "content": "def hello():\n    print('world')",
        "metadata": {
          "language": "python"
        },
        "children": [] // Code blocks usually have no children
    }
]
```

then we build section hierarchy. Usually text, tables, formula, image will be under a header. For example header 1 is the bigger header (top-level) then all the text, images, tables will be chunk into 1 like this

```json
{
  "chunk_type": "text",
  "section_path": "BOC as filial son",
  "token_count": 235,
  "chunk_id": "econ_nuclear_392_0b4aa421",
  "content": "Note : The big state banks include China's Postal bank. Source : Table constructed from data in Zhong (2010) and PBC (2010 a,b,c). stringently in action'. An indicator of how susceptible banks are to this pressure is the ratio of platform-to-total loans. The function of policy banks is clearly to implement government policy, but we can compare the ratio of platform-to-total loans of the big state banks with the ratio of the other non-policy banks. Table 10.9 shows the big state banks have a ratio of platform loans that was below the average for the other non-policy banks. Being state-owned, they have the pick of the best and least risky projects. Leung (2011: 2) estimated that in 2009 BOC had a platform-to-total loan ratio of 6.2%. Using data in PWC (2011: 11) and Table 10.7, I estimate the BOC ratio in 2009-10 to be between 8 and 9.1%. Both estimates are lower than the ratio estimates in Table 10.9 for the non-policy banks."
}
```

### **Embedding**

Configurable embedding model and use Vector DB Qdrant for storage, configuration:

```
├── model_name: "BAAI/bge-base-en-v1.5"
├── tokenizer_path: "tokenizer.json" or HuggingFace model ID
├── max_token_limit: 512 (model's actual limit)
├── target_chunk_size: 400 (leave buffer for safety)
├── min_chunk_size: 100 (avoid too-small chunks)
├── overlap_tokens: 50 (for context preservation)
└── model_dim: 768 (embedding dimension)
```

**Search**

Improving vector search using Reranker (Cross-Encoder)
