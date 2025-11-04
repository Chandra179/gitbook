# Oidc

[**https://openid.net/specs/openid-connect-core-1\_0.html**](https://openid.net/specs/openid-connect-core-1_0.html) **:** core

[https://openid.net/specs/openid-connect-discovery-1\_0.html](https://openid.net/specs/openid-connect-discovery-1_0.html) : discovery

[https://openid.net/specs/openid-connect-registration-1\_0.html](https://openid.net/specs/openid-connect-registration-1_0.html) : registration



**OIDC (OpenID Connect)** is an **authentication protocol** built on top of **OAuth 2.0**, designed to verify a user's identity and provide **basic profile information** about them.

* Think of OAuth 2.0 as a **way to authorize access** to resources (like letting an app read your Google Drive files).
* OIDC adds **authentication**, i.e., "Who are you?" in a standardized way.

OAuth 2.0 was often misused for authentication, even though it was designed for **authorization**. Apps would try to "log in" users using access tokens from OAuth 2.0, which was **insecure and inconsistent**. OIDC was created to:

* Provide a **secure, standardized way** to authenticate users using OAuth 2.0.
* Return **ID tokens** (JWT) containing user identity claims.
* Support **single sign-on (SSO)** and **identity federation**.

OIDC is **built on OAuth 2.0**, so:

* OAuth 2.0 handles **authorization** (granting access to resources).
* OIDC adds **authentication** (verifying identity).

OIDC allows apps to **log in users** without managing passwords themselves, delegating that to a trusted identity provider (IdP) like Google, Microsoft, or Okta.&#x20;

## **OIDC Properties**

1. **ID Token :** JWT containing user identity info (`sub`, `name`, `email`) and authentication details (`iss`, `aud`).
2. **UserInfo Endpoint :** Endpoint to fetch more user profile info if needed.
3. **Scopes :** `openid` → mandatory to use OIDC. `profile`, `email`, `address`, `phone` → optional claims.
4. **Claims :** data about the user (like email, name, picture).
5. **Discovery & Dynamic Registration** `.well-known/openid-configuration` endpoint allows apps to auto-configure.
6. **Standard Flows**
   * Authorization Code Flow (most secure for server apps)
   * Implicit Flow (for browser apps)
   * Hybrid Flow (mix of both)
