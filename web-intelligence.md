# SearXNG

This document outlines the end-to-end pipeline for connecting knowledge from web, from initial search to final structured knowledge extraction.

## Search

The system uses **SearXNG** (meta-search aggregator) to find relevant sources for each seed question.

```json
{
  "query": "machine learning tutorials",
  "number_of_results": 137000,
  "results": [
    {
      "title": "Machine Learning Tutorial - GeeksforGeeks",
      "url": "https://www.geeksforgeeks.org/machine-learning/machine-learning/",
      "content": "26 Dec 2025 — Machine Learning is mainly divided into three core types: Supervised, Unsupervised and Reinforcement Learning along with two additional types, Semi-Supervised ...",
      "engine": "google",
      "score": 4.0,
      "category": "general"
    },
    {
      "title": "The Ultimate Machine Learning Tutorial for 2026 | Learn Machine Learning",
      "url": "https://www.simplilearn.com/tutorials/machine-learning-tutorial",
      "content": "5 days ago — This Machine Learning tutorial helps you to understand what is machine learning, its applications, and how to become a machine learning engineer.",
      "engine": "brave",
      "score": 2.4,
      "category": "general"
    },
  ]
}
```

### Extraction

Use Docling to extract content from PDFs or HTML into Markdown format, ensuring all elements (including images and tables) are preserved. When visiting URLs protected by anti-bot measures, we must use stealth libraries like `undetected-chromedriver` for Selenium or `playwright-stealth` for Playwright to avoid detection.

##

