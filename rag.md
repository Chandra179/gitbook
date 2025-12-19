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

when it comes to chunking we dont want to cut mid sentence or paragraph while chunking chunk text, for table and codeblock we want to keep it together as if we cut it it will lose meaning on the text. How to do that? first we build the markdown tree using **AST (Abstract Syntax Tree)** it can detect the opening and closing of elements,&#x20;

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

Then we build section hierarchy. Mostly text, tables, formula and image will be under a header. For example header 1 is the bigger header (top-level) then all the text, images, tables will into 1 group. This approach is made to keep track which sections belongs to which header, ex: `#header1 > ##header2 > tables` . But if the chunk size is bigger than the token limits, we should seperate it into new chunk while still keep track of the header. for example:

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

Each the text, paragraphs, code, tables have their own strategies for chunking

1. paragraphs/text, if it s to long split it by sentence/clauses/words, if its to short merged it into one&#x20;
2. tables, if tables to large split by rows
3. codes, split by lines
4. list, split by items

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
