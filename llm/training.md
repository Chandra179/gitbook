# Training

## **Objective: Predicting the Next Token**

At the core of most LLMs is a **sequence modeling** objective. Given an input sequence of tokens:

$$
x = (x_1, x_2, x_3, ..., x_T)
$$

the model tries to learn a probability distribution over the next token:

$$
p(x_t | x_{<t}; \theta)
$$

where:

* `x_t` = the current token
* `x_{<t}` = all previous tokens in the sequence
* `θ` = the model’s parameters (weights and biases)

The overall probability of the full sequence is the product of all conditional probabilities:

$$
p(x_1, x_2, ..., x_T) = \prod_{t=1}^{T} p(x_t | x_{<t}; \theta)
$$

## **Loss Function: Negative Log-Likelihood (NLL)**

To train the model, we want it to assign **high probability** to the correct tokens in the training data.\
The **Negative Log-Likelihood (NLL)** loss is used to measure how well the model predicts the true sequence.

For a single training example:

$$
\mathcal{L}_{NLL} = - \sum_{t=1}^{T} \log p(x_t | x_{<t}; \theta)
$$

This loss penalizes the model when it assigns low probability to the correct token.\
Minimizing NLL is equivalent to maximizing the likelihood of the training data.

## **Optimization: Gradient Descent**

Once we define a loss function, the model learns by **updating its parameters** in the direction that minimizes this loss.

The most basic update rule is **Stochastic Gradient Descent (SGD)**:

$$
\theta := \theta - \eta \nabla_{\theta} \mathcal{L}
$$

where:

* `θ` = model parameters
* `η` = learning rate (step size)
* `∇_θ L` = gradient of the loss with respect to the parameters

This gradient tells the model how to change each parameter to reduce the loss.

## **Adam Optimizer**

Modern language models typically use the **Adam** optimizer (Kingma & Ba, 2015), which is an adaptive version of SGD.\
Adam combines two ideas:

1. **Momentum** — smooths gradients over time
2. **Adaptive Learning Rate** — scales updates based on past squared gradients

The Adam update rule is:

$$
\begin{align*}
m_t &= \beta_1 m_{t-1} + (1 - \beta_1) \nabla_{\theta_t} \mathcal{L} \\
v_t &= \beta_2 v_{t-1} + (1 - \beta_2) (\nabla_{\theta_t} \mathcal{L})^2 \\
\hat{m}_t &= \frac{m_t}{1 - \beta_1^t} \\
\hat{v}_t &= \frac{v_t}{1 - \beta_2^t} \\
\theta_{t+1} &= \theta_t - \eta \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}
\end{align*}
$$

where:

* `m_t` = exponentially averaged gradient (momentum)
* `v_t` = exponentially averaged squared gradient (RMS scaling)
* `β₁`, `β₂` = decay rates (commonly 0.9 and 0.999)
* `ε` = small constant to prevent division by zero

Adam is robust, efficient, and the de facto choice for most LLM training pipelines.

## **Further Reading**

* _Kingma & Ba, 2015 – Adam: A Method for Stochastic Optimization_
* _Goodfellow et al., 2016 – Deep Learning (MIT Press)_
* _Vaswani et al., 2017 – Attention is All You Need_

