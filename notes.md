Review the `this` strategy for expressions. Not convinced the flexibility is
worth having to correctly call them in attribute VMs.

For molds, demo how to make a live markdown component, and how to optimise it
for speed through the isDomImmutable convention (unlike `if.`, this property
will need to be set on the state of the template itself).

Consider making `isDomImmutable` a mold VM property rather than state property,
in order to avoid leaking state. Figure out if it's possible to reconcile this
with the need to specify it separately on different children in `for.`.

# Possible performance optimisations

Expressions are currently re-evaluated on each call. This is done in order to
support locals without inheriting a masking object from the scope (which works
fine for reads but breaks writes), or mutating the scope by assigning the locals
to it. Should look into ways to fix that.

Lots and lots of expressions are going to be just property references. Should be
easy to optimise this without writing an expression compiler. Should also
emulate the behaviour of other expressions when the property is not in scope
(throw a reference error).

`for.*` keeps references to unused virtual nodes for fast reuse. This is a
potential memory "leak" in a sense that if the viewmodel initially requires a
lot of nodes but later only needs a few, the stashed nodes only gunk up the
memory. Might want to keep track and discard nodes that have been unused for
many phases (keeping an average index as an integer should be enough).

Consider ways to localise reflow. Currently we reflow from each root. For
inputs, it would be great if we could figure out that the given reflow is caused
by an input event somewhere at the bottom of the tree, and reflow only that
part. Might be the biggest performance improvement we can make.

# Transclusion semantics

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

Also considering the possibility of enabling a template and `<content>` for
molds. If a template is provided, it's parsed using the same mechanics as
component templates, with the difference that elemends transcluded with
`<content>` become a part of the local DOM and don't receive references to the
original parents (because a mold doesn't create a new scope). A potential
concern is that the template might reference potentially unavailable
identifiers, or make assumptions about available locals in the scope where it's
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

Consider ways of letting non-molds opt into attaching to the virtual element
instead of the real one. Not keen on the idea of autoassigning both virtual and
real. But it makes sense to provide virtual DOM access to _some_ of those
attributes, on an opt-in basis.

Consider adding a "render-once" feature to embed DOM nodes managed by external
code (e.g. third party UI widgets with their own DOM logic).

Consider async queueing and batching of DOM updates.

Consider if we no longer need to reassign the autoassigned values in bindings
during each phase. Real nodes are now guaranteed to be mapped 1-1 to virtual
ones. Scopes should also be stable now.

# Expressions

Considering a custom expression compiler. Will allow us to:
* Safeguard access to globals.
* May or may not allow to avoid reinterpreting the expression on each call.
* Property accessors can be compiled into faster functions than other expressions.

Considering to no longer autocompile expressions. Currently the only place where
they're used as expressions in the `bind.*` attribute, and the only place where
they're used as statements is the `on.` attribute. `twoway.` and some other
attributes actually reparse them as property accessors.