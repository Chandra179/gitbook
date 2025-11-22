---
description: collecting data for RAG
---

# Crawling Result

## Test result

simulating unlimited crawl visits with&#x20;

1. max depth 5 and 50 concurrent request per domain resulting in growing memory & goroutine size
2. max depth 3 and 3 concurrent request per domain also resulting in growing memory & goroutine
3. max depth 2 and 10 conccurent requst per domain

<figure><img src="../.gitbook/assets/image (1) (1) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

## Test Result 2

1. max depth 2 and 3 concurrent req per domain and resulting in more stable memory & goroutine usage
2. max depth 2 , 3 concurrent req, 2 seeds url still stable

<figure><img src="../.gitbook/assets/Screenshot from 2025-11-02 11-27-32.png" alt=""><figcaption></figcaption></figure>
