# Oauth2 & OIDC

[https://www.rfc-editor.org/rfc/rfc6749](https://www.rfc-editor.org/rfc/rfc6749) **:** oauth2 core

[https://www.rfc-editor.org/rfc/rfc6750](https://www.rfc-editor.org/rfc/rfc6750) : bearer token

[https://www.rfc-editor.org/rfc/rfc6819](https://www.rfc-editor.org/rfc/rfc6819) : threat model

[https://www.rfc-editor.org/rfc/rfc7009](https://www.rfc-editor.org/rfc/rfc7009) : token revocation

[https://www.rfc-editor.org/rfc/rfc7662](https://www.rfc-editor.org/rfc/rfc7662) : token introspection

[https://www.rfc-editor.org/rfc/rfc7636](https://www.rfc-editor.org/rfc/rfc7636) : pkce

[https://www.rfc-editor.org/rfc/rfc7523](https://www.rfc-editor.org/rfc/rfc7523) : jwt profile

## **Actor**

* **Resource Owner** – The user
* **Client** – Your application requesting access
* **Authorization Server** – Issues tokens
* **Resource Server** – Hosts the protected resources

## Flow

Client redirect users to authorization server

```
GET /authorize?
  response_type=code&
  client_id=CLIENT_ID&
  redirect_uri=REDIRECT_URI&
  scope=read write&
  state=STATE&
  code_challenge=CODE_CHALLENGE&
  code_challenge_method=S256
```

**Key parameters:**

* `response_type=code` → asks for an authorization code
* `client_id` → identifies your app
* `redirect_uri` → where to send the code
* `scope` → requested permissions
* `state` → random string to prevent CSRF attacks
* `code_challenge` → PKCE (Proof Key for Code Exchange)
* `code_challenge_method` → usually `S256`

Then User logs in & authorizes → server sends **authorization code** to `redirect_uri`  then client exchange code for access token:

```
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTH_CODE&
redirect_uri=REDIRECT_URI&
client_id=CLIENT_ID&
code_verifier=CODE_VERIFIER
```

**Key parameters:**

* `grant_type=authorization_code` → type of flow
* `code` → authorization code received
* `redirect_uri` → must match original request
* `client_id` → identifies app
* `code_verifier` → PKCE verification

then server return token

```
{
  "access_token": "ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "REFRESH_TOKEN"
}
```

## **PKCE (Proof Key for Code Exchange)**

PKCE prevents **authorization code interception** attacks, especially in public clients like mobile apps.

**Steps:**

1. Client generates a `code_verifier` (random string)
2. Creates a `code_challenge = base64url(SHA256(code_verifier))`
3. Sends `code_challenge` in the authorization request
4. When exchanging code for token, sends `code_verifier`
5. Server validates: `SHA256(code_verifier)` matches `code_challenge`

## Refresh Token

### **Refresh Token Rotation**

* Every time you use a refresh token to get a new access token, the server issues a **new refresh token**.
* The old refresh token becomes invalid.
* **Advantages:**
  * Prevents replay attacks
  * If a stolen refresh token is used, it’s detected immediately
* **Notes:**
  * Server must maintain a **one-time-use list** or track issued refresh tokens
  * Works well with mobile & SPAs

### **Silent Refresh (Browser / SPA)**

* Often used in **Single Page Apps (SPA)** where you can’t store refresh tokens securely.
* **Mechanism:**
  1. Browser opens a hidden iframe pointing to the authorization server
  2. Sends the `prompt=none` parameter (no user interaction)
  3. If user is still logged in on the authorization server, a new access token is returned
* **Pros:** seamless user experience
* **Cons:**
  * Depends on cookies and browser login session
  * Not always possible with strict SameSite / cross-origin policies

## Token Revocation

* Log out users immediately
* Revoke compromised credentials
* Handle lost devices or stolen tokens
* Enforce security policies (e.g., user disables app access)

<table><thead><tr><th width="188.59375">Token Type</th><th>Revocation Reason</th></tr></thead><tbody><tr><td><strong>Access Token</strong></td><td>Compromised session, logout, user disables app</td></tr><tr><td><strong>Refresh Token</strong></td><td>Lost device, stolen token, rotation expiration</td></tr></tbody></table>

Access Token Revocation

* Keep track of **active access tokens** in a database or cache
* When a token is revoked → mark it invalid
*   Or using Token versioning / “jti” claim: store token ID and version; revoke by incrementing user version

    ```
    {
      "sub": "1234567890",          // user ID
      "name": "Alice",
      "iat": 1699123456,            // issued at (timestamp)
      "exp": 1699127056,            // expiration time
      "jti": "abc123-1"             // token ID + version
    }
    ```

Refresh Token Revocation

* Long-lived → much higher risk if compromised
* Can be **rotated**: old token becomes invalid on use
* Must be **revocable** for security compliance (e.g., GDPR, bank apps)

#### **Revocation Strategies**

**Server-side revocation endpoint** (RFC 7009)

```
POST /revoke
Content-Type: application/x-www-form-urlencoded

token=REFRESH_TOKEN
token_type_hint=refresh_token
client_id=CLIENT_ID
client_secret=CLIENT_SECRET
```

**Rotation-based revocation**

* Every use of refresh token → new token issued, old one invalidated
* Replay detection → reject requests with old tokens

**Blacklist / Database**

* Store all active refresh tokens per user/app
* On logout or suspicious activity → remove token from DB

When a refresh token is revoked:

* **Invalidate all related access tokens** immediately
* Prevent further access using both token types
* This is called **“cascading revocation”**

**Auditing**

* Log revocation events for compliance and security monitoring
* Detect unusual activity (e.g., refresh token reuse, multiple devices)

## OIDC

[**https://openid.net/specs/openid-connect-core-1\_0.html**](https://openid.net/specs/openid-connect-core-1_0.html) **:** core

[https://openid.net/specs/openid-connect-discovery-1\_0.html](https://openid.net/specs/openid-connect-discovery-1_0.html) : discovery

[https://openid.net/specs/openid-connect-registration-1\_0.html](https://openid.net/specs/openid-connect-registration-1_0.html) : registration

**OIDC (OpenID Connect)** is an **authentication protocol** built on top of **OAuth 2.0**, designed to verify a user's identity and provide **basic profile information** about them.

* Think of OAuth 2.0 as a **way to authorize access** to resources (like letting an app read your Google Drive files).
* OIDC adds **authentication**, i.e., "Who are you?" in a standardized way.

OAuth 2.0 was often misused for authentication, even though it was designed for **authorization**. Apps would try to "log in" users using access tokens from OAuth 2.0, which was **insecure and inconsistent**. OIDC was created to:

* Provide a **secure, standardized way** to authenticate users using OAuth 2.0
* Return **ID tokens** (JWT) containing user identity claims.
* Support **single sign-on (SSO)** and **identity federation**.

| Endpoint                                                   | Purpose                                                                              | Notes                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| **UserInfo Endpoint** `/userinfo`                          | Fetch user profile info using access token                                           | Optional but standard in OIDC |
| **Discovery Endpoint** `/.well-known/openid-configuration` | Allows client to dynamically learn IdP endpoints, supported claims, and signing keys | Helps automatic client setup  |
| **Dynamic Client Registration** `/register`                | Register clients automatically                                                       | Optional                      |

```
{
  "iss": "https://accounts.example-idp.com",
  "sub": "248289761001",
  "aud": "myapp123",
  "exp": 1699127056,
  "iat": 1699123456,
  "nonce": "n-0S6_WzA2Mj",
  "name": "Alice",
  "email": "alice@example.com"
}
```

* Contains **identity claims** (`sub`, `name`, `email`) not present in OAuth2 access tokens.
* **Must be verified** (signature, issuer, audience, expiration, nonce).
* Can be used **instead of querying user info** for basic identity.

| Parameter       | Purpose                                                                   | Notes                                                                                      |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `scope=openid`  | Required to initiate OIDC                                                 | OAuth2 scopes like `read write` are still allowed, but `openid` triggers ID token issuance |
| `nonce`         | Protect against **replay attacks**                                        | Returned in ID token; must match original request                                          |
| `prompt`        | Control login/consent (`none`, `login`, `consent`)                        | Optional                                                                                   |
| `max_age`       | Force re-authentication if session older than N seconds                   | Optional                                                                                   |
| `login_hint`    | Suggests user identity to IdP                                             | Optional, e.g., email                                                                      |
| `id_token_hint` | Send existing ID token to IdP                                             | Useful for logout or session management                                                    |
| `response_mode` | How authorization response is returned (`query`, `fragment`, `form_post`) | Optional; affects front-end apps                                                           |

OIDC mostly reuses the OAuth2 Authorization Code Flow, but adds these steps:

1. **Authorization request includes `scope=openid` and `nonce` (optional)**.
2. **Server returns an ID token** along with access token.
3. **Client verifies ID token**:
   * Check **signature** (against IdP public key).
   * Validate **claims**: `iss`, `aud`, `exp`, `nonce`.
   * Extract identity info (`sub`, `name`, `email`).
4.  **Optional UserInfo request**:\


    ```
    GET /userinfo
    Authorization: Bearer ACCESS_TOKEN
    ```

| Feature                            | OAuth2                         | OIDC (New)                                                                   |
| ---------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| Purpose                            | Authorization                  | Authentication + Authorization                                               |
| Mandatory Scope                    | `read write` (resource scopes) | `openid` (triggers ID token)                                                 |
| ID Token                           | ❌                              | ✅ JWT with user claims                                                       |
| User Info                          | ❌                              | ✅ `/userinfo` endpoint                                                       |
| Discovery                          | ❌                              | ✅ `/.well-known/openid-configuration`                                        |
| New params                         | ❌                              | `nonce`, `prompt`, `max_age`, `login_hint`, `id_token_hint`, `response_mode` |
| Verification                       | Optional                       | ✅ ID token must be verified (signature & claims)                             |
| PKCE / Refresh Tokens / Revocation | ✅                              | ✅ reused from OAuth2                                                         |
