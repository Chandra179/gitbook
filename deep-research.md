# Deep Research

### Initiation & Dynamic Templating

To prevent "abstract" results, the user must provide a Goal and a Template.&#x20;

* The query (e.g., "Ancient Roman Economy") + Depth Limit (e.g., 3 levels).
* Instead of hardcoding every field, the system uses a `templates` table in PostgreSQL.
  * If the user selects "History," the agent pulls a JSON definition: `{"event": "str", "date": "str", "impact": "str"}`.
  * Use `pydantic.create_model()` to turn this JSON into a live Pydantic class at runtime.
* An LLM generates the first 3–5 "Seed Questions" based on the template to kickstart the research.

### Processing Pipeline (HTML to Fact)

Raw data is messy. Your system cleans it through a three-stage "Sifter."

1. Extraction (Crawl4AI/Docling): Converts HTML, PDF, or EPUB into Markdown.
2. Semantic Chunking: The Markdown is split based on headers (`#`, `##`). Each chunk is converted into a vector ($$1536$$ dimensions) using `pgvector`.
3. The LLM reads the Markdown and populates your Dynamic Pydantic Schema.
   * The Save: The result is stored in a `JSONB` column named `extracted_facts`.

### Recursive Discovery & Lead Identification

This is how the agent "digs deeper" without getting lost. Every time a page is processed, the Discovery Node runs.

#### Lead Identification

The agent looks at the `extracted_facts` and asks: _"What is mentioned here that we don't fully understand yet?"_

* Citations/References: If the Markdown contains a link or a mention of a "Source," it is extracted.
* Conceptual Leads: If the text mentions "The Edict of Diocletian" but provides no details, the agent creates a new Sub-Question Task.

#### Link Extraction & Priority

Not all links are useful.

* Scoring: Every link is assigned a Priority Score ($$0.0$$ to $$1.0$$) based on how closely its anchor text matches the Original Question Vector.
* Pruning: Links with a score $$< 0.5$$ or those that exceed the Depth Limit are discarded.
* Task-ification: Validated links are pushed into a Redis Priority Queue as new "Scout" tasks.

### Storage Strategy

To handle 10,000+ data points, your PostgreSQL setup uses specialized indexes for speed.

<table><thead><tr><th width="187.199951171875">Feature</th><th width="182.20001220703125">Implementation</th><th>Purpose</th></tr></thead><tbody><tr><td>Vector Search</td><td><code>pgvector</code> with HNSW Index</td><td>Prevents duplicate research and finds relevant context in <span class="math">&#x3C; 5ms</span>.</td></tr><tr><td>Fact Storage</td><td><code>JSONB</code></td><td>Stores dynamic facts (Economy, History, etc.) in one column.</td></tr><tr><td>Relationship Map</td><td><code>parent_node_id</code> (Self-referencing)</td><td>Tracks the "Lineage" of how one topic led to another.</td></tr><tr><td>Fast Deduplication</td><td>B-tree Index on <code>url</code> and <code>question_text</code></td><td>Skips redundant work instantly.</td></tr></tbody></table>

### Presentation & Synthesis

Once the depth limit is reached or the queue is empty, the Synthesis Node assembles the final report.

* Table Format: Flattens the `JSONB` facts into a CSV/Markdown table.
* Graph Format: Uses the `parent_node_id` to generate a Mermaid or D3.js visualization showing how the topics are connected.
* Text/PDF: Uses an LLM to write a cohesive narrative using the `extracted_facts` as the only source of truth (reducing hallucinations).

### Technical Stack

* Search: SearXNG (for free, privacy-focused multi-engine search).
* Scraping: Crawl4AI (fast, AI-ready Markdown output).
* Logic: Instructor + Pydantic (for strictly structured data).
* Storage: PostgreSQL + `pgvector` (for the "everything" database).
* Queue: Redis (for managing prioritized research tasks).
