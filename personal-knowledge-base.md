# Personal Knowledge Base

#### Concept

An intelligent search and retrieval layer for Markdown-based knowledge bases. It transforms static notes into a queryable brain by combining traditional text processing with vector embeddings.

#### Goals

* **High Precision Retrieval:** Ensure users find the exact context, not just the file.
* **Architectural Modularity:** Decouple the chunking logic and retrieval strategies to allow for experimentation with different LLMs or Vector DBs.
* **Cost Efficiency & Privacy:** Minimize token usage via RAG and support local embedding models to keep personal data private.
* **Low Latency:** Provide sub-second search results using optimized vector indexing.

#### Engine Components

* **Chunking Provider (Interface):**
  * _Recursive Character Splitting (Default):_ Splits by hierarchy (Paragraphs > Sentences > Words) with adjustable overlap to keep related ideas together.
  * _AST Parser:_ Optional module for code-heavy notes or structured frontmatter.
* **Vector Engine:** Go-based REST API managing the orchestration. It handles token counting to ensure chunks fit within the chosen model's maximum context window.
* **Storage:** Vector Database (Qdrant) for high-dimensional indexing and metadata filtering.

#### Chunking Trade-offs

| Strategy                | Pros                                                                                                  | Cons                                                                               | Best For                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Recursive Character** | Preserves semantic flow; handles irregular Markdown well; adjustable "overlap" prevents context loss. | Less aware of specific code logic or deep nested metadata.                         | General prose, journals, and conceptual notes. |
| **AST Parsing**         | Extremely precise for code snippets and frontmatter; understands file grammar.                        | Fragile; breaks on malformed Markdown; can create chunks too small for embeddings. | Technical documentation and code repositories. |

#### Architecture & Abstractions

* **Ingestion Pipeline:**
  * **Watcher (GitHub Webhook):** Listens for `push` events from the repository. Receives payloads detailing `added`, `modified`, and `removed` files.
  * **Filter:** Checks file paths against a `.pkbignore` configuration. Supports deep nested directories natively via absolute file paths.
  * **Fetcher:** Calls the GitHub REST API to pull the raw Markdown content for modified files.
  * **Processor:** Normalizes Markdown, strips YAML frontmatter, and handles image links.
  *   **Chunker (Modular):**

      ```go
      // Abstraction Contract
      type Chunker interface {
          Chunk(text string, metadata map[string]any) ([]DocumentChunk, error)
      }
      ```

      Routes text to either `RecursiveSplitter` or `ASTParser` based on file extensions.
* **Embedding Layer:**
  *   **Embedder (Modular):**

      ```go
      // Abstraction Contract
      type Embedder interface {
          Embed(text string) ([]float32, error)
          GetDimensions() int
      }
      ```
  * Implementations can be swapped between an `OpenAIClient` or a `LocalOllamaClient` (e.g., using `nomic-embed-text`).
  * Generates the vector and attaches the "Pointer" (File Path + Header/Line Number).
* **Retrieval Layer (Modular):**
  * **Strategy A (Dense Vector):** Pure cosine similarity for conceptual search.
  * **Strategy B (Hybrid):** Combines Vector Search with Keyword Matching (BM25) to ensure specific technical terms aren't missed.

#### Dependencies

* **Language:** Go (Golang)
* **Markdown Parser:** Goldmark (with custom extensions if needed for AST)
* **Vector DB:** Qdrant (Supports both local Docker and Cloud)
* **Embeddings:** Swappable between OpenAI (`text-embedding-3-small`) and Local Ollama instances.
* **Reference Notes:** chunking-and-embedding.md
