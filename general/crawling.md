# Crawling

### URLs Collector

we need some urls to be crawled we can use **seed urls** and **browser automation** (where we collect the urls from browser search like google, brave, etc..)&#x20;

### Crawl Config

* If we crawling on the same site (domain) multiple times in short time range we can get blocked so we need IP rotation. We can use Residental/Tor proxy `zhaowde/rotating-tor-http-proxy`
* Domain whitelist, crawl only trusted domain
* handle URL visits deduplication avoid visiting same URL can cause infinite loop
* respect robots.txt
* rate limit request per domain, 10-15 req/sec, random delay
* define regex to skip junk URL, ex: `(contact|privacy|terms|faq|tag)`
