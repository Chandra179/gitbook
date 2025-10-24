# Generator

## **BART (Bidirectional and Auto-Regressive Transformer)**

BART (Lewis et al., 2019) is a **sequence-to-sequence (seq2seq)** model that combines the strengths of **BERT** (for understanding input) and **GPT** (for generating text). It is pre-trained by corrupting text and learning to reconstruct it — so it’s great at tasks like summarization, question answering, and text generation.

**How it works in RAG:**

* BART acts as the **generator**.
* It takes the **original input (e.g. question)** plus the **retrieved documents** from DPR.
* It then generates the final output sequence (the answer, summary, etc.).

**Example Flow:**

```
Input: "Who discovered penicillin?"
Retriever (DPR): finds top documents
   D1: "Alexander Fleming discovered penicillin in 1928."
Generator (BART): reads both the input and D1
→ Output: "Alexander Fleming."
```
