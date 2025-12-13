# Neural Network

#### Fundamentals

* Single Perceptron: The basic building block.\
  ![](<.gitbook/assets/image (4).png>)<br>
* Multilayer Perceptron (MLP): The full network structure.
* Activation Functions: Sigmoid, Tanh, ReLU (knowing when to use which).
* Loss Functions: MSE (for regression), Cross-Entropy (for classification).
* Gradient Descent: The concept of minimizing error.
* Backpropagation: _(Added)_ The actual algorithm (Chain Rule) that calculates gradients. You cannot understand training without this.

#### II. Data Processing (The "Invisible" Work) _(New Section)_

* Tensors & Shapes: _(Added)_ Understanding dimensions (e.g., `[32, 3, 224, 224]`). Shape mismatch is the #1 error in AI coding.
* Normalization / Scaling: _(Added)_ Squashing data to a 0-1 range so the network doesn't explode.
* Train / Val / Test Split: _(Added)_ The golden rule of separating data to prove your model actually works.

#### III. Optimization (The Training Engine)

* Weight Initialization: _(Added)_ Starting weights correctly (He/Xavier init) so the network starts learning immediately.
* Mini-Batch Gradient Descent: The industry standard balance of speed and stability.
* Stochastic Gradient Descent (SGD): Understanding the "noisy" alternative.
* Advanced Optimizers: Momentum, Adam (The default choice today).

#### IV. Generalization (Stopping Overfitting)

* Regularization: L1 (Lasso) and L2 (Ridge/Weight Decay).
* Dropout: Randomly ignoring neurons to force robustness.
* Early Stopping: Stopping training before the model memorizes noise.

#### V. Architecture (The Specializations)

* CNNs: Convolutional Neural Networks (for Images).
* RNNs / LSTMs: Recurrent Neural Networks (for basic sequences).
* Transformers & Attention: _(Added)_ The modern standard. You must learn the Attention Mechanism because it replaced RNNs and powers every modern AI agent (like GPT/Gemini).
