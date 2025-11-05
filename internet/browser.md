---
description: browser related features and properties
---

# Browser

## Browser Storage

| Feature                | Cookie                                | Local Storage                | Session Storage              |
| ---------------------- | ------------------------------------- | ---------------------------- | ---------------------------- |
| Sent to server         | ✅ Yes (automatically per request)     | ❌ No                         | ❌ No                         |
| Lifetime               | Defined by expiration or browser exit | Stays until manually cleared | Removed when tab closes      |
| Max size               | \~4KB                                 | \~5–10MB                     | \~5MB                        |
| Access via JS          | ✅ Unless HttpOnly                     | ✅                            | ✅                            |
| Stores sensitive data? | ✅ Safest (with HttpOnly + Secure)     | ❌ Never store sensitive data | ❌ Never store sensitive data |

### **Cookie**

**Cookie** is a small piece of data that a website stores on your device (computer, phone, tablet) via the web browser. Cookies are primarily used to:

* Maintain login sessions (session IDs).
* Store user preferences (language).
* Track user behavior (analytics/ads).

**How long the data stays / when it is removed:**

* If an expiration date (`Expires` or `Max-Age`) is set → persists until that date.
* If no expiration is set → becomes a **session cookie** and is removed when the browser closes.
* Can be deleted via:
  * Server (by setting expiration to past).
  * Browser settings.

**Security concerns:**

* Cookies can be stolen via **XSS** if not protected.
* If `Secure` and `HttpOnly` flags are not used → vulnerable.
* Best option for authentication:
  * `HttpOnly` prevents JavaScript access.
  * `Secure` enforces HTTPS.

### **Local Storage**

Local Storage is a built-in browser storage that allows a website to store data **on your device**, and this data is **not automatically sent to the server**. Local Storage is primarily used to:

* Save persistent user preferences (theme mode, language).
* Keep application state (shopping cart items).
* Cache non-sensitive data for performance.

**How long the data stays / when it is removed:**

* It stays **forever** until:
  * The website removes it via JavaScript (`localStorage.removeItem()` or `localStorage.clear()`).
  * The user clears browser data manually.
  * Browser storage eviction happens (low disk space).

**Security concerns:**

* Accessible via JavaScript → **vulnerable to XSS attacks**.
* Should **never store passwords, tokens, or sensitive data**.
* Data is not encrypted by default.

### **Session Storage**

Session Storage is similar to Local Storage but **only lasts for the duration of a browser tab**. Session Storage is primarily used to:

* Store temporary data for the session (multi-step forms).
* Keep tab-specific UI state (scroll position, temporary filters).
* Ensure data doesn’t leak across browser tabs.

**How long the data stays / when it is removed:**

* It is automatically removed:
  * When the browser **tab is closed**.
  * When the tab navigates to a completely different domain.
* The website can also remove it via JavaScript (`sessionStorage.removeItem()` or `sessionStorage.clear()`).

**Security concerns:**

* Same as Local Storage, vulnerable to **XSS** (JavaScript can read it).
* Mildly safer than Local Storage (shorter lifetime), but **still not for sensitive data**.

## Browser Security

<table data-full-width="true"><thead><tr><th>Mechanism</th><th width="209.41552734375">Enforced by</th><th width="206.6500244140625">Protects against</th><th>Summary</th></tr></thead><tbody><tr><td><strong>Same-Origin Policy (SOP)</strong> <em>(foundation)</em></td><td>Browser</td><td>Unauthorized cross-site access</td><td>Core rule: scripts from origin A can't access resources of origin B. EVERYTHING ELSE builds on this.</td></tr><tr><td><strong>CORS (Cross-Origin Resource Sharing)</strong></td><td>Browser (server opt-in)</td><td>Unauthorized cross-site <strong>reads</strong> (AJAX)</td><td>Relaxation mechanism of SOP, server decides allowed origins.</td></tr><tr><td><strong>SameSite Cookies</strong></td><td>Browser (server opt-in)</td><td>CSRF</td><td>Prevents cookies from being sent on cross-site requests.</td></tr><tr><td><strong>Content Security Policy (CSP)</strong></td><td>Browser (server opt-in)</td><td>XSS &#x26; data exfiltration</td><td>Tells browser where scripts/styles can load from (whitelists).</td></tr><tr><td><strong>X-Frame-Options / <code>frame-ancestors</code> (CSP)</strong></td><td>Browser</td><td>Clickjacking</td><td>Prevents your site from being embedded in <code>&#x3C;iframe></code>.</td></tr><tr><td><strong>CORB (Cross-Origin Read Blocking)</strong></td><td>Browser</td><td>Side-channel data leaks</td><td>Extra layer to prevent reading of sensitive MIME types cross-origin.</td></tr><tr><td><strong>Fetch Metadata Request Headers</strong> (<code>Sec-Fetch-Site</code>, <code>Sec-Fetch-Mode</code>)</td><td>Browser</td><td>CSRF, cross-site probing</td><td>Browser tells server context of request (same-site, cross-site). Useful for CSRF mitigation.</td></tr><tr><td><strong>Referrer-Policy</strong></td><td>Browser</td><td>Leaking sensitive URLs</td><td>Controls what referrer data is shared cross-origin.</td></tr><tr><td><strong>Permissions-Policy</strong> (formerly Feature-Policy)</td><td>Browser</td><td>Abuse of powerful APIs</td><td>Controls access to camera/mic/geolocation/etc, per-origin.</td></tr></tbody></table>
