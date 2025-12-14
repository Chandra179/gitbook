# Strings

Using `+=` for string concatenation is **inefficient approach** especially when working with large or numerous strings. Here’s why:

1. **String Immutability**: Strings in Go are immutable, they can’t be modified after creation. Every time you use `+=` to append to a string, Go creates a new string that combines the original with the new part. The previous strings are discarded, and the program needs to reallocate memory for each new string. This causes unnecessary memory allocation and copying.
2. **Performance Bottleneck**: With each new allocation, the previous memory allocation becomes unused, leading to **more garbage collection work**. As the number of concatenations grows, this approach can significantly impact performance, causing a slowdown that increases with the number of concatenated parts.

```go
func concat(values []string) string { // ["hello", "world", "!"]
    s := ""
    for _, value := range values {
        s += value // Each iteration creates a new string in memory
    }
    return s
}

// 0xx1 hello
// 0xx2 hello world
// 0xx3 hello world !
```

### The Solution: Using `strings.Builder` <a href="#id-9498" id="id-9498"></a>

`strings.Builder` manages an **internal byte slice (buffer)** where it accumulates the strings you append, without creating a new string every time. This approach is both faster and more memory-efficient because it minimizes the number of allocations.

Here’s how `strings.Builder` works:

* The `Builder` starts with an **empty internal buffer**.
* Each time you call `WriteString`, it appends the new string’s bytes to this buffer.
* Once you’ve added all the parts, calling `String()` on the `Builder` reads the buffer’s contents as a single string.

```go
import "strings"

func concat(values []string) string {
    var sb strings.Builder
    for _, value := range values {
        sb.WriteString(value) // Appends each string to the internal buffer
    }
    return sb.String() // Converts the entire buffer to a single string
}
```

#### Why This is Better <a href="#id-346d" id="id-346d"></a>

1. **Reduced Allocations**: `strings.Builder` minimizes the number of memory allocations by maintaining a single buffer, which grows only as needed.
2. **Memory Efficiency**: Since it uses a single internal buffer for all the strings, there is less memory copying, resulting in better overall memory use.
3. **Improved Performance**: By avoiding frequent reallocations, `strings.Builder` performs faster when working with a large number of strings.

### Enhancing Efficiency Further with `Grow` <a href="#id-1b3d" id="id-1b3d"></a>

If you know the total size of the final concatenated string in advance, you can use `Builder`'s `Grow` method to pre-allocate the required memory. This avoids the cost of dynamically resizing the buffer as you add strings, making it even more efficient.

```go
func concat(values []string) string {
    total := 0
    for _, value := range values {
        total += len(value)
    }
    
    var sb strings.Builder
    sb.Grow(total) // Pre-allocate space for total bytes

    for _, value := range values {
        sb.WriteString(value)
    }
    return sb.String()
}
```
