# Neural Network

#### Fundamentals

* Single Perceptron
* Multilayer Perceptron (MLP)
* Activation Functions: Sigmoid, Tanh, ReLU (knowing when to use which). determines the output of a neuron based on input and weights
* Loss Functions: MSE (for regression), Cross-Entropy (for classification). Valuate model predictions with actual target value
* Gradient Descent: The concept of minimizing error. Used for minimize loss function
  * Backpropagation: algorithm (Chain Rule) that calculates gradients.
* Evaluation Metrics (Precision/Recall/F1) vs. Loss Functions.

#### Data Processing

* Tensors & Shapes: Understanding dimensions (e.g., `[32, 3, 224, 224]`). Shape mismatch is the #1 error in AI coding.
* Normalization / Scaling: Squashing data to a 0-1 range so the network doesn't explode.
* Train / Val / Test Split: Separating data to prove your model actually works.
* Embeddings: represent data as vector

#### Optimization

* Weight Initialization: Starting weights correctly (He/Xavier init) so the network starts learning immediately.
* Mini-Batch Gradient Descent: The industry standard balance of speed and stability.
* Stochastic Gradient Descent (SGD): Understanding the "noisy" alternative.
* Advanced Optimizers: Momentum, Adam (The default choice today).

#### Generalization (Stopping Overfitting)

* Regularization: L1 (Lasso) and L2 (Ridge/Weight Decay).
* Dropout: Randomly ignoring neurons to force robustness.
* Early Stopping: Stopping training before the model memorizes noise.

#### Architecture

* CNNs: Convolutional Neural Networks (for Images).
* RNNs / LSTMs: Recurrent Neural Networks (for basic sequences).
* Transformers & Attention: The modern standard. You must learn the Attention Mechanism because it replaced RNNs and powers every modern AI agent (like GPT/Gemini).
