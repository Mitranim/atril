## `let.*`

Defines a new property in the current scope, assigning the given value.

The reason you need this is because unlike typical expression parsers in
frameworks like Angular or Polymer, expressions in `atril` don't silently
swallow references to missing properties. If you try to reference a property
that doesn't exist on the viewmodel, it throws an error.

`let` lets you explicitly define a new property from your view.

Example:

<!--: <div class="code-pair"> :-->
```typescript
class VM {
  constructor() {
    console.log("I don't know what eidolon means");
  }
}
```

```html
<div let.eidolon="''">
  <input on.input="eidolon = this.value">
  <p>{{eidolon}}</p>
</div>
```
<!--: </div> :-->

Without `let` or an explicit property definition in the class, this would throw
a missing reference error.

`let` is implemented as a mold, so you can use it on a `template` tag (only the
contents are included into the DOM).

```html
<template let.eidolon="''">
  <input on.input="eidolon = this.value">
  <p>{{eidolon}}</p>
</template>
```

<template doc-demo.>
  <template let.eidolon="''">
    <input on.input="eidolon = this.value" placeholder="I don't throw an error!">
    <p>{{eidolon}}</p>
  </template>
</template>
