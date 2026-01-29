# CPU

## CPU Addresses Memory

The CPU treats memory like a massive array of numbered slots. Each slot has a unique address (a number).

**The Address Bus**

This is a physical set of wires connecting the CPU to the RAM. If a CPU wants to read data, it places the binary address of that data onto the address bus.

**Memory Controller**

This component sits between the CPU and RAM. It "sees" the address on the bus, finds that specific physical location in the memory chips, and opens the "gate" for that data to flow back to the CPU via the Data Bus.

***

The CPU doesn't "decide" where things go on its own; it follows three main guides:

### **The Instruction Set**

When a programmer writes code, it is compiled into machine code. An instruction might look like this in assembly:

```
MOV EAX, [0x4001]
```

This literally tells the CPU: "Go to memory address 0x4001, grab whatever is there, and put it in the EAX register." The "where" is hardcoded into the program's instructions.

### **Registers**

**Program Counter (PC)**

It holds the address of the _next_ instruction. Once an instruction is fetched, the PC increments to the next address so the CPU knows where to go next.

**Stack Pointer (SP)**

This holds the address of the "top" of the stack. When you call a function, the CPU looks at the SP to know exactly where to write the return address.

**Segmentation and Offsets**

We deal with offsets. Instead of using one giant number, the CPU often uses a Base Address (the start of a memory region) + an Offset (how far into that region to look).

* Example: If your "Data Region" starts at `1000` and you want the 5th item, the CPU calculates `1000 + 5 = 1005`.

***

## Memory

#### Memory Regions

Even though RAM is one long physical strip, the Operating System divides it into specific regions for every running program to keep things organized.

**Stack (Automatic & Fast)**

Stack handles the immediate, short-term needs of functions.

* Stores local variables, function parameters, and return addresses.
* Uses LIFO (Last-In, First-Out). When a function is called, a "frame" is pushed on; when it finishes, the frame is popped off.
* Hardware Link: Controlled directly by the **Stack Pointer (SP) register**. It is incredibly fast because the CPU always knows exactly where the next piece of data goes.

**Heap (Flexible & Large)**

Heap used for data that needs to stay around for a long time or is too big for the stack.

* Stores global variables or data created "on the fly" (like a large image file or a list of users).
* Logic: Managed manually by the programmer or the language's "Garbage Collector." It has no set order; the OS just finds an empty hole in memory and sticks the data there.
* Hardware Link: Accessed via Pointers stored in general-purpose registers. It is slower than the stack because the CPU has to "lookup" where the data was stored.

#### Shared Address Space

Every program is given its own Virtual Address Space, which is a continuous range of numbers (addresses) from $$0$$ to a maximum value determined by the CPU bit-width (e.g., $$2^{64}-1$$).

{% hint style="info" %}
The Stack and Heap are not separate physical boxes; they are just designated territories within this single number line.
{% endhint %}

#### The "Collision" Prevention

In a typical memory layout, the Stack and the Heap are placed at opposite ends of the memory region:

* The Stack starts at a high address and grows down.
* The Heap starts at a lower address and grows up. This design ensures they have the maximum amount of space to grow before they potentially crash into each other.

#### **Memory Width (12, 24, 32, 64 bits)**

Usually, when we talk about 32-bit or 64-bit systems, we are talking about the width of the registers and the address bus. A 64-bit CPU can "address" much more memory ($$2^{64}$$ bytes) than a 32-bit CPU ($$2^{32}$$ bytes, or 4GB).

#### **Virtual Memory**

Every program thinks it has access to the entire memory range (e.g., from address `0` to Max). The MMU (Memory Management Unit) intercepts these "virtual" addresses and maps them to "physical" addresses in the actual RAM chips.

## Execution Cycle

1. Fetch: The CPU looks at the Program Counter, goes to that address in Memory, and grabs the instruction.
2. Decode: The Control Unit figures out what the instruction means (e.g., "This is an addition command").
3. Execute: The ALU performs the math, or data is moved between Registers.
4. Store: The result is written back to a register or a specific memory address.
