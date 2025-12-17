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
        "level": null, // Only used if type is HEADING
        "line_start": 45,
        "line_end": 47,
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
  "content": "The `_chunk_section` method recursively processes document elements...",
  "original_content": "The `_chunk_section` method recursively processes document elements...",
  "token_count": 45,
  "chunk_type": "code_explanation",
  "chunk_index": 12,

  // --- HIERARCHY / LINKING CONTEXT ---
  // This is how the chunk knows it belongs to "Methods" inside "Class Section"
  "section_path": "Introductiton",
  "section_level": 3,

  // --- RAG METADATA (Optional) ---
  "entities": {
    "PERSON": ["jacob", "adam"]
  },

  // --- MULTI-REPRESENTATION (for advanced RAG) ---
  "has_multi_representation": true,
  "natural_language_description": "Explanation of the recursive chunking logic.",
  "extra_metadata": {
    "file_type": ".py",
    "language": "python"
  }
}
```

then for each section we enrich it by adding context like \[Context before: ...] current context \[Context after: ...], extract entities, flag to check if `has_multi_representation, has_image, table_description, code_description`

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

**Metadata Schema**

```json
{
  "chunk_id": "econ_nuclear_738_3ca61ea9",
  "document_id": "econ_nuclear",
  "document_title": "econ_nuclear.md",
  "token_count": 18,
  "chunk_type": "paragraph",
  "section_path": "1. Power industry",
  "section_level": 2,
  "chunk_index": 738,
  "search_content": "Context: | | 2008 - 2009 Source : Ministry of Power, India, Annual Report , 2011, Delhi: Ministry of Power, 7. --- 1. Power industry Table 7. 2 Electricity demand projection at GDP growth of 8% and 9% --- Context: | | Projected peak demand (GW) | Projected peak demand (GW) | Installed capacity required (GW) | Installed capacity required (GW) | |-----------|------------------------------|------------------------------|------------------------------------|------------------------------------| | Year | 8% | 9% | 8% | 9% | | 2011-2012 | 158 | 168 | 220 | 233 | | 2016-2017 | 226 | 250 | 306 | 337 | | 2021-2022 | 323 | 373 | 425 | 488 | | 2026-2027 | 437 | 522 | 575 | 685 | | 2031-2032 | 592 | 733 | 778 | 960 |",
  "has_multi_representation": false,
  "has_image": false,
  "content": "Table 7. 2 Electricity demand projection at GDP growth of 8% and 9%"
}
```
