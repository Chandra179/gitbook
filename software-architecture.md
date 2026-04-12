# Software Architecture Fundamentals

Architecture characteristics refers to the “-ilities” that the system must support

Architecture decisions define the rules for how a system should be constructed

* what is and isn't allowed
* if decision cannot be implemented because of constraint we cannot do, we broke them into variance. Those models formalize the process for seeking a variance to a particular standard or architecture decision. either approved or denied based on justifications and trade-offs.

Design principle

* Design principle is a guideline rather than a hard-and-fast rule.
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

## Modularity

#### **Cohesion**&#x20;

Cohesion refers to what extent the parts of a module should be contained within the\
same module

* Functional cohesion\
  Every part of the module is related to the other, and the module contains every‐\
  thing essential to function.
* Sequential cohesion\
  Two modules interact, where one outputs data that becomes the input for the\
  other.
* Communicational cohesion\
  Two modules form a communication chain, where each operates on information\
  and/or contributes to some output. For example, add a record to the database\
  and generate an email based on that information.
* Procedural cohesion\
  Two modules must execute code in a particular order.\
  Temporal cohesion\
  Modules are related based on timing dependencies. For example, many systems\
  have a list of seemingly unrelated things that must be initialized at system\
  startup; these different tasks are temporally cohesive.
* Logical cohesion\
  The data within modules is related logically but not functionally. For example,\
  consider a module that converts information from text, serialized objects, or\
  streams. Operations are related, but the functions are quite different. A common\
  example of this type of cohesion exists in virtually every Java project in the form\
  of the StringUtils package: a group of static methods that operate on String\
  but are otherwise unrelated.
* Coincidental cohesion\
  Elements in a module are not related other than being in the same source file;\
  this represents the most negative form of cohesion.

LCOM metrics

## Coupling

based in part on graph theory: because the method calls and returns form a call graph, analysis based on mathematics becomes possible.

## Architecture Characteristics

Specifies a nondomain design consideration

* specify operational and design criteria for\
  success, concerning how to implement the requirements and why certain choices\
  were made.

Influences some structural aspect of the design

* project concerns and design considerations, For example, security is a concern in virtually every project, and all systems must take a baseline of precautions during design and coding. However, it rises to the level of architecture char acteristic when the architect needs to design something special. Consider two cases surrounding payment in a example system:
  * **Third-party payment processor**\
    If an integration point handles payment details, then the architecture\
    shouldn’t require special structural considerations. The design should incor‐\
    porate standard security hygiene, such as encryption and hashing, but\
    doesn’t require special structure.
  * **In-application payment processing**\
    If the application under design must handle payment processing, the archi‐\
    tect may design a specific module, component, or service for that purpose to\
    isolate the critical security concerns structurally. Now, the architecture char‐\
    acteristic has an impact on both architecture and design.

Is critical or important to application success

* Thus, a critical job for architects lies in choosing the fewest architecture\
  characteristics rather than the most possible.

### implicit versus explicit architecture characteristics

**Implicit** ones rarely appear in requirements, yet they’re necessary for project success. For example, availability, reliability, and security underpin virtually all applications, yet they’re rarely specified in design documents. Architects must use their knowledge of the problem domain to uncover these architecture char‐ acteristics during the analysis phase. For example, a high-frequency trading firm may not have to specify low latency in every system, yet the architects in that problem domain know how critical it is. **Explicit** architecture characteristics appear in require‐ ments documents or other specific instructions.

### Operational Architecture Characteristics

These characteristics focus on the system's runtime capabilities and its intersection with DevOps and operations.

| Term                   | Definition                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Availability**       | How long the system needs to be available (e.g., 24/7). Requires plans for quick recovery in case of failure.                             |
| **Continuity**         | Disaster recovery capability.                                                                                                             |
| **Performance**        | Includes stress testing, peak analysis, capacity planning, and response times.                                                            |
| **Recoverability**     | Business continuity requirements; how quickly the system must be back online after a disaster, affecting backup and hardware strategies.  |
| **Reliability/Safety** | Assessment of whether the system is mission-critical or fail-safe (e.g., affecting lives or causing massive financial loss upon failure). |
| **Robustness**         | Ability to handle error and boundary conditions, such as power outages, internet loss, or hardware failure.                               |
| **Scalability**        | The system's ability to maintain performance as the number of users or requests increases.                                                |

***

### Structural Architecture Characteristics

These characteristics concern the internal code quality, modularity, and the physical structure of the software.

| Term                      | Definition                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Configurability**       | Ability for end users to easily change software settings through usable interfaces.                        |
| **Extensibility**         | How easily new functionality can be plugged into the existing system.                                      |
| **Installability**        | Ease of system installation across all necessary platforms.                                                |
| **Leverageability/Reuse** | Ability to use common components across multiple products.                                                 |
| **Localization**          | Support for multiple languages, currencies, units of measure, and multibyte characters.                    |
| **Maintainability**       | How easy it is to apply changes, fix bugs, and enhance the system.                                         |
| **Portability**           | The need for the system to run on more than one platform (e.g., different database types).                 |
| **Supportability**        | The level of technical support, logging, and debugging facilities required for the application.            |
| **Upgradeability**        | Ability to quickly and easily move from a previous version to a newer version on both servers and clients. |

***

### Cross-Cutting Architecture Characteristics

These are critical design constraints and considerations that often defy simple categorization into structural or operational buckets.

| Term                        | Definition                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Accessibility**           | Access for all users, including those with disabilities (e.g., colorblindness or hearing loss).                             |
| **Archivability**           | Requirements for data deletion or archival to secondary storage after a specific period.                                    |
| **Authentication**          | Security requirements to verify that users are who they say they are.                                                       |
| **Authorization**           | Security requirements to ensure users only access permitted functions (at the page, field, or rule level).                  |
| **Legal**                   | Legislative constraints the system must follow (e.g., GDPR, Sarbanes-Oxley, data protection laws).                          |
| **Privacy**                 | Ability to hide transactions from internal employees, such as DBAs or network architects, via encryption.                   |
| **Security**                | Requirements for data encryption (at rest and in transit) and remote access protocols.                                      |
| **Usability/Achievability** | The level of training required for users to meet their goals; treated with the same priority as other architectural issues. |

### Trade-Offs and Least Worst Architecture

Applications can only support a few of the architecture characteristics we’ve listed for a variety of reasons.&#x20;

1. each of the supported characteristics requires design effort and perhaps structural support.&#x20;
2. the bigger problem lies with the fact that each architecture characteristic often has an impact on others. For example, if an architect wants to improve security, it will almost certainly negatively impact performance

Each architecture characteristic that an architect designs support for potentially complicates the overall design. Thus, architects rarely encounter the situation where they are able to design a system and maximize every single architecture characteristic. More often, the decisions come down to trade-offs between several competing concerns.

## Identifying Architectural Characteristics

translate domain concerns to identify the right architectural characteristics. For example, is scalability the most important concern, or is itfault tolerance, security, or performance? Perhaps the system requires all four characteristics combined. Understanding the **key domain goals and domain situation**

* One tip when collaborating with domain stakeholders to define the driving architec‐\
  ture characteristics is to work hard to keep the final list as short as possible
* A common anti-pattern in architecture entails trying to design a generic architecture, one that supports all the architecture characteristics. supporting too many architecture characteristics leads to greater and greater complexity before the archi‐\
  tect and developers have even started addressing the problem domain, the original\
  motivation for writing the software. **Don’t obsess** over the number of charateristics,\
  but rather the motivation to **keep design simple**.

