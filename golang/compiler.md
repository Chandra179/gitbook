# Compiler

## Parsing

source code is tokenized (lexical analysis), parsed (syntax analysis), and a syntax tree is constructed for each source file.

### **Lexical Analysis (The Lexer)**

The lexer reads the source code and breaks it down into tokens. A token is the smallest meaningful unit of the language (keywords, identifiers, operators, punctuation).

Example Code:

```go
package main
```

What the Lexer sees:

1. `_package` (Keyword)
2. `main` (Identifier)
3. `;` (Implicit semicolon added by the lexer)

### Syntax Analysis (The Parser)

The parser is a Pattern Matcher. It does not look at characters; it looks at the _sequence_ of tokens provided by the lexer and asks: _"Does this sequence follow the rules of the Go Language Specification?"_

**The "Valid Order" Example**

Imagine the lexer produces these tokens: `INT(10)`, `ADD(+)`, `IDENT(x)`. The parser accepts this because `Expression = Term { "+" Term }` is a valid rule in Go's grammar.

However, if the lexer produces: `PACKAGE`, `MAIN`, `PACKAGE`, `UTILS`. The Parser triggers an error:

> `syntax error: unexpected package, expecting semicolon or newline or }` Why? Because the grammar rule for a Go file is `SourceFile = PackageClause ";" { ImportDecl ";" } ...`. It expects exactly one package declaration at the top.

### **Construction of the Syntax Tree**

The output of the parser is a Syntax Tree. Each source file is turned into a tree where:

* Nodes represent elements like expressions (`a + b`), declarations (`var x int`), or statements (`if x > 0`).
* Leafs represent the actual values or names (like the number `10` or the variable `x`).

The Syntax Tree is an exact representation of the source file. It even includes the line and column numbers (position information) so that if there is an error later, the compiler can tell you exactly where it happened.

**Example: What a Syntax Tree looks like**

```go
total := 5 + n
```

The compiler creates a node in the tree of type `*syntax.AssignStmt`.

```go
0  *syntax.AssignStmt {
1  .  Op: :=                  // The operation type
2  .  Lhs: *syntax.Name {     // Left Hand Side
3  .  .  Value: "total"       // The variable name
4  .  }
5  .  Rhs: *syntax.BinaryExpr { // Right Hand Side (An expression)
6  .  .  Op: +                 // The operator
7  .  .  X: *syntax.BasicLit { // The first part of the addition
8  .  .  .  Value: "5"
9  .  .  .  Kind: 0 (IntLit)
10 .  .  }
11 .  .  Y: *syntax.Name {     // The second part of the addition
12 .  .  .  Value: "n"
13 .  .  }
14 .  }
15 }
```

At this stage, the compiler is "blind" to meaning.

* It knows `total` is a name.
* It does not know if `total` was already declared.
* It does not know if `n` is an integer, a string, or a function.
* It only knows that the _grammar_ is correct.

## Type Checking

Location: `cmd/compile/internal/types2`

While Phase 1 checked if the "grammar" was correct, Phase 2 checks if the "meaning" is correct. According to the official Go compiler README, this phase is primarily handled by the `types2` package.

### The "Inventory" Pass (collectObjects)

Before verifying logic, the compiler scans all files in your package to build a complete list of declarations.&#x20;

* It creates placeholder objects for every `func`, `var`, `const`, and `type`.
* The "Color" System: The compiler marks objects as White (not started), Grey (processing), or Black (finished). If it encounters a Grey object while trying to resolve another, it knows you have a circular dependency (e.g., `type A B; type B A`) and throws an error.

### Constant Evaluation

If you have expressions like `const Max = 1024 * 1024`, the compiler evaluates this result (`1048576`) during this phase. This ensures that the math is done once during compilation, not every time the program runs.

```go
const (
    SecondsInHour = 60 * 60          // Evaluated to 3600
    IsVisible     = (10 > 5) && true // Evaluated to true
)
```

### Type Inference and Validation

This is the core of the "Type Safety" Go is known for. The compiler walks the tree and:

* Resolves Identifiers: Connects a name like `fmt.Println` to the actual function in the `fmt` package.
* Deduces Types: In `x := 5`, it deduces that `x` is an `int`.
* Checks Compatibility: Ensures you aren't trying to add a `string` to an `int` or passing a `float64` to a function that expects an `int`.
* Interface Verification: Confirms that if you assign a `struct` to an `interface`, the struct actually implements all required methods.

## IR Construction (Noding)

Location: `cmd/compile/internal/noder`

The compiler has two things on its desk:

1. The Syntax Tree: The structure of your code (`total := 5 + n`).
2. The Type Info: A side-table from `types2` that says "`n` is an `int`" and "`total` is a new variable."

Noding is the process of smashing these two things together to create a single, unified "Node" tree that the rest of the compiler can use.

**1. Serialization (Writing the IR)**

The compiler takes the `syntax tree` and the `types2` information and "pickles" (serializes) them into a compact binary format called Unified IR.

* Why? Because this binary format is much easier for the computer to move around than the complex syntax tree.

**2. Deserialization (Reading the IR)**

The compiler immediately reads that binary data back. While reading, it constructs the `ir.Node` tree.

* The Transformation: It turns `syntax.AssignStmt` (which is just about grammar) into `ir.AssignStmt` (which is about execution).

**3. Lowering and Implicit Logic**

This is the most important part of Noding. The compiler adds things that weren't in your source code but are required for the program to work:

* Implicit Conversions: If you have `var x interface{} = 10`, the Noder inserts a `CONVIFACE` node. Your source code didn't show a conversion, but the Noder makes it explicit.
* Closure Wrapping: If you have a function inside a function, the Noder starts the work of figuring out how to "capture" variables.
* Dictionary Insertion: For Generics, the Noder inserts "dictionaries" that tell the code which specific types to use (e.g., turning `List[T]` into `List[int]`).

By the end of Noding, the compiler has a Middle-end IR (Intermediate Representation). Compared to your Syntax Tree example, the IR Tree looks like this

```go
// The IR Node for: total := 5 + n
AS2 (Assignment)
.  LHS: NAME-main.total (Type: int, Escapes: no)
.  RHS: ADD (Type: int)
.  .  X: LITERAL-5 (Type: int)
.  .  Y: NAME-main.n (Type: int)
```

Notice the difference:

* Syntax Tree: Only knew the name was `"total"`.
* IR Tree: Knows `total` belongs to `package main`, it's an `int`, and it already knows (after a quick check) if the variable "escapes" to the heap or stays on the stack.

## Middle End

Several optimization passes are performed on the IR representation: dead code elimination, (early) devirtualization, function call inlining, and escape analysis. For example

**1. Inlining (`cmd/compile/internal/inline`)**

This is often the most impactful optimization.

* The Goal: Eliminate the overhead of calling a function.
* The Process: If you have a small function like `func IsPositive(x int) bool { return x > 0 }`, the compiler replaces the _call_ to that function with the actual _logic_ inside the function.
* The Benefit: It saves the time it takes to push arguments onto the stack and jump to a new memory address.

**2. Devirtualization (`cmd/compile/internal/devirtualize`)**

* The Goal: Turn "interface" calls into "direct" calls.
* The Process: If the compiler can prove that an interface variable always contains a specific concrete type (e.g., you are calling `Write` on an interface, but the compiler sees it's _always_ a `os.File`), it rewrites the IR to call the `os.File.Write` method directly.
* The Benefit: It bypasses the "itabs" (interface tables) lookups, which is much faster.

**3. Escape Analysis (`cmd/compile/internal/escape`)**

* The Goal: Decide where memory should live.
* The Process: The compiler looks at the IR nodes to see if a variable's address is passed outside the function.
  * Stack: If the variable stays inside the function, it's kept on the stack (very fast, cleaned up automatically).
  * Heap: If the variable "escapes" (e.g., returned as a pointer), it is moved to the heap (slower, requires Garbage Collection).
* The Benefit: This is why Go developers don't have to manually choose between stack and heap; the Middle End calculates it for you.

and many more...

## Walk

The final pass over the IR representation is “walk,” which serves two purposes:

**1. Order of Evaluation (The "Order" part)**

It decomposes complex statements into individual, simpler statements, introducing temporary variables and respecting order of evaluation. This step is also referred to as “order.” In Go, you can write complex single lines of code. The CPU, however, can only do one tiny thing at a time.

* The Problem: `f(g(), h())`. Which runs first? `g` or `h`?
* The Walk Solution: It breaks that one line into three:
  1. `temp1 := g()`
  2. `temp2 := h()`
  3. `f(temp1, temp2)`
* Result: It ensures the program follows the Go spec's rules for exactly what happens in what order.

**2. Desugaring (The "Runtime" part)**

"Syntactic Sugar" refers to features that make life easy for humans but don't exist in hardware. CPUs don't know what a `map`, a `channel`, or a `select` statement is.

* The Process: Walk "desugars" these into calls to the Go Runtime (the `runtime` package).
* Examples:
  * `make(map[string]int)` becomes a call to `runtime.makemap`.
  * `ch <- x` becomes a call to `runtime.chansend1`.
  * `append(slice, x)` becomes logic that checks capacity and potentially calls `runtime.growslice`.

It is called "Walk" because the compiler walks the IR tree one last time. As it visits each node, it replaces high-level nodes with a sequence of lower-level nodes.

## Generic SSA

In this phase, IR is converted into Static Single Assignment (SSA) form, a lower-level intermediate representation with specific properties that make it easier to implement optimizations and to eventually generate machine code from it.

### What is SSA?

In regular Go code, you can change a variable's value many times:

```go
x := 1
x = x + 2
x = 5
```

In SSA, a variable is never changed. Every time a value is assigned, a new "version" of that variable is created. The code above becomes

```go
x_1 = 1
x_2 = x_1 + 2
x_3 = 5
```

Why do this? It makes it incredibly easy for the compiler to see that `x_2` is never actually used, so the math `1 + 2` can be deleted entirely. For example

**1. The Conversion (`ssagen`)**

The compiler "walks" your simplified IR and builds a Control Flow Graph (CFG). Instead of a list of lines, your code becomes a series of "blocks" connected by arrows (jumps).

**2. Intrinsics (The "Fast Track")**

If you use a function like `math.Sqrt(x)`, the compiler doesn't actually call a Go function. It swaps that node for a single, high-speed CPU instruction (like `SQRTSD` on Intel).

**3. Generic Rewrite Rules (Architecture Independent)**

Before the compiler worries about whether you are on an iPhone (ARM) or a PC (Intel), it applies "Generic" rules that work everywhere.

* Lowering `copy`: It turns the `copy()` function into raw memory-move instructions.
* Algebraic Simplification: If the code says `x * 1`, the SSA pass simply deletes the `* 1`. If it sees `x << 0`, it deletes the shift.
* Nil Check Elimination: If the compiler can prove you already checked if a pointer is nil (or if it was just created), it removes all subsequent nil checks for that pointer.
