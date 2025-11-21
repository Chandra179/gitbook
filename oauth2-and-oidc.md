---
description: https://github.com/Chandra179/go-sdk/tree/main/pkg/oauth2
---

# Oauth2 & OIDC

## Actors

* Resource Owner – The user.
* Client – The application requesting access (e.g., Mobile App, SPA, Web Server).
* Authorization Server (AS) – Authenticates the user and issues tokens (Identity Provider).
* Resource Server (RS) – The API hosting protected resources (accepts Access Tokens).

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
* `redirect_uri` → where to send the code (Must strictly match the registered URI).
* `scope` → requested permissions
* `state` → random string to prevent CSRF attacks
* `code_challenge` → PKCE (Base64Url encoded SHA256 hash of the verifier).
* `code_challenge_method` → usually `S256`

After the  user authorizes → the server redirects back with a `code`. The client exchanges this code for tokens.

```
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTH_CODE&
redirect_uri=REDIRECT_URI&
client_id=CLIENT_ID&
code_verifier=CODE_VERIFIER&
client_secret=CLIENT_SECRET
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

PKCE prevents **authorization code interception** attacks, It cryptographically binds the authorization request to the token exchange request.

**Steps:**

1. Client generates a `code_verifier` (random string)
2. Client Creates a `code_challenge = base64url(SHA256(code_verifier))`
3. Client Sends `code_challenge` in the authorization request
4. When exchanging code for token, Client sends `code_verifier`
5. Server validates: `SHA256(code_verifier)` matches `code_challenge`

## **Refresh Token Rotation**

Every time you use a refresh token to get a new access token, the server issues a **new refresh token**. The old refresh token becomes invalid.

**Replay Detection**: If an attacker steals a refresh token and uses it, the valid client will fail when it tries to use the same (now invalid) token later. The server detects this "double use" and should revoke all tokens for that user immediately.

Its Ideal for Public Clients (SPAs/Mobile) where secrets cannot be stored securely.

## Refresh Token Revocation

Refresh tokens are long-lived and must be revocable. When a Refresh Token is revoked (manually or via rotation detection), the server must invalidate the entire grant chain (all related Access/Refresh tokens).

## OIDC

**OIDC (OpenID Connect)** is an authentication layer built on top of **OAuth 2.0**, designed to verify a user's identity.&#x20;

```
// ID Token Structure (JWT)
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

## Reference

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
