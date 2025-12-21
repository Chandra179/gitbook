# FAQ

#### Should I use a "Target Chunk Size" instead of the token limit?

Yes. You should never try to fill the entire token limit with one block of text.

* Token Limit is your "hard ceiling" (how much the AI can remember at once).
* Chunk Size is your "unit of search" (usually 256–1024 tokens).
* _Strategy:_ Break your data into small chunks (e.g., 512 tokens) so the system can retrieve only the most relevant parts, leaving plenty of room for the AI to "think" and answer.

***

#### Do different embedding models have different "locations" for vectors?

Yes. Every model creates its own unique "map" (vector space).

* If you embed a document with Model A and try to search it with Model B, the results will be wrong because the coordinates don't match.
* Vector Size (Dimensions): A size of 768 or 4096 refers to how many "details" the model records about the text. Larger dimensions are more precise but take up more storage.

***

#### Can I put one whole PDF into one vector?

No. If you squash a 50-page PDF into a single vector, the specific details get "blurred" or averaged out.

* Split the PDF into 512-token chunks. Each chunk gets its own vector. This way, if a user asks about a specific detail on page 10, the system can find that exact chunk easily.

***

#### Does a 512-token chunk work in a 4096-dimension embed space?

Yes, it works very well. \* This means you are taking a medium-sized piece of text (512 tokens) and describing it with 4,096 different numerical "features." This results in extremely high accuracy during retrieval. It’s like having a very high-resolution photo of a small object. But watch out for storage costs because bigger dimension bigger storage

***

#### Can my RAG pipeline be improved further?

Yes, you are on a great path (hybrid search (sparse, dense) vector, RRF), but you can "level up" by:

* Adding a Re-ranker, use a Cross-Encoder to re-score the top 50 results from Qdrant.
* Parent Document Retrieval: Search small chunks but return the full paragraph to the LLM for better context.

***

#### What is the difference between `sentence-transformers` and `fastembed` for dense vectors?

The Comparison:

* `fastembed`: Faster on CPUs, tiny footprint, no PyTorch/CUDA dependency, but fewer models available.
* `sentence-transformers`: More flexible (access to any model on Hugging Face), better for GPUs, but much "heavier" (requires PyTorch).

Since you are already using FastEmbed for sparse vectors, migrating your dense vectors to it would allow you to delete PyTorch, reduce your Docker image size, and remove the `KMP_DUPLICATE_LIB_OK` workaround.

***

#### What does `KMP_DUPLICATE_LIB_OK` do?

This is a "hack" environment variable for Intel’s OpenMP library. Both PyTorch (via `sentence-transformers`) and FastEmbed try to initialize their own parallel processing threads. This conflict usually crashes the program. Setting it to `TRUE` stops the crash but can cause performance issues because the two libraries "fight" for CPU cores.

