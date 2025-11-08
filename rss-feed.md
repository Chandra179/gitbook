# RSS Feed

## **Phase 1 (MVP)**

#### Goals

* Load & display feeds correctly in the UI.
* Add feed via URL or import OPML file.
* Mark items as read/unread.
* Support up to 10k items with smooth infinite/virtual scrolling.

#### Requirements (concise)

* Add feeds by URL or OPML import.
* Storage: **IndexedDB** (use Dexie.js).
* Separate stores: `feeds` + `items`.
* Enforce per-feed storage limit: **≤ 7 MB per feed** (soft cap enforced by app).
* Sanitize all HTML content (use DOMPurify) to prevent XSS.
* Let user opt into fetching images/media (toggle).
* Only fetch `https://` feeds; skip or warn on `http://`.
* CORS handling: Try to fetch, if CORS blocks skip and log error.
* Use virtualized rendering for lists (svelte-virtual-list).
* Manual refresh button for updating feeds, per feed not all of them.
* RSS Parser: Use `rss-parser` library (fallback: create custom parser if needed).
* Duplicate detection: Use content hash.
* Feed dies (404/timeout): Skip and log error with feed status.
* Storage quota exceeded: Show warning when approaching browser storage limit (80%+).  for  Storage Warning UI use persistent banner
* Malformed XML: Return error and log it.
* Feed metadata updates: If feed title/description changes, update it.
* UI layout:  sidebar for feed list
* Feed URL Input: "Add Feed" button
* Error Handling UI use  status indicator

### Tools to use

* **Frontend**: Svelte
* **Storage**: IndexedDB (via Dexie.js)
* **RSS Parsing**: rss-parser
* **HTML Sanitization**: DOMPurify
* **Virtual Scrolling**: svelte-virtual-list

### **Storage Notes**

* **IndexedDB total limit**: Usually 10-60% of available disk space (can be GBs, browser-dependent)
* **Per-feed 7MB limit**: Soft cap enforced by application code to prevent one feed from dominating storage

### Schema

#### Feeds

```json
{
  "id": "feed_01",               // string: unique feed id (hash of URL)
  "url": "https://example.com/rss.xml",
  "title": "Example RSS Feed",
  "description": "Tech news and articles",
  "lastFetchedAt": 1736323200000,
  "lastFetchStatus": "success",  // success | cors_error | not_found | malformed_xml | timeout
  "lastFetchError": null,        // error message if failed
  "totalSizeBytes": 3456789,     // bytes used by items of this feed
  "settings": {
    "fetchImages": false,
    "maxSizeBytes": 7340032      // 7 * 1024 * 1024
  }
}
```

#### Items

```json
{
  "id": "item_01",               // unique content id (hash of article link)
  "feedId": "feed_01",           // foreign key to feeds.id
  "title": "AI Breakthrough in 2025",
  "link": "https://example.com/ai-2025",
  "publishedAt": 1736323200000,
  "content": "Sanitized HTML...",
  "read": false,                 // flattened for easier indexing
  "contentHash": "3f8bc1...",    // 64-byte hash for deduplication
  "author": "John Doe",
  "sizeBytes": 5234              // bytes for this item (approx serialized size)
}

```
