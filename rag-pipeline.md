---
description: e2e RAG pipeline from collecting data to agentic system
---

# RAG Pipeline

## URLs Collector

* Seed urls
* Collect urls by web search (Browser Automation) use [chromedp](https://github.com/chromedp/chromedp)

## Config

* IP rotation using Tor proxy to prevent blocked IP when visiting same site multiple times. use `zhaowde/rotating-tor-http-proxy`
* Domain whitelist
* Url deduplication (allow\_revisit : false)
* using colly queue for controlling resource (memory & cpu)
* respect robots.txt
* rate limit per domain, 10-15 req/sec, random delay
* Filter out non-HTML links
* estimate if a link/page is likely relevant _before_ visit the URLs (URL pattern). This helps avoid downloading irrelevant content, i.e. `/economy.com/about` it's a junk

## PreFiltering

Skip junk URL path or query param regex&#x20;

```go
(contact|privacy|terms|faq|tag|archive|about|signin|login|register|subscribe|feedback|cookies|sitemap)
```

## Content extraction

* Remove header and footer from body (junk)
* Kept pages if head title and meta\[description/content/property] relevant to given topic
* Word count (200-10000 words is sweet spot for most domains)
* Sentence count, Estimated by splitting text on `.`, `!`, and `?` . Ideal avg sentence length: 10–30 words
* Vocabulary richness (unique words / total words) `uinqueWords/totalWords` Low (<0.25) = repetitive or poor content. High (>0.6) = rare, may be fragmented; ideal ≈ 0.3–0.6
*   Final score

    ```
    Combines length, richness, and sentence metrics.
    Weighted as:
    - Length:   50%
    - Richness: 30%
    - Sentence: 20%
    Returns a score in range [0–100].
    ```

{% hint style="info" %}
Cleaning text will be handled by go-trafilatura package
{% endhint %}

## Chunking & Embed

* markdown chunking, refer to: [ChunkStrategies](https://nothin.gitbook.io/computing/llm/chunking)
* calculate the token for each chunk using [https://github.com/daulet/tokenizers](https://github.com/daulet/tokenizers) before doing embedding to avoid chunking token exceed model max token limit
* Embedding model will be modular, currenlty its using [http://ghcr.io/huggingface/text-embeddings-inference:cpu-latest](http://ghcr.io/huggingface/text-embeddings-inference:cpu-latest) `BAAI/bge-base-en-v1.5` , max 512 token

## Vector

* adjust vector size to chunking embed size, currenlty is 768
* metadata mandatory

```json
{
  "collection_name": "documents",
  "points": {
    "id": "",        
    "vectors": [],
    "payload": {
      "url": "url",
      "page_content": "However, the prevailing view was that held by ..."
      "metadata": {
        "title": "Economic Impact of Inflation",
        "author": "Jane Doe",
        "hostname": "economy.com",
        "date": "2025-10-10",
        "categories": ["economy", "politics"],
        "tags": ["economic analysis", "economic indicators"]
      }
    }
  },
}
```

## Content Retrieval

* Dense passage retriever
* Reranker model: `bge-reranker-large, cross-encoder/ms-marco-MiniLM-L-6-v2` these re-score top-k retrieved chunks for final ranking.
* Evaluate retrieval metrics: Build a small query–answer–source eval set. Track: `Recall@k, Precision@k MRR (Mean Reciprocal Rank)`
*   context assembly & formatting, structured context block

    ```
    [Source: economy.com | Date: 2025-10-10 | Title: Economic Impact of Inflation]
    Text snippet...
    ```
* Dynamic context length: Don’t always use fixed top-3 chunks. Use token-aware retrieval (stop before prompt exceeds model context)

## \[TBD] Content Evaluation

* Create 20–50 gold queries with known answers from your data.
* Evaluate:
  * Retrieval recall
  * LLM factual accuracy (manual or automated via LLM-as-judge)
  * Faithfulness (percentage of generated text supported by context)

## \[TBD] Content Enrichment

* NER + keyphrase extraction (e.g. spaCy or `flair` )
*   Store entities in metadata:

    ```json
    "entities": ["Bank of Indonesia", "GDP", "Inflation"],
    "keyphrases": ["monetary policy", "price stability"]
    ```
* Use these as **filters** or **boosters** in retrieval:
  * Query mentions → boost related documents.
  * Enables faceted retrieval and multi-hop search later.

## \[TBD] Graph RAG

## \[TBD] Model Finetune

* Extract named entities (people, organizations, etc.)
* Extract key phrases

## \[TBD] Agentic System

## Dependency

* For rotation IP free use [https://github.com/zhaow-de/rotating-tor-http-proxy](https://github.com/zhaow-de/rotating-tor-http-proxy)
* For browser automation use [https://github.com/chromedp/chromedp](https://github.com/chromedp/chromedp)
* For crawling/scraping use [https://github.com/gocolly/colly](https://github.com/gocolly/colly)
* For extraction use [https://github.com/go-shiori/go-readability](https://github.com/go-shiori/go-readability)

## Improvement

* consider using [https://github.com/unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) for crawling and LLM ready data or [https://www.firecrawl.dev/](https://www.firecrawl.dev/)
* or maybe using [https://github.com/docling-project/docling](https://github.com/docling-project/docling) if we still want to use golang as crawling and content extraction using python
* and [https://github.com/infiniflow/ragflow](https://github.com/infiniflow/ragflow) for RAG

