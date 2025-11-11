# Chunking

## Question to ask when choosing chunking strategies

* long or short document?
* embed model to use general or specialized domain (finance, medical, legal)
* length complexity of user queries
* what is the retrieved result used for? semantic search, QA, RAG, agentic workflow
* When a **sentence** is embedded, the resulting vector focuses on the sentence’s specific meaning.&#x20;
* When a **full paragraph or document** is embedded, the embedding process considers both the overall context and the relationships between the sentences and phrases within the text.&#x20;

## Chunking Method

production systems **do** end up with both short and long chunks depending on the content. It’s not always full for example 512 tokens. The key is: each chunk should be meaningful on its own and optimized for your downstream retrieval/generation pipeline.&#x20;

The “sweet spot” depends on your document type, model, and use case. As one of the blogs put it:  `The best chunking strategy depends on the type of documents you are working with and the needs of your RAG application.`

* fixed size
* content-aware : adhere to structure to help inform the meaning of our chunks
* sentence & paragraph use NLTK or spacy
* [RecursiveCharacterTextSplitter](https://python.langchain.com/docs/how_to/recursive_text_splitter/) that tries to split text using separators in a given order. The default behavior of the splitter uses the \["\n\n", "\n", " ", ""]
* document structured based chunking (pdf, html, markdown, etc..), [MarkdownTextSplitter](https://pkg.go.dev/github.com/tmc/langchaingo/textsplitter#MarkdownTextSplitter)
* semantic chunking
* contextual chunking, [https://www.anthropic.com/engineering/contextual-retrieval](https://www.anthropic.com/engineering/contextual-retrieval)

### **Markdown**

When you hit a new _top-level header_ (e.g. `#`), you start a **new chunk**, even if your current chunk has space left (tokens < 512).&#x20;

Why? Top-level headers usually represent **independent topics** — “Installation” and “Usage” don’t share much semantic overlap. Merging them would hurt retrieval precision, because a search for “How to install” might retrieve part of the “Usage” section instead.

**Example**

```
Chunk 1 → "# Introduction" (80 tokens)
Chunk 2 → "# Installation" (200 tokens)
Chunk 3 → "# Usage" (150 tokens)
Chunk 4 → "# Troubleshooting" (300 tokens)
```

Even if total < 512 per chunk, that’s okay — each chunk is coherent.

**✅ Pros**

* Excellent retrieval accuracy
* Each chunk is “about one thing”
* Easy to interpret search results

**❌ Cons**

* Average chunk sizes smaller (\~100–300 tokens)
* Slightly higher embedding storage cost

## References

* [https://www.pinecone.io/learn/chunking-strategies/](https://www.pinecone.io/learn/chunking-strategies/)
* [https://community.openai.com/t/embedding-tokens-vs-embedding-strings/463213](https://community.openai.com/t/embedding-tokens-vs-embedding-strings/463213)

