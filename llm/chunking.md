# Chunking

| Concept                                    | Academic Foundation                                  | Key Paper / Source                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Text-based / passage segmentation**      | Splitting long documents into retrieval units        | _"Passage Retrieval for Question Answering"_ (Tellex et al., 2003)                                                         |
| **Semantic chunking / topic segmentation** | Using semantic similarity to detect topic boundaries | _"Text segmentation based on semantic word embeddings"_ (Glavaš et al., 2016)                                              |
| **Sliding window / overlap**               | Maintaining context continuity in retrieval          | _"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"_ (Lewis et al., 2020) — original RAG paper by Facebook |
| **Paragraph- or heading-based chunking**   | Structuring docs to preserve topical coherence       | _"Hierarchical Document Embedding"_ (Yang et al., 2016)                                                                    |
| **Adaptive chunking (variable size)**      | Dynamic segmentation improves downstream tasks       | _"Learning to Segment Textual Data for Passage Retrieval"_ (Chen et al., 2021, ACL Findings)                               |
| **Chunk size effects**                     | Tradeoffs between recall and precision               | _"Impact of Document Segmentation on Passage Retrieval Performance"_ (Kaszkiel & Zobel, 1997)                              |

## Proven in Industry / Open Source

| System / Company                              | Method                                                                                            | Source                                                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **OpenAI evals / Cookbook / embeddings docs** | Fixed-size and overlap chunking (≈800–1000 tokens)                                                | [OpenAI Cookbook: Text Chunking](https://github.com/openai/openai-cookbook)                        |
| **LangChain**                                 | Many chunkers: RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter, HTMLHeaderTextSplitter | [LangChain Docs](https://python.langchain.com/docs/modules/data_connection/document_transformers/) |
| **LlamaIndex**                                | Heading-, semantic-, and sentence-based chunkers                                                  | [LlamaIndex Docs](https://docs.llamaindex.ai/en/stable/module_guides/loading/splitter/)            |
| **Databricks Mosaic AI**                      | HTML → Markdown normalization + hybrid chunking                                                   | MosaicAI blog (2024)                                                                               |
| **Anthropic Claude RAG**                      | Markdown-normalized text + overlap chunking                                                       | Anthropic retrieval demos                                                                          |
| **VoyageAI / Weaviate / Chroma**              | Token-based or semantic chunking                                                                  | Retrieval library docs                                                                             |
