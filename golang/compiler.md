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
