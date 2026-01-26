# AI

#### Fundamentals

* Single Perceptron
* Multilayer Perceptron (MLP)
* Activation Functions: Sigmoid, Tanh, ReLU (knowing when to use which). determines the output of a neuron based on input and weights
* Loss Functions: MSE (for regression), Cross-Entropy (for classification). Valuate model predictions with actual target value
* Gradient Descent: The concept of minimizing error. Used for minimize loss function
  * Backpropagation: algorithm (Chain Rule) that calculates gradients.
* Evaluation Metrics (Precision/Recall/F1) vs. Loss Functions.

### Data Processing

* Tensors & Shapes: Understanding dimensions (e.g., `[32, 3, 224, 224]`). Shape mismatch is the #1 error in AI coding.
* Normalization / Scaling: Squashing data to a 0-1 range so the network doesn't explode.
* Train / Val / Test Split: Separating data to prove your model actually works.
* Embeddings: represent data as vector

### Optimization

* Weight Initialization: Starting weights correctly (He/Xavier init) so the network starts learning immediately.
* Mini-Batch Gradient Descent: The industry standard balance of speed and stability.
* Stochastic Gradient Descent (SGD): Understanding the "noisy" alternative.
* Advanced Optimizers: Momentum, Adam (The default choice today).

### Generalization (Stopping Overfitting)

* Regularization: L1 (Lasso) and L2 (Ridge/Weight Decay).
* Dropout: Randomly ignoring neurons to force robustness.
* Early Stopping: Stopping training before the model memorizes noise.

### Architecture

* CNNs: Convolutional Neural Networks (for Images).
* RNNs / LSTMs: Recurrent Neural Networks (for basic sequences).
* Transformers & Attention: read sequence of input into sequece of output (like GPT/Gemini).

### Other

**Mixture of Experts (MoE)**

MoE allows models to have a massive "brain size" without high compute costs by using a "router" to send tasks only to specific specialized sub-networks (experts). This is used in LLMs but also in vision and multimodal models.

**Differences Between Major Models**

Even though Gemini, Claude, and GPT-4 use the Transformer architecture, they differ in:

* Data: What they were trained on (e.g., Google’s YouTube/Search data vs. Anthropic’s highly curated data).
* Alignment: Training styles like RLHF (Human feedback) vs. Constitutional AI (rule-based self-critique).
* Engineering: Proprietary tweaks for long context handling and native multimodality.

**Hardware and Scaling**

Training "Frontier" models takes 3–6 months and uses tens of thousands of specialized chips (Nvidia H100 GPUs or Google TPUs).

* These chips are interconnected via high-speed "highways" (NVLink/InfiniBand) to act as one giant brain.
* Training is fragile; a single chip failure or "Loss Spike" (where the math explodes) can ruin a multi-million dollar training run.

**Individual Training & VRAM**

* You can't train a massive model from scratch at home, but you can "Fine-Tune" a small model (like Llama 3.2 1B) for specialized tasks like Finance.
* VRAM is the "Live Working Memory." During training, it must hold the Weights (the brain), Optimizer States (memory of changes), Gradients (directions for learning), and Activations (temporary thoughts).
* If you have low VRAM, you must use a small model like (1B) and tricks like 4-bit QLoRA and Unsloth to ensure the "math" has enough room to function without crashing.

**Pattern Recognition and Overfitting**

* Training longer helps the model find patterns, but training _too_ long leads to Overfitting, where the model just memorizes the training data like a parrot instead of understanding the logic.
* The "sweet spot" is usually 1–3 passes (epochs) through your data.

