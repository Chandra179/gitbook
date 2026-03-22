# Infrastructure

### Resources

One browser instance (one Docker container) typically handles 5 to 20 concurrent sessions depending on the hardware.

* CPU: Each page load spikes CPU during "Layout" and "Script Execution."
* RAM: This is the real killer. A single Chrome tab takes 100MB–300MB.
  * A **2GB RAM VPS** can safely handle \~5-8 concurrent pages.
  * A **16GB RAM Server** can handle \~50-80 concurrent pages.

Because a browser has to load HTML, CSS, and JS, a single page might take 2–5 seconds to "finish."

* If your instance has a concurrency limit of 10:
* Each page takes 2 seconds to extract.
* Your total throughput is 5 extractions per second.

To get high RPS, you don't send requests faster; you make the browser "lighter."

#### The "No-UI" and "No-GPU" Flags

Even in headless mode, Chrome sometimes tries to initialize hardware acceleration. You can force it to drop these extra processes.

* `--disable-gpu`: Prevents the browser from spawning a GPU process.
* `--disable-dev-shm-usage`: Forces Chrome to use the `/tmp` folder instead of shared memory (prevents "Out of Memory" crashes in Docker).
* `--no-sandbox`: Reduces overhead (use with caution in untrusted environments).
* `--single-process`: (Experimental) Forces everything into one OS process. This saves massive RAM but makes the browser less stable.

#### Request Interception

This is the most effective way to save RAM. If you don't block these, the browser engine allocates memory to store and render them.

In your Go code (using Go-Rod or Colly), you should "abort" any request that isn't the main document or a critical script:

* Images (`.jpg`, `.png`, `.webp`): Massive RAM savings.
* Fonts (`.woff`, `.ttf`): Zero impact on data, high impact on memory.
* CSS (`.css`): Unless the site uses JS to check if an element is "visible," you don't need CSS.
* Media/Ads: Use a Request Filter to block known ad domains.

#### Process Recycling (The "Zombies" Problem)

Headless browsers suffer from Memory Leaks. If you keep one browser instance open for 24 hours, its RAM usage will slowly climb until it crashes your VPS.

* The "Rule of 100": Close the entire browser instance and start a fresh one every 100–500 pages.
* Zombie Hunting: Ensure you are calling `browser.Close()` in a `defer` block. In Docker, use an `init` process (like Tini) to reap "zombie" Chrome processes that didn't shut down correctly.

#### Browserless-Specific Tuning

If you are using the Browserless Docker image, you can pass environment variables to cap the memory usage at the infrastructure level:
