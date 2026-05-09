# Machine Learning

### Core Theory & Building Blocks

* **Single Perceptron** – The simplest unit: weighted inputs, bias, activation.
* **Multilayer Perceptron (MLP)** – Stacked layers of neurons; universal function approximators.
* **Activation Functions** – Sigmoid, Tanh, ReLU (and variants like GELU, Swish).\
  &#xNAN;_&#x44;etermines the output of a neuron; choice affects gradient flow and expressiveness._
* **Loss Functions**
  * MSE (regression), Cross‑Entropy (classification).
  * Also: Binary Cross‑Entropy, Categorical Cross‑Entropy, Hinge loss.\
    &#xNAN;_&#x51;uantify the discrepancy between predictions and targets._
* **Gradient Descent** – Iterative algorithm to minimize the loss by moving against the gradient.
* **Backpropagation** – The chain rule applied to compute gradients of the loss w.r.t. every parameter.
* **Bias–Variance Tradeoff** – Decomposition of generalization error.\
  &#xNAN;_&#x48;igh bias → underfitting; high variance → overfitting._
* **Underfitting** – Model too simple or undertrained, fails to capture patterns in training data.
* **Overfitting** – Model memorizes training data instead of learning to generalize.\
  &#xNAN;_&#x53;weet spot often 1–3 epochs for fine‑tuning large models._
* **Vanishing / Exploding Gradients** – Why deep networks fail without careful initialization and normalization.
* **Evaluation Metrics** – Precision, Recall, F1‑Score, Accuracy, AUC‑ROC.\
  &#xNAN;_&#x55;sed to assess model performance on held‑out data, distinct from training loss._

### Data Processing & Preparation

* **Tensors & Shapes** – Understanding dimensions (e.g., `[batch, channels, height, width]`).\
  &#xNAN;_&#x53;hape mismatch is the #1 error in AI coding._
* **Normalization / Scaling** – Squashing features to a common range (0‑1, z‑score) so gradients behave.
* **Train / Validation / Test Split** – Dividing data to train, tune, and honestly evaluate a model.
* **Cross‑Validation** – k‑fold CV provides more robust performance estimates, especially on small datasets.
* **Data Augmentation** – Artificially expanding training data (rotation, cropping, flip, cutout, synonym replacement) to improve robustness.
* **Tokenization** – Converting raw text into tokens (BPE, WordPiece, SentencePiece); fundamental for all NLP.
* **Embeddings** – Dense vector representations of discrete items (words, sentences, images). Learned during training.

### Optimization

* **Weight Initialization** – He (for ReLU) and Xavier/Glorot (for sigmoid/tanh) keep activations stable initially.
* **Mini‑Batch Gradient Descent** – Industry standard: balances speed and noise by using small subsets of data.
* **Stochastic Gradient Descent (SGD)** – The extreme case (batch size 1); noisy but can escape local minima.
* **Advanced Optimizers** – **Momentum** (speeds up movement), **Adam** (adaptive learning rates; the default today), AdamW (decoupled weight decay), RMSprop.
* **Learning Rate Schedules** – Step decay, cosine annealing, warmup, and 1‑cycle policies to aid convergence.
* **Batch Normalization** – Normalizes layer inputs across the batch; accelerates training of CNNs.
* **Layer Normalization** – Normalizes across features; key for Transformers (independent of batch size).
* **Hyperparameter Tuning** – Systematic search (grid, random, Bayesian) for lr, dropout, batch size, etc.

### Generalization & Regularization

* **L₁ Regularization (Lasso)** – Encourages sparse weights.
* **L₂ Regularization (Ridge / Weight Decay)** – Penalizes large weights, smooths the loss surface.
* **Dropout** – Randomly zeroes neurons during training, forcing the network to learn redundant representations.
* **Early Stopping** – Halt training when validation loss stops improving, preventing overfitting.
* **Calibration** – How well predicted probabilities reflect true likelihoods; critical for risk‑sensitive applications.
* **Distribution Shift** – When deployment data differs from training data (covariate shift, concept drift); threatens reliability.

### Architectures

* **Convolutional Neural Networks (CNNs)** – Local weight sharing for spatial data (images).\
  &#xNAN;_&#x4B;ey ops: convolution, pooling, stride._
* **Recurrent Neural Networks (RNNs) / LSTMs** – Process sequences with hidden state; LSTMs mitigate vanishing gradients via gating.
* **Transformer & Attention** – Maps input sequence to output sequence via self‑attention.
  * **Self‑Attention** – Each token attends to all others.
  * **Multi‑Head Attention** – Multiple parallel attention heads capture different relationships.
  * **Cross‑Attention** – One sequence attends to another (encoder–decoder).
* **Encoder–Decoder Architecture** – Encoder processes input into a latent representation, decoder generates output. Backbone of T5, original Transformer, and many seq2seq tasks.
* **Mixture of Experts (MoE)** – Sparsely‑activated sub‑networks (experts) with a router; massive capacity without proportionate compute.
* **Generative Model Families**
  * **GANs** – Generator vs. discriminator min‑max game.
  * **VAEs** – Latent variable models with variational inference.
  * **Diffusion Models** – Learn to denoise; state‑of‑the‑art in image/video generation.
* **Self‑Supervised Learning** – Pre‑training objectives that use the data itself as supervision (masked language modeling, contrastive learning).
* **Pre‑training Objectives**
  * **Autoregressive (AR) Modeling** – Predict next token (GPT‑style).
  * **Masked Language Modeling (MLM)** – Fill masked tokens (BERT‑style).

### Modern Paradigms & Large‑Model Behavior

* **Transfer Learning** – Pre‑train on vast data, then fine‑tune on a target task; enables small‑data success.
* **Reinforcement Learning from Human Feedback (RLHF)** – Aligns model outputs with human preferences using RL (Proximal Policy Optimization) on reward models.
* **Constitutional AI** – Rule‑based self‑critique for alignment without human reward models.
* **Prompting as a Fundamental** – In‑context learning: the model adapts based on the prompt without weight updates.
* **Scaling Laws** – Empirical relationships between compute, data, and model size (Chinchilla optimal, etc.) guide resource allocation.
* **Differences Between Major Models** – Despite shared Transformer roots, GPT, Claude, Gemini differ in:
  * **Training Data** (e.g., Google’s YouTube/Search vs. Anthropic’s curated data)
  * **Alignment** (RLHF vs. Constitutional AI)
  * **Engineering** (proprietary context‑handling, native multimodality)

### Hardware, Training Scale & Practical Deployment

* **Frontier Model Training** – 3–6 months, tens of thousands of H100/TPU GPUs interconnected with NVLink/InfiniBand.
  * Fragile: a single chip failure or loss spike can ruin a multi‑million dollar run.
* **Individual Training / Fine‑Tuning** – At home, fine‑tune small models (e.g., Llama 1B) with careful VRAM management.
* **VRAM** – Live working memory holding **weights, optimizer states, gradients, and activations**.
  * Low VRAM → use small models + 4‑bit QLoRA + Unsloth to fit the “math” into memory.
* **Model Merging** – Combining multiple fine‑tuned models into one without retraining (SLERP, DARE).
* **Knowledge Distillation** – Train a smaller “student” model to mimic a large “teacher”, compressing knowledge for cheap inference.
* **Quantization** – Reducing weight precision (FP16, INT8, 4‑bit) to shrink model size and speed up inference/training.
