# Oauth2 & Oidc

#### **Authorization URL**

Use PKCE (Proof Key for Code Exchange) and `state` and its mandatory for security (prevents CSRF and Code Injection).

#### **Callback Handler**

Swaps the code for tokens and validates the ID Token signature/claims.

#### **Session Management**

Using `HttpOnly` cookies to protect against XSS (Cross-Site Scripting) and HTTPS only. Session should depends on interface so the concrete impl is changeable (i.e, in-memory, redis). Session TTL: Should match the Refresh Token TTL (or a fixed policy like "24 hours of inactivity").

#### **Access token**

Access Token TTL: Short (e.g., 5-15 minutes)

#### Refresh Token

Discover expiry/revocation when refresh attempt fails  (might be the refresh token is expired. And handle failure gracefully (delete session + force re-login) like logout mechanism

#### **Refresh Access token**

Don't wait for the token to actually expire and fail a request. Instead, check the token's age on every request and refresh it _before_ it dies. Refresh Token TTL: Long (e.g., 7-30 days)

**The "Concurrency Race"**

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

for protected routes, required user to be login first

#### **Logout**

Delete the local session (destroy the session in Redis/Memory and clear the cookie).

#### DB Schema

```sql
CREATE TABLE users (
    -- UUID v7 
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Email is often synced from OIDC, but can change. 
    -- Treat it as mutable data, not an ID.
    email VARCHAR(255) NOT NULL, 
    
    full_name VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE federated_identities (
    -- The 'iss' (Issuer) claim from the ID Token.
    -- Example: 'https://accounts.google.com' or 'https://github.com'
    provider VARCHAR(255) NOT NULL,
    
    -- The 'sub' (Subject) claim from the ID Token.
    -- Example: '10769150350006150715113' (Google) or '583231' (GitHub)
    -- WARNING: These are strings, not always integers.
    subject_id VARCHAR(255) NOT NULL,
    
    -- The link to your internal user
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Metadata (Optional but useful for debugging/audits)
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- COMPOSITE PRIMARY KEY
    -- A user is unique based on WHO they logged in with (provider) 
    -- and THEIR ID on that platform (subject_id).
    PRIMARY KEY (provider, subject_id)
);

-- Fast lookup to find all linked accounts for a specific internal user
CREATE INDEX idx_federated_identities_user_id ON federated_identities(user_id);
```
