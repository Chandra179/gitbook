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

