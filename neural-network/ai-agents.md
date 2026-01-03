# AI Agents

Reasoning and acting (ReAct) framework

Chain of thought (CoT)

Context editing if the context is near token limit

Context awareness

compact the context

**Prompt chaining**

Instead of asking an AI to do a giant, complicated task in one go (which often leads to mistakes), prompt chaining breaks that task into a sequence of smaller, linked steps. The output of the first step becomes the input for the second, and so on

**Active Context**

It uses a "Prefix Reuse Machine" architecture. This caches your system prompt, tool definitions, and project rules so they don't have to be re-processed every time, saving 90% on costs. (current conversation)

**Project Memory**

It looks for a special file (`CLAUDE.md`) in your repo. This acts as a "Permanent Context" that is re-injected into every new session so the AI never forgets your coding style or build commands. (automatically paste into every session created)

**Memory Tool**

The "Memory Tool" is a pre-defined capability provided by Anthropic (the creators of Claude). **The Agent** Decides when to use it. If you say "Remember that I hate using the library 'Axios'," Claude thinks: _"I should save this."_ It then sends a command (e.g., `memory.create`) to your computer.

