# RAG

### Content Extraction

Use Docling to extract PDFs to markdown (including image, table, etc..)

### Structure-Aware Chunking

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

When doing chunking we don't want to cut mid-sentence or mid-paragraph. For tables and code blocks, we want to keep them together; if we cut them, the text will lose its meaning. How do we do that? First, we build a Markdown tree using an **AST (Abstract Syntax Tree)**, which can detect the opening and closing of elements,

for example: table is opened when is tagged as `table_open` and close as `table_close`

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

using markdown-it python to build it into JSON object like this:

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

Then, we build a section hierarchy. Instead of treating a document as a continuous stream of text, it groups content (tables, lists, paragraphs) under their respective headers. For example, Header 1 is the top-level header; all associated content is grouped under it.  example:

```md
# Header A
## Header A.1
<tables>
<list>

# Header B
<paragraph>
```

the structure will be:

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

If the chunk size is bigger than the `token limits` we should split it into a new chunk. Also adds `overlap context` before and after the current chunk for better retrieval. example:

<figure><img src="../.gitbook/assets/chunk_overlap.png" alt=""><figcaption></figcaption></figure>

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
    "chunk_type": "table",
    "split_sequence": "24/27",
    "is_continuation": true,
    "token_count": 443,
    "section_path": "Inclusive of the years 1998-2000 only > Index",
    "content": "| Agricultural Bank of China, 221, 223, 225, 226, …"
  },
  {
    "chunk_type":"table",
    "split_sequence":"8/27",
    "is_continuation":true,
    "token_count":447,
    "section_path":"Inclusive of the years 1998-2000 only > Index",
    "content":" 227, states that …",
  }
]
```

The `split_sequence` is an index to indicate which part of the content is being separated into a new chunk object.&#x20;

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

### **Retrieval**

since we are store **dense vector and sparse vector** we can do hybrid search, then we need combine the result into one using **RRF**. Then we re-rank the combined candidates using a cross-encoder.

* Qdrant have built in Reciprocal Rank Fusion (RRF) query
* Use **Re-ranker** `BAAI/bge-reranker-v2-m3`  with `CrossEncoder` from sentence-transformers
* Compress search results using `microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank` for saving context tokens space

### Checklist

\[ ] Implement RAGAS (or Arize Phoenix): Since most eval frameworks are Python-based, run a small sidecar service. Focus on three metrics:

* Faithfulness: Does the answer match the retrieved chunks?
* Context Recall: Did your hybrid search actually find the chunk that contains the answer?
* Answer Relevance: Does the response actually solve the user's intent?

\[ ] Document-Level Summarization: During ingestion, generate a 2-sentence summary of the entire file. Prepend this to every chunk's text before embedding.

\[ ] One-Sentence Chunk Context: For each chunk, use a fast model (Claude 3.5 Haiku or Gemini Flash) to explain where the chunk sits.

* _Prompt snippet:_ "Map this chunk to the document summary. Answer with one sentence: 'This chunk discusses \[X] in the context of \[Y].'"

\[ ] Implement HyDE (Hypothetical Document Embeddings): \* Generate a "fake" answer first.

* Embed the fake answer instead of the question.
* Why? A fake answer "looks" like your document chunks in vector space; a question does not.

\[ ] Multi-Query Expansion: Generate 3 variations of the user's query and run your Hybrid Search for all of them, then use your RRF (Reciprocal Rank Fusion) to merge the results.

\[ ] Relevance Filtering: Use your Cross-Encoder/Re-ranker scores to drop any chunks below a certain threshold (e.g., `< 0.7`).

\[ ] Citation Mapping: Ensure your final LLM output explicitly tags the chunks it used (e.g., "According to \[Source 1]...").

#### Reference

[https://www.oreilly.com/library/view/a-simple-guide/9781633435858/](https://www.oreilly.com/library/view/a-simple-guide/9781633435858/)
