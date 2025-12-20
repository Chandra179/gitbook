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
[ChunkSplitters] → Handle element-specific logic
    ↓
[OverlapHandler] → Apply sliding window
    ↓
Output: SemanticChunk objects with relationships
```

When it comes to chunking, we don't want to cut mid-sentence or mid-paragraph. For tables and code blocks, we want to keep them together; if we cut them, the text will lose its meaning. How do we do that? First, we build a Markdown tree using an **AST (Abstract Syntax Tree)**, which can detect the opening and closing of elements,&#x20;

for example: table is opened when is tagged as `table_open` and close as `table_close`&#x20;

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

It will build into JSON object like this:

```json
[
  {
    "type": "ElementType.HEADING",
    "content": "Setup",
    "level": 2,
    "children": [
      {
        "type": "ElementType.HEADING",
        "content": "Setup",
        "level": 2,
        "children": []
      }
    ]
  }
]
```

Then, we build a section hierarchy. Typically, text, tables, formulas, and images are nested under a header. For example, Header 1 is the top-level header; all associated content is grouped under it. This ensures that related data stays together.

```json
[
  {
      "level": 1, //heading level, #, ##
      "content_elements": ["Some text here."],
      "subsections": [
        {
            "level": 2,
            "content_elements": ["More text."],
            "subsections": []
          }
      ]
  },
]
```

Then for each objects we merged `content_elements` with the `subsections` (notes: only merged content and subsections in the same object not other objects). Then we do chunking

<figure><img src="../.gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

If the chunk size is bigger than the `token limits + overlap tokens` we should split it into a new chunk. Each the text, paragraphs, code, tables have their own strategies for chunking

1. paragraphs/text, if its to long split it by sentence/clauses/words, if its to short merged it into one&#x20;
2. tables, if tables to large split by rows while still keep the table header
3. codes, split by lines
4. list, split by items

```json
[
  {
    "chunk_type": "table",
    "split_sequence": "24/27",
    "is_continuation": true,
    "section_path": "Inclusive of the years 1998-2000 only > Index",
    "document_id": "econ_nuclear",
    "token_count": 443,
    "content": "| Agricultural Bank of China, 221, 223, 225, 226, …"
  },
  {
    "token_count":447,
    "content":"| Agricultural Bank of China, 221, 223, 225, 226, …",
    "chunk_type":"table",
    "is_continuation":true,
    "section_path":"Inclusive of the years 1998-2000 only > Index",
    "document_id":"econ_nuclear",
    "split_sequence":"8/27"
  }
]
```

The `split_sequence` acts as an index to indicate which part of the content is being separated into a new chunk object.

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
