# FAQ

#### Should I use a "Target Chunk Size" instead of the token limit?

Yes. You should never try to fill the entire token limit with one block of text.

* Token Limit is your "hard ceiling" (how much the AI can remember at once).
* Chunk Size is your "unit of search" (usually 256–1024 tokens).
* Break your data into small chunks (e.g., 512 tokens) so the system can retrieve only the most relevant parts, leaving plenty of room for the AI to "think" and answer.

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

#### What does `KMP_DUPLICATE_LIB_OK` do?

This is a "hack" environment variable for Intel’s OpenMP library. Both PyTorch (via `sentence-transformers`) and FastEmbed try to initialize their own parallel processing threads. This conflict usually crashes the program. Setting it to `TRUE` stops the crash but can cause performance issues because the two libraries "fight" for CPU cores.

***

#### Sparse Vectors Vs. Dense Vectors

A **Sparse Vector** is just a frequency count of unique words.&#x20;

* Sentence A: "Cat, Cat, Dog"
* The Sparse Vector: `[0, 0, 2, 1, 0]`

A **Dense Vector** is like a set of GPS coordinates, but instead of just 2D (Latitude, Longitude) or 3D (Latitude, Longitude, Altitude), it usually has hundreds or thousands of dimensions. example: dense Vector (768 dimensions): You are mapping a point in a "Concept Space."

***

#### Should LLMLingua compress chunks individually or as a combined context

Combined. Compressing them together allows LLMLingua to identify and remove redundancies _across_ different documents, which is much more efficient than looking at them in isolation.
