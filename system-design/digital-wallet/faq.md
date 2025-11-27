# FAQ

* Optimistic locking fails catastrophically on hot accounts (e.g., a merchant receiving 100 payments/sec). If 100 threads try to update the balance simultaneously, 1 succeeds, and 99 fail with a version mismatch. Retrying them creates a thundering herd.
