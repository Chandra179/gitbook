# Staleness Report: Oauth2 & Oidc

**Source:** /home/koala/Work/gitbook/dist/fundamental/oauth2-and-oidc.md
**Checked:** 2026-06-01 14:30

## Summary

**Partially stale — moderate urgency.** The page covers the core OAuth 2.0 Authorization Code + PKCE flow correctly, but it predates three major developments that have reshaped the OAuth security landscape: (1) **RFC 9700** (OAuth 2.0 Security Best Current Practice, published January 2025) which formally deprecates the Implicit Grant and ROPC, mandates sender-constrained tokens or refresh token rotation for public clients, and requires exact redirect URI matching; (2) **RFC 9449 (DPoP)**, a sender-constraining mechanism for bearer tokens that is now widely adopted; and (3) the emerging **OAuth 2.1** specification which consolidates all of the above. The page's concurrency race analysis is solid but the recommended fix (locking/leeway) should be supplemented with refresh token rotation, which RFC 9700 now requires as a baseline.

## What's Still Accurate

- **PKCE is mandatory** — the page correctly states PKCE and `state` are required. This aligns with both RFC 9700 and OAuth 2.1.
- **Authorization Code flow** is the correct grant type to use.
- **Short-lived access tokens (5–15 min TTL)** — still the standard recommendation.
- **Proactive refresh** (refresh before expiry on every request) — still a valid and common pattern.
- **HttpOnly cookies + HTTPS only** for session management — still essential.
- **Concurrency race analysis** — the scenario described (5 parallel requests, expired token, multiple refresh attempts) is real and the Redis locking solution remains a valid mitigation.
- **Session TTL matching Refresh Token TTL** — still a reasonable policy.
- **Graceful failure on expired refresh token** (delete session, force re-login) — still correct.
- **Logout pattern** (delete session + clear cookie) — accurate.
- **References to RFC 6749, 6750, 7636, 6819, and OpenID Connect Core 1.0** are foundational and still relevant.

## Potential Updates Needed

1. **Missing RFC 9700 (published Jan 2025)** — This is the single biggest gap. RFC 9700 is now the authoritative security BCP for OAuth 2.0. It deprecates the Implicit Grant (`response_type=token`) and ROPC, mandates PKCE for all client types, requires sender-constrained tokens or refresh token rotation for public clients, and enforces exact redirect URI matching. The page should reference and summarize it.
   - Source: https://www.rfc-editor.org/rfc/rfc9700.html

2. **Missing DPoP (RFC 9449)** — DPoP (Demonstrating Proof of Possession) lets a client cryptographically bind an access token to its own keypair, making stolen tokens useless to attackers. It is now widely implemented by Auth0, Okta, Spring Security, and others. For any app handling sensitive data, DPoP is a recommended security layer on top of the Authorization Code + PKCE flow.
   - Source: https://www.rfc-editor.org/rfc/rfc9449.html

3. **Refresh token rotation is under-covered** — The page mentions the concurrency race and suggests "leeway" or Redis locking as fixes. These are valid but outdated as primary strategies. RFC 9700 requires public clients to either sender-constrain refresh tokens (via DPoP/mTLS) **or** use refresh token rotation. Rotation means every refresh request issues a new refresh token and invalidates the old one — this also naturally solves the concurrency race (if RT-1 is reused, the server detects the replay and revokes all tokens). The page should mention rotation as the preferred approach, with locking as a secondary concern.
   - Source: https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation

4. **No mention of OAuth 2.1** — OAuth 2.1 is now at draft maturity and consolidates OAuth 2.0 + a decade of security RFCs into a single spec. It removes the Implicit Grant, ROPC, and other insecure patterns. While not yet a final RFC, it is the de facto standard to cite alongside RFC 9700. The page should note it.

5. **No mention of sender-constrained tokens (mTLS/DPoP)** — The page treats bearer tokens as the only token type. RFC 9700 strongly recommends sender-constrained tokens (mTLS for confidential clients via RFC 8705, DPoP for public clients via RFC 9449) as defense-in-depth against token theft and replay.
   - Source: https://www.rfc-editor.org/rfc/rfc8705 (mTLS), https://dpop.info/ (DPoP playground)

6. **Exact redirect URI matching not mentioned** — RFC 9700 requires authorization servers to use **exact string matching** against pre-registered redirect URIs (not pattern matching or subpath matching). This is a critical implementation detail missing from the page.

7. **OIDC-specific details sparse** — The page mentions OIDC in the title and validates ID Token signature/claims, but doesn't cover the `nonce` parameter (OIDC's CSRF protection), the claims in an ID Token (`sub`, `iss`, `aud`, `exp`, `iat`, `auth_time`), or OIDC scopes (`openid`, `profile`, `email`). For a page titled "Oauth2 & Oidc", the OIDC coverage is quite thin.

8. **Implicit Grant deprecation not stated** — The page doesn't explicitly warn against using the Implicit Grant. Given that RFC 9700 formally deprecates it and OAuth 2.1 removes it entirely, this is an important omission.

9. **Missing references to OWASP OAuth Cheat Sheet and RFC 9700** — The references section is missing RFC 9700, RFC 9449, the OWASP OAuth2 Cheat Sheet, and the OAuth 2.1 draft. These should be added.

## Suggested Next Actions

1. **Add a "Recent Developments" section** covering RFC 9700, DPoP (RFC 9449), and OAuth 2.1, with links to each.

2. **Update the concurrency race section** to mention refresh token rotation as the primary recommended fix (per RFC 9700), with the Redis locking approach as a secondary/alternative.

3. **Add a subsection on sender-constrained tokens** explaining DPoP for browser-based/mobile apps and mTLS for server-side apps, with guidance on when to use each.

4. **Expand the OIDC coverage** — add the `nonce` parameter, standard ID Token claims, and OIDC-specific scopes (`openid`, `profile`, `email`).

5. **Add explicit warnings** that the Implicit Grant and ROPC are deprecated (RFC 9700) and should not be used.

6. **Add redirect URI validation guidance** — exact string matching against pre-registered URIs (per RFC 9700 §2.1.1).

7. **Update the References section** to include:
   - RFC 9700 (OAuth 2.0 Security BCP) — https://www.rfc-editor.org/rfc/rfc9700.html
   - RFC 9449 (DPoP) — https://www.rfc-editor.org/rfc/rfc9449.html
   - OAuth 2.1 — https://oauth.net/2.1/
   - OWASP OAuth2 Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html
   - WorkOS RFC 9700 summary — https://workos.com/blog/oauth-best-practices
