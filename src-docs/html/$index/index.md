<div class="space-out-v">
  <doc-features>
    <a href="#elements-and-attributes" class="text-darkorange">
      <div>Custom elements and attributes</div>
      <sf-icon svg-icon.="cubes"></sf-icon>
    </a>
    <a href="#change-detection" class="text-brown">
      <div>Automatic change detection</div>
      <sf-icon svg-icon.="magic"></sf-icon>
    </a>
    <a href="#databinding" class="text-darkred">
      <div>Two-way and one-way databinding</div>
      <sf-icon svg-icon.="arrows-h"></sf-icon>
    </a>
  </doc-features>
  <doc-features>
    <a href="#virtual-dom" class="text-yellow">
      <div>Fast rendering with the virtual DOM</div>
      <sf-icon svg-icon.="bolt"></sf-icon>
    </a>
    <a href="#mpa" class="text-info">
      <div>Multi-page application friendly</div>
      <sf-icon svg-icon.="sitemap"></sf-icon>
    </a>
    <a href="#light" class="text-warning">
      <div>Lightweight (47KB)</div>
      <sf-icon svg-icon.="paper-plane-o"></sf-icon>
    </a>
  </doc-features>
</div>

<p class="info pad">
  <strong>Note:</strong> this documentation shows features from
  EcmaScript 6/7, but they're completely <strong>optional</strong>. You can use
  <code>atril</code> with plain ES5 and any module system. The docs
  include some ES5 examples as well.
</p>

<h1>
  <sf-icon svg-icon.="cubes" class="inline"></sf-icon>
  <span>Custom Elements and Attributes</span>
  <a class="heading-anchor" autolink.="elements-and-attributes">
    <sf-icon class="inline link"></sf-icon>
  </a>
</h1>

The library has three types of building blocks.

* [`Component`](component/): provides a viewmodel and a view.

```html
<my-custom-element></my-custom-element>
```

* [`Attribute`](attribute/): operates on the viewmodel and the real DOM.

```html
<input bind.disabled="isDisabled">
```

* [`Mold`](mold/): mutates a part of the virtual DOM in response to the viewmodel changes.

<!--: <div class="code-pair"> :-->
```html
<template if.="allowed">
  <button>submit</button>
</template>
```

```html
<button if.="allowed">submit</button>
```
<!--: </div> :-->

## Example Component

A custom element (usually called _component_) is a combination of a _view model_
(data and logic) with a _view_ (a template). `atril` renders the view and
automatically updates it whenever the data changes.

<!--: <div class="code-pair"> :-->
```typescript
// Viewmodel.

import {Component} from 'atril';

@Component({
  tagName: 'hello-world'
})
class ViewModel {
  name = 'world';
  static viewUrl = 'hello-world/hello-world.html';
}
```

```html
<!-- Template. -->

<!-- Updates automatically -->
<h1>Hello, {{name}}!</h1>

<!-- Two-way databinding -->
<input twoway.value="name">

<!-- One-way databinding with manual feedback -->
<input bind.value="name" on.input="name = this.value">

<!-- One-way databinding with no feedback;
     on.input is needed to detect user activity -->
<input bind.value="name" on.input>
```
<!--: </div> :-->

```html
<!-- Usage in HTML -->

<hello-world></hello-world>
```

<template doc-demo.>
  <hello-world></hello-world>
</template>

<!--: <sf-collapse class="info">
  <input id="es5-example" type="checkbox">
  <label for="es5-example" class="pad">
    <sf-icon svg-icon.="question-circle" class="inline text-info"></sf-icon>
    Click to see example with EcmaScript 5 and CommonJS.
  </label>
  <div class="code-pair"> :-->
```javascript
var Component = require('atril').Component;

Component({
  tagName: 'hello-world'
})(ViewModel);

function ViewModel() {
  this.name = 'world';
}

ViewModel.viewUrl = 'hello-world/hello-world.html';
```

```html
<!-- Updates automatically -->
<h1>Hello, {{name}}!</h1>

<!-- Two-way databinding -->
<input twoway.value="name">

<!-- One-way databinding with manual feedback -->
<input bind.value="name" on.input="name = this.value">

<!-- One-way databinding with no feedback;
     on.input is needed to detect user activity -->
<input bind.value="name" on.input>
```
  <!--: </div>
</sf-collapse> :-->

<h1>
  <sf-icon svg-icon.="magic" class="inline"></sf-icon>
  <span>Automatic Change Detection</span>
  <a class="heading-anchor" autolink.="change-detection">
    <sf-icon class="inline link"></sf-icon>
  </a>
</h1>

Much like Angular 2, `atril` uses <a href="https://github.com/angular/zone.js"
target="_blank"><code>zone.js</code></a> to automatically detect relevant
events. When something happens, the library reflows the virtual DOM, updating
it with the new data, and carefully updates the view.

Forget about event subscriptions, manual re-renders (ReactJS), digest cycles
(Angular) or observables (Polymer, Aurelia). In `atril`, it just works.

As a side benefit, this architecture allows you to bind to _expressions_ rather
than just properties. See databinding for details.

<h1>
  <sf-icon svg-icon.="arrows-h" class="inline"></sf-icon>
  <span>Databinding</span>
  <a class="heading-anchor" autolink.="databinding">
    <sf-icon class="inline link"></sf-icon>
  </a>
</h1>

The library has one-way and two-way databinding. It lets you automatically
sync values to the view and vice versa. This includes properties of native DOM
elements, and other custom elements in the view.

See [Databinding](databinding/) for details.

<h1>
  <sf-icon svg-icon.="bolt" class="inline"></sf-icon>
  <span>Virtual DOM</span>
  <a class="heading-anchor" autolink.="virtual-dom">
    <sf-icon class="inline link"></sf-icon>
  </a>
</h1>

`atril` maintains a virtual representation of each component's node tree.
Updates to the viewmodel cause changes in the virtual tree. The library diffs
them with the live DOM and carefully updates the view.

This is primarily an implementation detail, and is done for internal
consistency. However, this architecture should enable optimisations for high
rendering performance, similar to ReactJS.

<h1>
  <sf-icon svg-icon.="sitemap" class="inline"></sf-icon>
  <span>Multi-page Application Friendly</span>
  <a class="heading-anchor" autolink.="mpa">
    <sf-icon class="inline link"></sf-icon>
  </a>
</h1>

This library is targeting websites over web applications. It's aimed at
multi-page, document-oriented sites with server-side routing and large amounts
of static content — in other words, the majority of the web.

It's designed to be as light, fast, and non-intrusive as possible. The library
clocks at 47KB, starts up quickly, and you can use custom components just by
including new tags on the page — without any effect on the rest of the content,
routing, or page rendering.

Big-name next generation frameworks like Angular 2 and Aurelia are targeting a
wider range of applications, with the primary focus on single-page apps. You can
certainly use them for any website, but at the moment of writing, they incur a
significant performance and mental overhead for an MPA.

Make a comparison and pick the right tool for the given use case.

<h1>
  <sf-icon svg-icon.="paper-plane-o" class="inline"></sf-icon>
  <span>Lightweight</span>
  <a class="heading-anchor" autolink.="light">
    <sf-icon class="inline link"></sf-icon>
  </a>
</h1>

Despite its power, `atril` is simple at its core. The entire library is 47KB
minified with dependencies. This includes 14KB of `zone.js`, which comes with
a `Promise` polyfill. The library has no other ES6 dependencies.

Browser support: standards-compliant browsers; IE10 and above.
