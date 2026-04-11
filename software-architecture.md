# Software Architecture

Architecture characteristics refers to the “-ilities” that the system must support

Architecture decisions define the rules for how a system should be constructed

* what is and isn't allowed
* if decision cannot be implemented because of constraint we cannot do, we broke them into variance. Those models formalize the process for seeking a variance to a particular standard or architecture decision. either approved or denied based on justifications and trade-offs.

Design principle&#x20;

* Design principle is a guideline rather than a hard-and-fast rule.&#x20;
* An architecture decision (rule) could never cover every condition and option for communication between services, so a design principle can be used to provide guidance for the preferred method (in this case, asynchronous messaging) to allow the developer to choose a more appropriate communication protocol (such as REST or gRPC) given a specific circumstance

Expectation of Architect

* Make architecture decisions
* Continually analyze the architecture
* Keep current with latest trends
* Ensure compliance with decisions
* Diverse exposure and experience
  * An effective software architect should be aggressive in seeking out opportunities to gain experience in multiple languages, platforms, and technologies. A good way of mastering this expectation is to focus on **technical breadth** rather than technical depth
  * Technical breadth includes the stuff you know about, but not at a detailed level, combined with the stuff you know a lot about. For example, it is far more valuable for an architect to be familiar with 10 different caching products and the associated pros and cons of each rather than to be an expert in only one of them.
* Have business domain knowledge
  * The most successful architects we know are those who have broad, hands-on technical knowledge coupled with a strong knowledge of a particular domain.
* Possess interpersonal skills
* Understand and navigate politics

Building Evolutionary Architectures (books)

