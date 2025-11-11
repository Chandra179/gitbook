# ReactJS

#### Virtual DOM

```javascript
function App() {
  return (
    <div>
      <h1>Hello</h1>
      <p>World</p>
    </div>
  );
}

// === Virtual Dom ===
// It’s just JS objects in memory, not real DOM nodes.
{
  type: "div",
  props: {},
  children: [
    { type: "h1", props: {}, children: ["Hello"] },
    { type: "p", props: {}, children: ["World"] }
  ]
}

```

React doesn’t manipulate the real DOM directly. Instead, it uses a **Virtual DOM**:

1. React creates a **virtual tree** of components in memory.
2. When state changes:
   * React **calculates the difference** (diffing) between the new virtual DOM and the previous one.
   * React **updates only the necessary parts** of the real DOM.

#### **Component Lifecycle**

* A component **mounts** when it is **first added to the DOM** (shown on the screen).&#x20;
* A component re-renders due to **state or props change**.
* A component **unmounts** when it is **removed from the DOM**.
* React cleans up state, event listeners, etc., for that component.

{% hint style="info" %}
Rendering : React prepares the UI (virtual DOM calculation)
{% endhint %}

```javascript
// ===============
// Parent Component Removes the Child
// ===============
function Parent() {
  const [showChild, setShowChild] = useState(true);

  return (
    <>
      {showChild && <Child />}
      <button onClick={() => setShowChild(false)}>Remove Child</button>
    </>
  );
}

// ===============
// Entire App Is Removed from DOM
// ===============
import ReactDOM from "react-dom/client";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
root.unmount(); // All components in <App /> are unmounted

```

#### **Hooks**

React **state** is local to a component.

* When a component **mounts** (appears on screen), its state is initialized.
* As long as the component **remains mounted**, the state persists—even if the component re-renders due to changes in state or props.
* When a component **unmounts** (removed from the UI), its state is **lost**.

**useEffect** runs AFTER the component finishes mounting

```javascript
// ✅ A. No dependency array
// You didn’t tell me what depends on this, so I assume it depends on EVERYTHING.
useEffect(() => {
  console.log("A. I run after EVERY render (mount + re-render)");
});

// ✅ B. Empty dependency array
// Effect has no dependencies — nothing will ever change — run only once
useEffect(() => {
    console.log("B. I run ONLY once (after first mount)");
}, []);

// ✅ C. With dependency
// React, run this effect ONLY when count changes.
useEffect(() => {
    console.log("C. I run on mount AND when count changes");
}, [count]);
```
