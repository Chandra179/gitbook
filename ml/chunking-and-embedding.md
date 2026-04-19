# Chunking

### Structure-Aware Chunking

Parse Markdown into an Abstract Syntax Tree (AST) using **markdown-it.**

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

## Recursive Chunker

Instead of treating the document as a raw string, the chunker first uses the `goldmark` library to parse the Markdown into an **Abstract Syntax Tree (AST)**.

* **Heading-Based Grouping:** The `extractSections` function identifies headings (`#`, `##`, etc.) and groups all subsequent paragraphs, lists, and blockquotes under that specific header.
* **Context Preservation:** By grouping by header, each chunk "knows" its location in the document hierarchy.
* **Plain Text Conversion:** The `nodeToPlainText` utility strips Markdown syntax (like link brackets or image tags) while preserving the inner text, ensuring the LLM focuses on content rather than formatting noise.

When a section exceeds the `chunkSize`, the `splitText` method applies a hierarchical "drill-down" approach. It attempts to split the text using a sequence of increasingly granular separators:

1. **Paragraphs** (`\n\n`)
2. **Lines** (`\n`)
3. **Sentences** (`.` )
4. **Words** ( )

#### Why this order?

The goal is to split the text at the **largest possible semantic boundary**. If a section can be split by paragraphs without breaking a single paragraph across chunks, the system prefers that over splitting in the middle of a sentence.

Once the text is split into small parts by the chosen separator, the `mergeSplits` function recombines them:

* **Filling the Buffer:** It adds parts to a chunk until adding one more would exceed the `chunkSize`.
*   **Overlap Injection:** When a chunk is finalized, the next chunk starts with an **overlap suffix** from the previous chunk.

    > **Benefit:** This "sliding window" ensures that semantic context isn't lost if a key piece of information is split exactly at the boundary of two chunks.

#### Fallback: Hard Splitting

In cases where a single string of text has no separators (e.g., a very long URL or a sequence of characters without spaces) and still exceeds the `chunkSize`, the logic falls back to `hardSplit`. This performs a literal cut based on `rune` indices to ensure the chunker never produces an invalid output size.

#### Before&#x20;

```
# Artificial Intelligence

Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals and humans. It is a broad field of study.

## Applications

AI is used in many fields today. Examples include medical diagnosis, electronic commerce, and robot control. It is truly everywhere.
```

#### After

```json
[
  {
    "Text": "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural",
    "FilePath": "intro.md",
    "Header": "Artificial Intelligence",
    "LineStart": 3
  },
  {
    "Text": "as opposed to the natural intelligence displayed by animals and humans. It is a broad field of study.",
    "FilePath": "intro.md",
    "Header": "Artificial Intelligence",
    "LineStart": 3
  },
  {
    "Text": "AI is used in many fields today. Examples include medical diagnosis, electronic commerce, and",
    "FilePath": "intro.md",
    "Header": "Applications",
    "LineStart": 7
  },
  {
    "Text": "electronic commerce, and robot control. It is truly everywhere.",
    "FilePath": "intro.md",
    "Header": "Applications",
    "LineStart": 7
  }
]
```

* **Semantic Integrity**: The split for the first section happened at a space between "natural" and "intelligence" because the chunker couldn't fit the whole paragraph.
* **Contextual Overlap**: In the second chunk, the text begins with `"as opposed to the natural"`. This is the 20-character overlap that ensures the LLM doesn't lose the start of the thought.
* **Metadata Extraction**: Even though the "Applications" section was split into two chunks, both retain the `Header: "Applications"`. This is crucial for RAG systems to know which topic the text belongs to.
