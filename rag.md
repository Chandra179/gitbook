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

#### **AST (Abstract Syntax Tree)**

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

#### **Parser**

Parse the markdown to AST (Abstract Syntax Tree) structure&#x20;

```json
[
    {
        "type": "ElementType.HEADING",
        "content": "Setup",
        "level": 2,
        "metadata": {
            "tag": "h2"
        },
        "children": []
    },
    {
        "type": "ElementType.LIST",
        "content": "* Item 1\n* Item 2",
        "level": null,
        "metadata": {
            "is_ordered": false,
            "item_count": 2
        },
        "children": []
    },
    {
        "type": "ElementType.TABLE",
        "content": "| Col A | Col B |\n|---|---|\n| Val 1 | Val 2 |",
        "level": null,
        "metadata": {
            "num_rows": 2,
            "num_cols": 2,
            "has_header": true
        },
        "children": []
    }
]
```

#### Section Hierarchy

then we build section hierarchy. Usually text, tables, formula, image will be under a header. For example header 1 is the bigger header (top-level) then all the text, images, tables will be chunk into 1 like this

```json
[
  {
    "Section (h1: Title)": {
      "level": 1,
      "content_elements": ["Some text here."],
      "subsections": [
        {
          "Section (h2: Subtopic)": {
            "level": 2,
            "content_elements": ["More text."],
            "subsections": []
          }
        }
      ]
    }
  },
  {
    "Section (h1: Second Title)": {
      "level": 1,
      "content_elements": [],
      "subsections": []
    }
  }
]
```

#### Chunking

chunk the sections and subsections into 1 object

```json
[
    {
        "content": "Some text here.",
        "token_count": 3,
        "chunk_type": "paragraph",
        "section_path": "h1: Title",
        "is_continuation": false,
        "split_sequence": null,
    },
    {
        "content": "More text.",
        "token_count": 2,
        "chunk_type": "paragraph",
        "section_path": "h1: Title > h2: Subtopic",
        "is_continuation": false,
        "split_sequence": null,
    },
    {
        "content": "Second Title", 
        "token_count": 2,
        "chunk_type": "heading",
        "section_path": "h1: Second Title",
        "is_continuation": false,
        "split_sequence": null,
    }
]
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
