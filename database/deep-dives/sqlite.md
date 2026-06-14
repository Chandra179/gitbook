---
title: "SQLite — Architecture"
aliases: []
tags: [database/deep-dive]
created: "2026-06-13"
---

# SQLite — Architecture

> For the underlying mechanics of B-Trees, WAL, and related algorithms,
> see [Storage Engines](../storage-engines.md) and [Database Algorithms](../algorithms.md).

## What Makes It Unique

- **Zero-install, zero-config** — a library you link into your application, not a server to manage
- **Single-file database** — the entire database is a single disk file; copy it, email it, version it
- **The most deployed database engine on the planet** — every smartphone, browser, embedded device, and desktop app ships with it
- **Backward-compatible file format since 2004** — a database file from SQLite 3.0 opens in the latest version with no migration

## Storage Model

SQLite stores the entire database in a **single file** using a B-Tree structure. The file begins with a
header page (100-byte magic + metadata), followed by B-Tree pages (4KB default, configurable to 64KB).

Each table is a B-Tree keyed by **rowid** (a 64-bit signed integer, accessible as `rowid`, `_rowid_`, or `oid`).
Row data is stored as a record in the leaf page. `WITHOUT ROWID` tables use the primary key as the B-Tree
key directly — rows are ordered by PK, like InnoDB's clustered index, but without the PK update cascade problem
(since there is no separate rowid to maintain in secondary indexes).

Values too large for a page are split across **overflow pages** — a linked list of pages storing the excess.
Deleted pages go on a **freelist** for reuse.

(For B-Tree mechanics, see [B-Tree](../storage-engines.md#b-tree))

## Indexing Model

```mermaid
flowchart TD
    subgraph "database.sqlite (single file)"
        H["Page 1: Header<br/>(100 bytes)"]
        T["Table B-Tree<br/>keyed by rowid<br/>leaves = row data"]
        I["Index B-Tree (email)<br/>keyed by email + rowid<br/>leaves = (key, rowid)"]
    end
    Q["SELECT * FROM users<br/>WHERE email = 'a@x.com'"] --> I
    I -->|"(a@x.com, rowid=42)"| T
    T -->|"find rowid 42"| R["Row Data"]
    style Q fill:#f0f0f0,stroke:#666
    style H fill:#fce4ec,stroke:#c62828
    style T fill:#e3f2fd,stroke:#1565c0
    style I fill:#e8f5e9,stroke:#2e7d32
```

Indexes are separate B-Trees stored in the same database file. Each index leaf stores `(key, rowid)`.
A secondary lookup follows: index → rowid → table B-Tree. No clustered indexes (except `WITHOUT ROWID` —
which is the table itself, not a separate index).

SQLite supports **partial indexes** (`WHERE` clause), **expression indexes** (`LOWER(col)`),
and **automatic indexes** — transient indexes built during a query for an unindexed join, discarded afterward.

Schema is stored in the `sqlite_schema` table (always at root page 1), read once at database open.
