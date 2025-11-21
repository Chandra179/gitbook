# Knowledge Graph

### Data Source

PDFs, web page, etc. We use docling to extract PDFs data because it can extract image, graph, etc..

### Entity

#### Normalization

identify when pronouns or generic phrases refer to the same entity, allowing the text to be normalized before further processing. Modern approaches like AllenNLP’s coreference models provide **higher accuracy**, resolving more complex reference chains and ensuring that subsequent entity extraction and linking operate on consistent, fully resolved mentions.

```
Text:
"Apple released a new iPhone. It is expected to boost the company’s revenue. Tim Cook said it will be available next month."

Before (no coreference):
    Entities: "Apple", "iPhone", "Tim Cook"
    Pronouns like "It" and "the company" remain unresolved → downstream tasks cannot link them correctly.

After (with coreference resolution):
    Resolved references:
    "It" → "iPhone"
    "the company" → "Apple"

Result:
All mentions of "Apple" and "iPhone" are linked correctly, improving entity consistency and allowing proper relation extraction like:

("Apple", "releases", "iPhone")
("Tim Cook", "announces", "iPhone availability")
```

#### Extraction

For **entity extraction**, traditional models like spaCy’s `en_core_web_sm` are lightweight and fast, its suitable for general-purpose named entity recognition (NER) on standard text. They work well for common entities such as `person names, organizations, or locations` but often struggle with complex sentences, nested entities, or less common domain-specific terms.&#x20;

```
"Dr. Lisa Su from AMD announced a new high-performance processor at CES 2025 in Las Vegas."

(en_core_web_sm) Recognized entities:

"AMD" → ORG
"CES 2025" → DATE (sometimes missed)
"Las Vegas" → GPE

Missed / Incorrect:
"Dr. Lisa Su" → might not be recognized as a PERSON (small model often fails on titles or uncommon names)
"high-performance processor" → PRODUCT not recognized at all

Impact:
Relations like (“Dr. Lisa Su”, “announced”, “high-performance processor”) cannot be reliably extracted.
Downstream knowledge graphs are incomplete.
```

To address these limitations, transformer-based models like spaCy’s `en_core_web_trf` are used. These models leverage contextual embeddings from deep transformer networks, allowing them to capture nuanced meaning from surrounding words. The main improvement is **higher accuracy**, especially for ambiguous or context-dependent entities, while also better handling longer sentences and nested structures

```
(en_core_web_trf)

Recognized entities:
    "Dr. Lisa Su" → PERSON
    "AMD" → ORG
    "high-performance processor" → PRODUCT
    "CES 2025" → EVENT
    "Las Vegas" → GPE

Improvements:
More entities recognized – transformer model captures less common names, titles, and product names.
Better accuracy on entity types – “high-performance processor” is now correctly labeled as PRODUCT instead of ignored or misclassified.
Context-aware detection – even ambiguous phrases like “CES 2025” are recognized correctly because the transformer model considers surrounding words.

Impact:
Enables full relation extraction: (“Dr. Lisa Su”, “announced”, “high-performance processor”) at (“CES 2025”, “Las Vegas”).
Downstream tasks like entity linking, normalization, and graph building are much more accurate.
```

In domain-specific scenarios, general-purpose models may misclassify specialized entities like medical terms or financial instruments. To overcome this, fine-tuned `BERT or RoBERTa` models are employed. These models are pre-trained on large corpora and can be further fine-tuned on domain-specific datasets, improving **precision and recall** for specialized entities that general models would miss

#### **Canonicalization**

**Entity canonicalization** addresses the issue of multiple representations of the same entity, such as “IBM” versus “International Business Machines.” Simple lowercase and trimming are insufficient for robust normalization. Improvements include abbreviation expansion using dictionaries and rules, alias resolution via knowledge bases, and lemmatization to handle plural forms or morphological variants. These enhancements ensure that all references to the same real-world entity are unified, improving the quality of analysis, reducing duplication, and making downstream tasks like relation extraction or graph construction more reliable.

<pre><code>"IBM is expanding its cloud services. International Business Machines continues to innovate in AI. IBM’s research division announced a new project."

Before (basic lowercase/trim):
    Entities recognized: 
<strong>    "IBM", "International Business Machines", "IBM’s" → treated as separate entities
</strong>
After (with canonicalization):
    All references unified as "IBM"
    Optionally, normalized possessives handled → "IBM’s" → "IBM"

Result:
    Consolidated entity mentions → better statistics, relations, and knowledge graph nodes:
    ("IBM", "expanding", "cloud services")
<strong>    ("IBM", "innovates", "AI")
</strong>    ("IBM", "announces", "new project")

Improvement:
Reduces duplication.
Makes downstream analysis like relation extraction, entity frequency counting, and knowledge graph construction much more reliable.
</code></pre>

#### **Disambiguation**

For **entity disambiguation and linking**, initial NER may recognize an entity like “Apple” but cannot determine whether it refers to the fruit or the technology company. Simple string matching fails in many cases. To improve accuracy, linking approaches such as spaCy’s `EntityLinker` connect recognized entities to knowledge bases like Wikidata or Wikipedia, providing **contextual disambiguation**.   Complementary methods include string similarity techniques (using `fuzzywuzzy` or `rapidfuzz`) to merge variants of the same entity, and embedding-based methods (using `sentence-transformers`) to match semantically similar entities. These methods reduce ambiguity, increase consistency, and enable more reliable connections to external knowledge graphs.

```
"Apple is seeing strong sales this quarter. Apple is also a popular fruit in the US."

Before (basic NER):
Both mentions of "Apple" are tagged as ORG or ENTITY, without distinguishing context.

After (Entity Linking / Disambiguation):
    "Apple" → ORG → linked to Apple Inc. in Wikidata
    "Apple" → FRUIT → linked to Apple (fruit) in Wikidata

Improvement:
    Resolves ambiguity based on context.
    Downstream analytics (e.g., revenue reports vs food trends) become accurate.
```

#### **Papers**

* "Named Entity Recognition with Bidirectional LSTM-CNNs" (Chiu & Nichols, 2016)
* "BERT: Pre-training of Deep Bidirectional Transformers" (Devlin et al., 2018)
* "End-to-end Neural Coreference Resolution" (Lee et al., 2017)
* "Higher-order Coreference Resolution" (Lee et al., 2018)
* "Entity Linking with a Knowledge Base: Issues, Techniques, and Solutions" (Shen et al., 2015)
* "Neural Cross-Lingual Entity Linking" (Zhou et al., 2020)

### Relationship Extraction

Traditionally, simple methods like checking for verbs between two entities were used, but these approaches often miss complex or implicit relationships and cannot generalize well across different sentence structures.

To address these limitations, **neural relation extraction** models have become the state-of-the-art approach. Tools like **OpenNRE** offer pre-trained models for a fixed set of relations, allowing rapid extraction with minimal training.&#x20;

More advanced models such as **REBEL** or **SpERT** perform end-to-end relation extraction (from extraction to relationship) , with SpERT jointly modeling entities and relations, which improves both accuracy and efficiency by reducing error propagation between separate entity and relation modules. **LUKE**, an entity-aware transformer, further enhances performance for long sentences and complex dependencies. These neural methods excel at capturing implicit, context-dependent, or long-range relations that rule-based systems often fail to identify.

In scenarios where computational resources are limited or interpretability is important, **dependency-based methods** provide a robust alternative. Basic verb connection checks can be replaced with **Shortest Dependency Path (SDP)** analysis using spaCy and NetworkX, or with **typed dependency patterns** defined via spaCy Matcher. These approaches use syntactic structures to infer relationships, offering **greater precision and consistency** than naive methods. For deeper semantic understanding, **Semantic Role Labeling (SRL)** with AllenNLP analyzes the predicate-argument structure, capturing who did what to whom, even in complex sentences.

**Pattern-based extraction** remains effective when relationships follow predictable, domain-specific structures. Manual verb lists can be replaced with **spaCy Matcher or DependencyMatcher** to define precise patterns, or with **regular expressions** integrated with NER for fast, deterministic extraction. Classic systems like **Stanford OpenIE** can also produce structured triples in an open-domain setting. These methods are highly interpretable and computationally light, though they generally require careful rule design and may not generalize as broadly as neural models.

### Entity Resolution

Figuring out that "Elon M.", "E. Musk", and "The CEO of Tesla" are all the same node.

### Knowledge Fusion

Merging new data with existing graph data without creating duplicates.

### Graph Neural Networks (GNNs):

Advanced deep learning models that can look at a node's neighbors to predict its properties (e.g., predicting if a molecule is toxic based on its atomic structure).
