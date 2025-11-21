# Knowledge Graph

### Data Source

PDFs, web page, etc. We use docling to extract PDFs data because it can extract image, graph, etc..

### Node&#x20;

#### Entity extraction

| Improvement             | Method/Package                              | When to Use                                        | Where in Code         |
| ----------------------- | ------------------------------------------- | -------------------------------------------------- | --------------------- |
| **Larger Model**        | spaCy `en_core_web_trf` (transformer-based) | More accurate NER needed                           | Replace model loading |
| **Domain-Specific NER** | Fine-tuned BERT/RoBERTa models              | Domain-specific entities (medical, legal, finance) | Custom NER pipeline   |
| **Multi-lingual NER**   | spaCy multilingual models, mBERT            | Non-English text                                   | Model selection       |

**Papers:**

* "Named Entity Recognition with Bidirectional LSTM-CNNs" (Chiu & Nichols, 2016)
* "BERT: Pre-training of Deep Bidirectional Transformers" (Devlin et al., 2018)

#### Entity Normalization & Linking

**Coreference Resolution**

| Improvement        | Method/Package                    | When to Use                           | Where in Code       |
| ------------------ | --------------------------------- | ------------------------------------- | ------------------- |
| **Neural Coref**   | `coreferee` (spaCy plugin)        | Resolve "he", "she", "it" to entities | Pre-processing step |
| **Neuralcoref**    | `neuralcoref` (older, deprecated) | Legacy option                         | Pre-processing      |
| **AllenNLP Coref** | `allennlp-models`                 | High accuracy needed                  | Separate pipeline   |

**Papers:**

* "End-to-end Neural Coreference Resolution" (Lee et al., 2017)
* "Higher-order Coreference Resolution" (Lee et al., 2018)

Entity Disambiguation & Linking

**Current:** "Apple" could be fruit or company - not resolved

| Improvement           | Method/Package                             | When to Use                      | Where in Code          |
| --------------------- | ------------------------------------------ | -------------------------------- | ---------------------- |
| **Entity Linking**    | spaCy `EntityLinker` to Wikidata/Wikipedia | Link entities to knowledge bases | After NER extraction   |
| **String Similarity** | `fuzzywuzzy`, `rapidfuzz`                  | Merge similar entity names       | EntityNormalizer class |
| **Embedding-based**   | `sentence-transformers`                    | Semantic similarity matching     | EntityNormalizer class |
| **DBpedia Spotlight** | `pyspotlight`                              | Link to DBpedia/Wikipedia        | Entity post-processing |

**Papers:**

* "Entity Linking with a Knowledge Base: Issues, Techniques, and Solutions" (Shen et al., 2015)
* "Neural Cross-Lingual Entity Linking" (Zhou et al., 2020)

**Entity Canonicalization**

**Current:** Basic lowercase + trim

| Improvement                | Method/Package            | When to Use                                      | Where in Code        |
| -------------------------- | ------------------------- | ------------------------------------------------ | -------------------- |
| **Abbreviation Expansion** | Custom dictionary + rules | Handle "IBM" → "International Business Machines" | EntityNormalizer     |
| **Alias Resolution**       | Knowledge base lookups    | "NYC" → "New York City"                          | EntityNormalizer     |
| **Lemmatization**          | spaCy lemmatizer          | Plural handling                                  | Entity normalization |

### Relationship Extraction

#### Dependency Parsing (base syntactic relations)

Use this when you want fast, explainable relations based purely on grammar, such as `subject–verb–object` . It does NOT understand business meaning, only grammar.

```
this --[alarm]--> governments  
they --[control]--> twothirds  
India --[have]--> culture  

They are:
👉 grammatical dependencies
👉 not factual relations
👉 not business logic
👉 not ontology-level meaning

the word "India" is grammatically connected to "culture" through the verb "have"

It does NOT mean:
✅ India owns culture
✅ India defines culture
✅ India creates culture
```

#### ML Relation Extraction (OpenNRE / Transformer-based)

Use this when you need semantic accuracy and defined relationship types (e.g., “uses”, “belongs\_to”, “causes”). It works best when you already have a schema and want higher precision.

```
"Apple acquired Beats for $3 billion in 2014."

Extracted idea:

Apple → ACQUISITION → Beats

Instead of using the verb "acquired", it maps the relationship to a predefined semantic type like:
Apple — ACQUIRED_COMPANY — Beats

This is useful when your knowledge graph needs consistent relationship types, not raw verbs.
```

But how do we know that the model doesn't hallucinate and ambiguous, this problem is called

* Semantic drift
* Relation hallucination
* Over-generalization

we can reduce wrong predictions by using

* thresholding, eg: If confidence < 0.8 → discard.
* define allowed relations: approves, rejects, mentions. Only map using the defined relations
*   Pattern + ML Hybrid: Use verb → relation mapping rules first:

    ```
    endorse → APPROVES
    criticize → OPPOSES
    implement → EXECUTES
    ML only refines, not decides fully.
    ```

#### Hybrid Approach (Dependency + ML)

This is the most common industry choice for unstructured data. Dependency parsing identifies possible relation candidates, and ML then validates or classifies them.&#x20;

**Without dependency parsing (pure ML)**&#x20;

The model looks at raw text like: "The government heralded liberalisation policies." It must guess everything from scratch: What are entities? What might be a relationship? Where does it start and end? This creates more noise, more false relation, slower processing

**With dependency parsing (hybrid)**

You already give the ML model a narrowed candidate. ML does NOT invent the relation. It only answers: Is this a meaningful knowledge relation or just grammar? so instead of guessing everything, it validates and classifies:

| Dependency relation                  | ML semantic result    |
| ------------------------------------ | --------------------- |
| Government — herald → liberalisation | promotes\_policy      |
| India — have → culture               | has\_cultural\_aspect |
| they — control → twothirds           | NA (discarded)        |

```
"Google partnered with NASA to develop quantum computing tools."

Step 1 (Dependency):
Finds candidate:
Google — partnered — NASA

Step 2 (ML):
Classifies relation as:
Google — COLLABORATES_WITH — NASA

So grammar finds the connection, ML gives it meaning.
```

#### Open Information Extraction (OpenIE)

Use this when you don’t know your schema yet and want to explore what kinds of relationships exist in your data. It is good for early discovery or bootstrapping a knowledge graph, but not ideal for production due to inconsistency.

```
"Tesla designs electric vehicles in California."

Extracted relations:
    Tesla → designs → electric vehicles
    Tesla → operates_in → California

No predefined schema. It just outputs what it thinks is a relation in natural language form.
This is good for discovering unknown patterns.
```

#### LLM-based Extraction

Use this for rapid experimentation or low-volume extraction where human review is expected. It’s good when data is highly unstructured or ambiguous and you want reasoning over strict structure.

```
"Dr. Smith from Johns Hopkins discovered a new treatment for Alzheimer’s disease."

LLM might extract:
    Dr. Smith → WORKS_AT → Johns Hopkins
    Dr. Smith → DISCOVERED → Treatment
    Treatment → TREATS → Alzheimer’s disease

This goes beyond grammar and uses understanding + inference.
```

### Entity Resolution

Figuring out that "Elon M.", "E. Musk", and "The CEO of Tesla" are all the same node.

### Knowledge Fusion

Merging new data with existing graph data without creating duplicates.

### Graph Neural Networks (GNNs):

Advanced deep learning models that can look at a node's neighbors to predict its properties (e.g., predicting if a molecule is toxic based on its atomic structure).
