# Deep Research

This document outlines the end-to-end pipeline for a deep research agent, from initial search to final structured knowledge extraction.

## Initiation & Dynamic Templating

The agent requires a clear goal and a structured template to extract specific, actionable results.

### **User Input**

* **Research Query**: The question or topic to investigate

### **Template System**

Templates define what data to extract and how to structure it. They're stored in PostgreSQL for easy updates without code changes.

```sql
CREATE TABLE research_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,  -- Router LLM uses this to select the right template
    schema_json JSONB NOT NULL, -- Defines the data structure to extract
    system_prompt TEXT NOT NULL,
    seed_questions JSONB NOT NULL -- 3-5 starting questions
);
```

### **Schema Definition**

The `schema_json` defines what fields to extract and provides guardrails for the LLM

```json
{
  "fields": {
    "sample_size": {
      "type": "integer",
      "description": "Total number of participants in the study"
    },
    "p_value": {
      "type": "float",
      "description": "The statistical significance value reported"
    }
  }
}
```

**Key Components**

* `type`: Tells the system how to cast the data in Python (e.g., `str`, `int`, `float`, `list`). This prevents "TypeErrors" during data synthesis.
* `description`: It tells the LLM exactly what to look for and how to interpret the text.

### Research Sessions

```sql
CREATE TABLE research_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    template_id UUID REFERENCES research_templates(id) NOT NULL,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'started',
    -- 'started', 'searching', 'crawling', 'processing', 'extracting', 'completed', 'failed'
    
    -- Progress metrics
    total_urls_found INTEGER DEFAULT 0,
    urls_crawled INTEGER DEFAULT 0,
    facts_extracted INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    -- Error tracking
    error_message TEXT
);
```

Track each research run from start to finish.

## Search & URL Collection

### Search Strategy

The system uses **SearXNG** (meta-search aggregator) to find relevant sources for each seed question.

### URL Deduplication

Before crawling, URLs are normalized and deduplicated to avoid processing the same content multiple times

1. **Normalize URLs**: Remove tracking parameters, convert to lowercase, standardize protocols

```
https://Example.com/page?utm_source=google → https://example.com/page
```

2. **Content Hash Check**: For already-crawled URLs, store a hash of the content to detect duplicates with different URLs

```
example.com/article/123 
example.com/print/article/123  → Same content, different URLs
```

3. **Domain Limits**: Restrict results per domain to ensure diversity (e.g., max 5 URLs from same domain)

### Relevance Scoring

Each URL is scored for relevance before crawling to prioritize high-quality sources:

**Scoring Factors:**

* **Query Match** (0-40 points): How well the URL/title matches the seed question
* **Domain Authority** (0-30 points): Trustworthiness of the source (.edu, .gov, known publishers)
* **Freshness** (0-15 points): Recency of publication
* **Content Type** (0-15 points): Preference for research papers, reports over forum posts

Only URLs scoring above a threshold (e.g., 50/100) are crawled.

### Storage

```sql
CREATE TABLE search_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES research_sessions(id) NOT NULL,
    seed_question TEXT NOT NULL,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    url_hash TEXT,
    relevance_score FLOAT NOT NULL,
    domain TEXT,
    status TEXT DEFAULT 'pending',  -- 'pending', 'crawled', 'skipped', 'failed'
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **Crawling**

Use **Crawl4AI** to fetch content from high-priority URLs:

```sql
CREATE TABLE raw_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_result_id UUID REFERENCES search_results(id) NOT NULL,
    content_type TEXT NOT NULL,     -- 'html', 'pdf', 'docx'
    raw_content BYTEA NOT NULL,     -- Binary storage
    content_hash TEXT UNIQUE,       -- Detect duplicate content
    crawl_status TEXT NOT NULL,     -- 'success', 'failed', 'timeout'
    error_message TEXT,
    crawled_at TIMESTAMP DEFAULT NOW()
);
```

**Key Features:**

* `content_hash`: Detects identical content from different URLs
* `search_result_id`: Links back to the original search query for traceability

## Content Processing

### Extraction

Use Docling to extract content from PDFs or HTML into Markdown format, ensuring all elements (including images and tables) are preserved.

### Structure-Aware Chunking

Parse Markdown into an Abstract Syntax Tree (AST) using **markdown-it.**&#x20;

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

<figure><img src=".gitbook/assets/chunk_overlap.png" alt=""><figcaption></figcaption></figure>

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

### **Embedding**

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

#### Dense vector embed config

* model\_name: `BAAI/bge-base-en-v1.5`
* tokenizer\_path: "tokenizer.json" or HuggingFace model ID
* max\_token\_limit: 512 (model's actual limit)
* model\_dim: 768 (embedding dimension)

#### Sparse vector embed config

* model\_name: `prithivida/Splade_PP_en_v1` (The industry standard for high-performance SPLADE embeddings).
* max\_token\_limit: `512` (Matches dense model's limit for consistency during chunking).

{% hint style="info" %}
the model config flexible, we can change it later
{% endhint %}

## **Collecting Facts**

Query the vector store using the research question to find relevant chunks. Use the LLM with the Pydantic model (from the template) to extract structured facts:

* **Schema Enforcement**: `Instructor` library ensures output matches template
* **Context Injection**: Provide `section_path` and `parent_section` for accurate interpretation

```sql
CREATE TABLE research_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES research_sessions(id) NOT NULL,
    
    -- Vector store reference (Qdrant chunk ID)
    source_chunk_id TEXT NOT NULL,
    
    -- PostgreSQL reference for traceability
    source_document_id UUID REFERENCES raw_documents(id),
    source_url TEXT NOT NULL,
    
    -- Which seed question led to this fact
    seed_question TEXT,
    
    -- Extracted structured data matching template schema
    fact_data JSONB NOT NULL,
    
    -- LLM confidence assessment (0-1)
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

Example `fact_data`&#x20;

```json
{
  "sample_size": 1247,
  "p_value": 0.032,
  "study_type": "RCT",
  "methodology": "Double-blind randomized controlled trial"
}
```
