# Knowledge Graph

* Input: PDFs, web page
* Nodes (Entities): represent real-world objects (e.g., _Elon Musk_, _Tesla_, _SpaceX_).
* Edges (Relationships): represent the connection between nodes (e.g., _founded_, _is CEO of_).
* Properties: represent attributes of a node (e.g., _Elon Musk_ has age: _52_).
* Ontology (Schema): The "rulebook" that defines what types of things can exist and how they relate. For example, it defines that a `Person` can `work_for` a `Company`, but a `Company` cannot `marry` a `Car`.
* Entity Extraction (NER): Scanning text to find nouns (People, Places, Orgs)
* Relationship Extraction: Identifying verbs that connect the nouns.
* Entity Resolution: Figuring out that "Elon M.", "E. Musk", and "The CEO of Tesla" are all the same node.
* Graph DB using Neo4j
* Knowledge Fusion: Merging new data with existing graph data without creating duplicates.
* \[Advanced] Graph Neural Networks (GNNs): Advanced deep learning models that can look at a node's neighbors to predict its properties (e.g., predicting if a molecule is toxic based on its atomic structure).
