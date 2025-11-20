# Knowledge Graph

### Data Source

PDFs, web page, etc. We use docling to extract PDFs data because it can extract image, graph, etc..

### Node & Relationship Extraction

Extract node from the text using NER then define the relationship

#### Dependency Parsing (base syntactic relations)

Use this when you want fast, explainable relations based purely on grammar, such as subject–verb–object patterns in relatively clean text.&#x20;

```
"Apple acquired Beats for $3 billion in 2014."

Extracted idea: Apple → acquired → Beats

Subject = Apple
Verb = acquired
Object = Beats

It does NOT understand business meaning, only grammar.
```

#### ML Relation Extraction (OpenNRE / Transformer-based)

Use this when you need semantic accuracy and defined relationship types (e.g., “uses”, “belongs\_to”, “causes”). It works best when you already have a schema and want higher precision, especially for enterprise or production knowledge graphs. This approach understands context better than dependency rules but requires more setup and compute.

```
"Apple acquired Beats for $3 billion in 2014."

Extracted idea:

Apple → ACQUISITION → Beats

Instead of using the verb "acquired", it maps the relationship to a predefined semantic type like:
Apple — ACQUIRED_COMPANY — Beats

This is useful when your knowledge graph needs consistent relationship types, not raw verbs.
```

#### Hybrid Approach (Dependency + ML)

This is the most common industry choice for unstructured data. Dependency parsing identifies possible relation candidates, and ML then validates or classifies them. Use this when you want both scalability and reliability, especially for large corpora like technical markdown, research papers, or documentation.

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
