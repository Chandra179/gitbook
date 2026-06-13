---
title: "Oauth2 & Oidc"
aliases: []
tags: [cs, cs/oauth]
created: "2026-06-13"
---

# Oauth2 & Oidc

#### **Authorization URL**

Use PKCE (Proof Key for Code Exchange) to prevent authorization code injection, and `state` to prevent CSRF. Both are mandatory for security.

#### **Callback Handler**

Swaps the code for tokens and validates the ID Token signature/claims.

#### **Session Management**

Using `HttpOnly` cookies to protect against XSS (Cross-Site Scripting) and HTTPS only. Session should depends on interface so the concrete impl is changeable (i.e, in-memory, redis). Session TTL: Should match the Refresh Token TTL (or a fixed policy like "24 hours of inactivity").

#### **Access token**

Access Token TTL: Short (e.g., 5-15 minutes)

#### Refresh Token

Check if refresh attempt fails (e.g., the refresh token is expired). Handle failure gracefully: delete the session, force re-login (same as logout mechanism).

#### **Refresh Access token**

Don't wait for the token to actually expire and fail a request. Instead, check the token's age on every request and refresh it _before_ it dies. Refresh Token TTL: Long (e.g., 7-30 days)

**Concurrency Race**

If a user loads a dashboard that fires 5 API requests simultaneously (e.g., fetching profile, graph data, notifications, etc.), and their token is expired:

1. Request A sees expired token -> Starts Refreshing.
2. Request B sees expired token -> Starts Refreshing.
3. Request A gets a new Refresh Token (RT-2).
4. Request B tries to use the old Refresh Token (RT-1).
5. The OIDC provider sees RT-1 being used twice. It assumes theft and revokes everything. The user is logged out.

How to fix this?

* Simple Fix: Use a large "Leeway" (e.g., 5 minutes). It is statistically unlikely that a user makes requests _exactly_ at the moment of expiry if you refresh 5 minutes early.
* Robust Fix (Locking): If you use Redis, you can set a temporary "refresh\_in\_progress" lock. If Request B sees the lock, it waits 100ms and reads the session again (which will have the new token from Request A).

#### **Middleware**

For protected routes, require the user to be logged in first.

#### **Logout**

Delete the local session (destroy the session in Redis/Memory and clear the cookie).

### References

- [IETF RFC 6749 — OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749)
- [IETF RFC 7636 — PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
- [IETF RFC 6750 — Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [IETF RFC 6819 — OAuth 2.0 Threat Model](https://datatracker.ietf.org/doc/html/rfc6819)
- [Auth0 — Refresh Token Rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
- [Auth0 — OAuth 2.0 Best Practices](https://auth0.com/resources/ebooks/best-practices-for-oauth-and-oidc)
