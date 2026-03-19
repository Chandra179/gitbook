# Headless Browser

### Core functionalities

* Web Scraping & Automation: It is frequently used with libraries like Puppeteer, Playwright, or Selenium. Instead of launching a heavy Chrome instance on your own server, you connect to a Browserless endpoint.
* PDF Generation & Screenshots: It can "render" a URL and return a high-quality PDF or an image of the page.
* Resource Management: It handle memory leaks, zombie processes, and font rendering, which often crash servers when running Chrome manually.

### Advantages over browser

* No Rendering Pipeline: It doesn't need to calculate how to display a shadow on a button or the exact hex code of a gradient for your eyes. It only cares about the DOM (Document Object Mod1. el) and the data.
* Reduced Memory Footprint: Because there are no visual elements to keep in the "video memory" (VRAM), you can run many more instances on the same hardware.
* Process Overhead: A standard Chrome window has overhead for the UI thread, the GPU thread, and the utility threads. Headless mode collapses or ignores many of these.

### Browser engine

Browser engine (layout engine or rendering engine) is the core software component that transforms HTML, CSS, and JavaScript into the interactive visual representation you see on your screen. Common browser engine

* Blink: Chrome, Edge, Brave, Opera
* Webkit: Safari (iOS & macOS)
* Gecko: Firefox

### Javascript Engine

V8 is a JavaScript engine. It is designed to take text (JS code), compile it, and execute it. It knows how to do math, handle arrays, and run functions, but it has zero built-in knowledge of:

* What a `<div>` or `<a>` tag is.
* How to "click" a button.
* What "blue" or "16px" means.
* How to calculate if one element is covering another.

### Can i just use V8?

Many websites use anti-bot services (like Cloudflare or Akamai). When you visit their site, they send a "challenge" to your browser.

* If you use a simple scraper: You just get the HTML code, and the challenge never runs. The website sees you didn't execute the script and blocks you immediately because "real humans use browsers that run JS."
* If you use V8 alone: You can run the script, but the script will ask, _"What is your screen resolution?"_ or _"How many fonts are installed?"_ V8 doesn't know the answer because it has no "body" (the Browser Engine). It fails the test.
  * If you use a Browser Engine: It provides real (or spoofed) answers for screen size, canvas rendering, and hardware details, making you look like a real user.

### Antibot

Anti-bot systems look for a Browser Fingerprint. This is a combination of many small details:

* Canvas Rendering: The site asks the browser to draw a hidden image. Every browser engine/GPU combo draws it slightly differently. V8 can't "draw."
* WebRTC & Network Stack: Real browsers handle connections in a specific way.
* Event Listeners: Real browsers have things like `window.chrome`.

Even with a browser engine, bots can be detected if they are in Headless Mode. By default, a headless engine leaves "footprints" that say, _"I am a bot!"_

* It might set `navigator.webdriver` to `true`.
* It might have a specific "HeadlessChrome" User-Agent.

When you use a tool like Browserless or libraries like Go-Rod, you can use "Stealth" plugins. These plugins tell the Browser Engine to lie to the website:

* "Tell them my `webdriver` is `false`."
* "Tell them I have a 1920x1080 screen."
* "Pretend I have a battery level of 85%."

Modern bot detection doesn't just look at _what_ you are; it looks at _how_ you move.

* Simple scripts: Jump from Page A to Page B in 0.1 seconds with zero mouse movement.
* Browser Engine: Allows you to simulate realistic mouse curves, natural scrolling, and human-like typing delays.

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

| **Variable**              | **Recommended Value** | **What it does**                                                       |
| ------------------------- | --------------------- | ---------------------------------------------------------------------- |
| `MAX_CONCURRENT_SESSIONS` | `5` (for 1GB RAM)     | Limits how many tabs can open at once.                                 |
| `PREBOOT_CHROME`          | `false`               | Don't keep a browser idling in the background.                         |
| `EXIT_ON_HEALTH_FAILURE`  | `true`                | Kills the container if RAM hangs, allowing Docker to restart it fresh. |

### Architecture

Use `net/http` + `PuerkitoBio/goquery` (for HTML parsing) first, detect content-type/mime-type

1. Go-Rod or Chromedp is technically "native" Go code controlling an external Chromium process via the DevTools Protocol (CDP)
