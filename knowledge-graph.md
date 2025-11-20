# Knowledge Graph

#### Input data

PDFs, web page, etc. We use docling to extract PDFs data because it can extract image, graph, etc..

#### Ontology (Schema)

Use existing schema like Schema.org, FIBO for finance or we can define the rules manually. An overly complex ontology (too many Node types, too many Relationship types) will hurt you in three specific ways: `Query Performance, LLM Confusion, and Maintenance Costs` .&#x20;



* Nodes (Entities): represent real-world objects (e.g., _Elon Musk_, _Tesla_, _SpaceX_).
* Edges (Relationships): represent the connection between nodes (e.g., _founded_, _is CEO of_).
* Properties: represent attributes of a node (e.g., _Elon Musk_ has age: _52_).
* Entity Extraction (NER): Scanning text to find nouns (People, Places, Orgs)
* Relationship Extraction: Identifying verbs that connect the nouns.
* Entity Resolution: Figuring out that "Elon M.", "E. Musk", and "The CEO of Tesla" are all the same node.
* Graph DB using Neo4j
* Knowledge Fusion: Merging new data with existing graph data without creating duplicates.
* \[Advanced] Graph Neural Networks (GNNs): Advanced deep learning models that can look at a node's neighbors to predict its properties (e.g., predicting if a molecule is toxic based on its atomic structure).
