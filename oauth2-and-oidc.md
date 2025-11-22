---
description: https://github.com/Chandra179/go-sdk/tree/main/pkg/oauth2
---

# Oauth2 & OIDC

### Actors

* Resource Owner – The user.
* Client – The application requesting access (e.g., Mobile App, SPA, Web Server).
* Authorization Server (AS) – Authenticates the user and issues tokens (Identity Provider).
* Resource Server (RS) – The API hosting protected resources (accepts Access Tokens).

### Token Flow

Client redirected to authorization server

```
GET /authorize?
  response_type=code&
  client_id=CLIENT_ID&
  redirect_uri=REDIRECT_URI&
  scope=read+write+idtoken&
  state=STATE&
  code_challenge=CODE_CHALLENGE&
  code_challenge_method=S256
```

**Parameters:**

* `response_type=code` → asks for an authorization code
* `client_id` → identifies your app
* `redirect_uri` → where to send the code (Must strictly match the registered URI).
* `scope` → requested permissions, add openid for oidc
* `state` → random string to prevent CSRF attacks. Without it, an attacker could trick a user into clicking a link that silently links the user's account to the attacker's identity provider account.
* `code_challenge` → PKCE (Base64Url encoded SHA256 hash of the verifier).
* `code_challenge_method` → usually `S256`

After authorizes the server redirects back with a `code`  which is to callback endpoint. then The client exchanges this code for tokens

```
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTH_CODE&
redirect_uri=REDIRECT_URI&
client_id=CLIENT_ID&
code_verifier=CODE_VERIFIER&
# client_secret=CLIENT_SECRET  <-- ONLY for Confidential Clients (Web Servers). SPAs/Mobile omit this.
```

**Key parameters:**

* `grant_type=authorization_code` → type of flow
* `code` → authorization code received
* `redirect_uri` → must match original request
* `client_id` → identifies app
* `code_verifier` → The original random string used to create the challenge (PKCE verification).

then server return token

```
{
  "access_token": "ACCESS_TOKEN",
  "id_token": "eyJhbGci...",       // Returned because scope included 'openid'
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "REFRESH_TOKEN"
}
```

### **PKCE (Proof Key for Code Exchange)**

PKCE was originally designed to secure **public clients** (e.g., mobile apps, single-page web apps) that **cannot safely store a client secret**

Without PKCE, a mobile device could accidentally deliver the login code to a malicious app instead of your app. That app could then use the code to get access to the user’s account.

PKCE prevents this by adding a secret (`code_verifier`) that only your app knows. Even if someone intercepts the login code, they **cannot use it** without that secret. Only the app that started the login process can complete it safely.

```
What can happen without PKCE:
1. User logs in via your app’s login screen.
2. OAuth server redirects to myapp://callback?code=AUTH_CODE.
3. The OS sees two apps claiming the same URL scheme. If the malicious app is chosen (or it “wins” registration somehow), it receives the code instead of your legitimate app.
4. The malicious app now has the authorization code and can exchange it for an access token at the OAuth server.
```

### **Refresh Token**

Every time you use a refresh token to get a new access token, the server issues a **new refresh token**. The old refresh token becomes invalid.

**Replay Detection**: If an attacker steals a refresh token and uses it, the valid client will fail when it tries to use the same (now invalid) token later. The server detects this "double use" and should revoke all tokens for that user immediately.

Refresh tokens are long-lived and must be revocable. When a Refresh Token is revoked (manually or via rotation detection), the server must invalidate the entire grant chain (all related Access/Refresh tokens).

### Where do I store the token?

For browser-based applications (SPAs), developers often default to **LocalStorage** because of its ease of implementation, but this exposes the application to Cross-Site Scripting (XSS) attacks; if any malicious JavaScript runs on your page, it can scrape your tokens and impersonate the user.&#x20;

**HttpOnly Cookies** offer a more secure alternative by making the token inaccessible to client-side JavaScript, effectively neutralizing XSS token theft, though this reintroduces the risk of Cross-Site Request Forgery (CSRF) which must be mitigated with strict `SameSite` policies.

The modern "Gold Standard" for web security is the Backend for Frontend (BFF) pattern. Instead of the browser handling access tokens directly, a lightweight server-side proxy (the BFF) handles the token exchange and storage. The BFF issues a secure, encrypted **session cookie** to the browser. When the browser makes an API request, it sends the cookie to the BFF.

For Mobile applications tokens should always be stored in the operating system’s secure hardware-backed storage, such as the iOS Keychain or Android Keystore.

### Unhappy Path

* if the user clicks "Cancel" on the consent screen, the Authorization Server will redirect back to your `redirect_uri` with an `error` parameter instead of a `code`&#x20;
* Common error codes include `access_denied` (user rejected the request), `unauthorized_client` (app is not allowed to use this flow), or `invalid_scope`. Your client application must parse these parameters to display helpful feedback to the user rather than crashing or hanging in an infinite loading state.
* network failures during the token exchange or expired authorization codes (which are often valid for only 30-60 seconds) require retry logic or prompting the user to restart the flow.

### Scopes and Granularity

* Scopes are the mechanism used to enforce the Principle of Least Privilege, ensuring that a client application only has access to the specific resources it needs and nothing more
* `read` and `write` are common examples, production environments use granular scopes like `files:read_only` or `billing:manage` to limit the blast radius if a token is compromised.
* A important scope is `offline_access`; in many implementations, this is the specific trigger required for the server to issue a Refresh Token, allowing the app to maintain a session after the user closes their browser.

### Reference

[https://www.rfc-editor.org/rfc/rfc6749](https://www.rfc-editor.org/rfc/rfc6749) **:** oauth2 core

[https://www.rfc-editor.org/rfc/rfc6750](https://www.rfc-editor.org/rfc/rfc6750) : bearer token

[https://www.rfc-editor.org/rfc/rfc6819](https://www.rfc-editor.org/rfc/rfc6819) : threat model

[https://www.rfc-editor.org/rfc/rfc7009](https://www.rfc-editor.org/rfc/rfc7009) : token revocation

[https://www.rfc-editor.org/rfc/rfc7662](https://www.rfc-editor.org/rfc/rfc7662) : token introspection

[https://www.rfc-editor.org/rfc/rfc7636](https://www.rfc-editor.org/rfc/rfc7636) : pkce

[https://www.rfc-editor.org/rfc/rfc7523](https://www.rfc-editor.org/rfc/rfc7523) : jwt profile

[https://openid.net/specs/openid-connect-core-1\_0.html](https://openid.net/specs/openid-connect-core-1_0.html) **:** core

[https://openid.net/specs/openid-connect-discovery-1\_0.html](https://openid.net/specs/openid-connect-discovery-1_0.html) : discovery

[https://openid.net/specs/openid-connect-registration-1\_0.html](https://openid.net/specs/openid-connect-registration-1_0.html) : registration
