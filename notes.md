# Possible performance optimisations

`for.*` keeps references to unused virtual nodes for fast reuse. This is a
potential memory "leak" in a sense that if the viewmodel initially requires a
lot of nodes but later only needs a few, the stashed nodes only gunk up the
memory. Might want to keep track and discard nodes that have been unused for
many phases (keeping an average index as an integer should be enough).

# Planned transclusion semantics

Components and molds serve complementary roles.

A component creates a viewmodel isolated from the outer scope, and a template
that defines how that viewmodel should be rendered. Rendering is managed
automatically by atril, using the virtual DOM, and a component is not allowed
to mess with it, for efficiency and safety reasons.

A mold doesn't create a viewmodel. Because of that, it doesn't need to be
isolated from the outer DOM, and is allowed to mess with it in arbitrary ways.
For efficiency and stability, this is done through the virtual DOM, so a mold is
not allowed to mess with the real DOM.

No planned support for `<content selector="...">` because it can potentially
break things like `for.="..."` by changing the order of transcluded nodes in the
way uncontrollable by the outer element that relies on this particular order.

Transclusion with `<content>` is planned for components. The root element of the
transcluded content will receive a reference to the parent of the custom element
into which it was transcluded. When looking for a scope, we'll start from there.

Also considering the possibility of enabling a view and `<content>` for
molds. If a view is provided, it's parsed using the same mechanics as
component views, with the difference that elemends transcluded with
`<content>` become a part of the local DOM and don't receive references to the
original parents (because a mold doesn't create a new scope). A potential
concern is that the view might reference potentially unavailable
identifiers, making assumptions about locals available in the scope where it's
used. It's the same problem as `ng-include`. Still thinking this over.

# Planned `<content>` mechanics

Each root element in the transcluded content keeps a reference to the parent
from which it was taken. The parent may belong to the vanilla DOM (real) or the
virtual atril DOM.

When diffing a child during rendering, we check if it's transcluded.

If it's transcluded from the vanilla DOM, we pass it to a special recursive
diffing function outside of the component container. That function diffs the
content ignoring any custom attributes and giving no special treatment to the
template tags. It also has no access to interpolations from the virtual DOM.

If it's transcluded from the atril DOM, it's phased normally. The scope search
mechanism takes care of maintaining the link to the original viewmodel. It will
check for a link to the original parent, and if it finds one, it will start
scope search from there. This is also how we check if the element comes from the
vanilla DOM (if no viewmodel is found all the way up to `<html>`).

# Other ToDos

Consider providing a 'global.atril' export for scenarios without a module
environment.

Consider adding a "render-once" feature to embed DOM nodes managed by external
code (e.g. third party UI widgets with their own DOM logic). This could be done
by adding a `State` flag to completely skip phasing starting at the given
virtual node and its real counterpart. This needs to be usable without writing
custom molds, so we'll probably add a built-in.

Review the `this` strategy for expressions. Not convinced the flexibility is
worth having to correctly call them in attribute VMs.

When an event is bubbling up through multiple listeners registered from within
our zone context (e.g. with `on.*`), zone makes multiple `afterTask` calls.
Consider to either (1) debounce reflows (is event propagation sync or async? if
async, this is a questionable solution), or (2) use a single document-level
event aggregator as the default way of handling events.

Consider letting components customise their virtual DOM (without access to the
transcluded content, when transclusion is implemented) just before the view is
compiled. It could be an instance lifecycle method, something like `onCompile`.

When interpolating attributes, must sanitise `href`, wiping any `"javascript:"`
links. Consider if `src` must also be sanitised. Consider if the user can
unwittingly let dangerous HTML into the view, and in which scenarios.

Instead of always databinding the element's property, only bind it if there's
no `@bindable` property available.
