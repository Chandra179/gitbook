# Browser Storage

| Feature                | Cookie                                | Local Storage                | Session Storage              |
| ---------------------- | ------------------------------------- | ---------------------------- | ---------------------------- |
| Sent to server         | ✅ Yes (automatically per request)     | ❌ No                         | ❌ No                         |
| Lifetime               | Defined by expiration or browser exit | Stays until manually cleared | Removed when tab closes      |
| Max size               | \~4KB                                 | \~5–10MB                     | \~5MB                        |
| Access via JS          | ✅ Unless HttpOnly                     | ✅                            | ✅                            |
| Stores sensitive data? | ✅ Safest (with HttpOnly + Secure)     | ❌ Never store sensitive data | ❌ Never store sensitive data |

## **Cookie**

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

## **Local Storage**

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

## **Session Storage**

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

