# Knowledge Graph

#### Ingestion & Transformation

* Convert your raw data (PDFs, Images, Tables) into a unified text format (preferably Markdown)
* Images: Run `Image Captioning` (Gemini/GPT-4o) $$\rightarrow$$ Append caption to text.
* Tables: Run `Table-to-Markdown` parsing $$\rightarrow$$ Convert to text grid.
* Math: Run `OCR` $$\rightarrow$$ Convert to LaTeX string.

#### Coreference Resolution

* Resolve "He," "She," "It."
* If a caption says _"He is standing next to the car,"_ you need to change it to _"Elon Musk is standing next to the car"_ before extraction

#### NER & Attribute Linking

* Text NER: Run RoBERTa/DeBERTa on the main text _and_ the image captions. _Extract:_ "Elon Musk" (Person), "Tesla" (Org).
* Math/Numerical: Identify the LaTeX formulas and numbers. _Link:_ "44 Billion" is flagged as an Attribute (Money), not a Node.

#### Entity Disambiguation

* Linking "E. Musk," "Elon," and "Elon R. Musk"
* Ensure the entity found in the text and the entity found in the table row are merged.

#### Relationship Extraction

* The same relationship can be expressed in many ways ("A works for B," "B employs A," "A is employed by B").
* Text: Use the model to find context between spans: `(Elon Musk) -> [CEO_OF] -> (Tesla)`.
* Table: Use headers: `(Twitter) -> [ACQUISITION_COST] -> (44 Billion)`.

#### Construction

* Push triples to Neo4j.
