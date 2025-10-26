# Chunking

* long or short document?
* embed model to use general or specialized domain (finance, medical, legal)
* length complexity of user queries
* what is the retrieved result used for? semantic search, QA, RAG, agentic workflow
* When a **sentence** is embedded, the resulting vector focuses on the sentence’s specific meaning.&#x20;
* When a **full paragraph or document** is embedded, the embedding process considers both the overall context and the relationships between the sentences and phrases within the text.&#x20;

## Chunking Method

* fixed size
* content-aware : adhere to structure to help inform the meaning of our chunks
* sentence & paragraph use NLTK or spacy
* [RecursiveCharacterTextSplitter](https://python.langchain.com/docs/how_to/recursive_text_splitter/) that tries to split text using separators in a given order. The default behavior of the splitter uses the \["\n\n", "\n", " ", ""]
* document structured based chunking (pdf, html, markdown, etc..) langchain [chunk and processes these for you](https://docs.pinecone.io/guides/assistant/files-overview). And LaTex
* semantic chunking
* contextual chunking, [https://www.anthropic.com/engineering/contextual-retrieval](https://www.anthropic.com/engineering/contextual-retrieval)

## References

[https://www.pinecone.io/learn/chunking-strategies/](https://www.pinecone.io/learn/chunking-strategies/)
