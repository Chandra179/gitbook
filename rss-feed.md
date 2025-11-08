# RSS Feed

## **Phase 1 (MVP)**

#### Goals

* Load & display feeds correctly in the UI.
* Add feed via URL or import OPML.
* Mark items as read/unread.
* Support up to 10k items with smooth infinite/virtual scrolling.

#### Requirements (concise)

* Add feeds by URL or OPML import.
* Storage: **IndexedDB** (use Dexie.js recommended).
* Separate stores: `feeds` + `items`.
* Enforce per-feed storage limit: **≤ 7 MB per feed**.
* Sanitize all HTML content (use DOMPurify) to prevent XSS.
* Let user opt into fetching images/media (toggle).
* Only fetch `https://` feeds; skip or warn on `http://`.
* If CORS blocks a feed, skip (or show an error / suggest proxy in future).
* Use virtualized rendering for lists (react-window analogs for Svelte, e.g. svelte-virtual-list).

### Tools to use

* svelte for client
* we use browser storage indexedDB

### Schema

#### Feeds

```json
{
  "id": "feed_01",               // string: unique feed id (hash of URL)
  "url": "https://example.com/rss.xml",
  "title": "Example RSS Feed",
  "description": "Tech news and articles",
  "lastFetchedAt": 1736323200000,
  "totalSizeBytes": 3456789,    // bytes used by items of this feed
  "settings": {
    "fetchImages": false,
    "maxSizeBytes": 7340032      // default 7 * 1024 * 1024
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
  "content": "<p>Sanitized HTML...</p>",
  "state": {
    "read": false,
  },
  "metadata": {
    "contentHash": "3f8bc1...",  // 64-byte hash
    "author": "John Doe",
    "sizeBytes": 5234            // bytes for this item (approx serialized size)
  }
}

```
