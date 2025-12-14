# Knowledge Graph

#### UseCase: Economy causalities&#x20;

* Ingestion:
  * Images:  `Image Captioning` (Llama3) $$\rightarrow$$ Append caption to text.
  * Tables: Run `Table-to-Markdown` parsing $$\rightarrow$$ Convert to text grid.
  * Math: Run `OCR` $$\rightarrow$$ Convert to LaTeX string.
  * Output: markdown
* Chunking the data per markdown header before feed to LLM
* Coreference resolution: _Prompt:_ "Resolve pronouns (he, it, they, this move) to the specific entity names they refer to in your output."
* Top relationships: `LEADS_TO, STIMULATES, MITIGATES, DRIVES_DEMAND_FOR, TRIGGERED_BY`
*   Use Prompt engineering to extract the relationship from text. use LLM models (Llama 3)

    ```
    You are an expert economic analyst. Your task is to extract causal relationships from financial text.

    You must extract relationships matching ONLY these categories:
    1. LEADS_TO: A general positive outcome or result.
    2. STIMULATES: An active, sharp boost or encouragement (active verb).
    3. MITIGATES: A reduction of a negative effect or risk.
    4. DRIVES_DEMAND_FOR: An increase in market appetite or consumption.
    5. TRIGGERED_BY: The initial event that started a chain (reverse logic).
    6. CONSTRAINS: A structural limit, cap, or restriction.

    Rules:
    - Extract the entities exactly as they appear in the text.
    - If no causal relationship exists, return an empty list.
    - Output MUST be valid JSON with the following schema:
      [
        {"subject": "Entity A", "relation": "LABEL", "object": "Entity B", "confidence": "High/Medium/Low"}
      ]
    ```
* Entity disambiguation: Use vector search nearest neighbor after schema is generated

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

