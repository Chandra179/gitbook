# Oauth2

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
