# Information Extraction

NER using spacy

Relation extraction&#x20;

* Dependency Parsing `Elon Musk ──(subject)── founded ──(object)── SpaceX`
*   Machine Learning Relation Classification, figuring out the relation betwen entities

    ```
    [start_100] text(1..n) [end_300]
    [Elon Musk] founded    [SpaceX]
    ```
*   But how does it know which relation to use? This is defined by an ONTOLOGY, example

    ```
    Person -> Organization:
      - works_for
      - founded
      - owns
    Person -> Location:
      - born_in
      - lives_in
    ```

Entity linking&#x20;

REBEL model

* per batch, 200–400 words per chunk
