# RAG

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

using markdown-it python will build into JSON object like this:

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

We need to store **dense vector** from the embed result, and also create **sparse vector** using SPLADE (Sparse Lexical and Expansion Model). Why both? Using both allows us to implement Hybrid Search, which combines two different retrieval methods by using **Reciprocal Rank Fusion (RRF)**

#### Dense vector embed config

* model\_name: "BAAI/bge-base-en-v1.5"
* tokenizer\_path: "tokenizer.json" or HuggingFace model ID
* max\_token\_limit: 512 (model's actual limit)
* model\_dim: 768 (embedding dimension)

#### Sparse vector embed config

* model\_name: `"prithivida/Splade_PP_en_v1"` (The industry standard for high-performance SPLADE embeddings).
* max\_token\_limit: `512` (Matches dense model's limit for consistency during chunking).

### **Retrieval**

since we are store **dense vector and sparse vector** we can do hybrid search, then we need combine the result into one using **RRF**. Then we re-rank the combined candidates using a cross-encoder.

* Qdrant have built in Reciprocal Rank Fusion (RRF) query
* Use re-ranker `BAAI/bge-reranker-v2-m3`&#x20;

