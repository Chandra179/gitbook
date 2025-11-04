# LLM

* **Parametric Memory**: Knowledge encoded within the model's parameters during training.
* **Non-Parametric (Retrieval-Based) Memory**: Knowledge retrieved from external sources, such as databases or documents, at the time of inference.
* **REALM** is a model that augments language model pre-training by incorporating a neural knowledge retriever. This retriever fetches relevant documents from a large corpus (e.g., Wikipedia) during both pre-training and inference. [https://arxiv.org/abs/2002.08909](https://arxiv.org/abs/2002.08909)
* **ORQA** (Open-Retrieval Question Answering) is a model designed to perform question answering by retrieving relevant information from a large corpus. Unlike traditional models that rely solely on pre-trained knowledge, ORQA retrieves external documents to answer questions, enabling it to handle a broader range of topics and provide more accurate responses. [https://arxiv.org/abs/2005.11364](https://arxiv.org/abs/2005.11364)
*   **Sequence-to-Sequence**, a type of neural network architecture designed to map one sequence to another

    ```
    Input Sequence:   x1, x2, x3, ..., xn
          Encoder → [Context Vector] → Decoder
    Output Sequence:  y1, y2, y3, ..., ym
    ```

## Model Comparison: Maximum Input Token Lengths

<table><thead><tr><th width="232.59698486328125">Model Name</th><th>Max Input Tokens</th><th>Notes</th></tr></thead><tbody><tr><td>sentence-transformers/all-mpnet-base-v2</td><td>384</td><td>Default truncation limit; can be adjusted with <code>model_max_length</code>.</td></tr><tr><td>hkunlp/instructor-large</td><td>512</td><td>Default truncation limit; can be adjusted with <code>model_max_length</code>.</td></tr><tr><td>01-ai/Yi-34B</td><td>4,096</td><td>Configured with <code>max_position_embeddings</code> set to 4,096.</td></tr><tr><td>mistralai/Mistral-7B-v0.1</td><td>8,192</td><td>Context length of 8,192 tokens.</td></tr><tr><td>mistralai/Mixtral-8x7B-Instruct-v0.1</td><td>32,768</td><td>Context length of 32,768 tokens; tokenizer may support longer.</td></tr><tr><td>mistralai/MegaBeam-Mistral-7B</td><td>512,000</td><td>Designed for efficient long-context processing.</td></tr></tbody></table>
