'use strict';

import {Attribute, Mold, scheduleReflow} from './boot';
import {Meta} from './tree';
import * as utils from './utils';

@Attribute({attributeName: 'bind'})
class Bind {
  // Autoassigned
  element: Element;
  hint: string;
  expression: Expression;
  scope: any;
  component: any;

  // Custom
  propertyPath: string;
  pathfinder: Pathfinder;

  constructor() {
    this.propertyPath = utils.normalise(this.hint);
    this.pathfinder = new Pathfinder(this.propertyPath);
  }

  onPhase(): void {
    let result = this.expression(this.scope);
    // Sync the result to the element. Dirty checking avoids setter side effects.
    if (!utils.strictEqual(this.pathfinder.read(this.element), result)) {
      this.pathfinder.assign(this.element, result);
    }
    // If the element has a VM that declares this property as bindable, sync
    // the result to it. Dirty checking avoids setter side effects.
    let vm = this.component;
    if (vm && isBindable(vm, this.propertyPath) &&
        !utils.strictEqual(this.pathfinder.read(vm), result)) {
      this.pathfinder.assign(vm, result);
    }
  }
}

@Attribute({attributeName: 'twoway'})
class TwoWay {
  // Autoassigned
  element: Element;
  hint: string;
  scope: any;
  component: any;

  // Custom
  targetPropertyPath: string;
  targetPathfinder: Pathfinder;
  ownPathfinder: Pathfinder;
  lastOwnValue: any;
  lastTargetValue: any;

  constructor() {
    let attributeName = 'twoway.' + this.hint;

    utils.assert(utils.isStaticPathAccessor(this.hint), `a 'twoway.*' attribute must be of form 'twoway.X(.X)*', where X is a valid JavaScript identifier; got: '${attributeName}'`);

    let expression = this.element.getAttribute(attributeName) || '';

    this.ownPathfinder = new Pathfinder(expression);
    this.targetPropertyPath = utils.normalise(this.hint);
    this.targetPathfinder = new Pathfinder(this.targetPropertyPath);

    // Event listeners to trigger phases.
    if (this.element.tagName === 'INPUT' || this.element.tagName === 'TEXTAREA') {
      let elem = <HTMLInputElement|HTMLTextAreaElement>this.element;
      let eventName = {
        checkbox: 'change',
        select: 'select',
        button: 'click'
      }[elem.type] || 'input';
      this.element.addEventListener(eventName, () => {});
    }
  }

  onPhase(): void {
    let firstPhase = !this.hasOwnProperty('lastOwnValue');
    let ownValue = this.ownPathfinder.read(this.scope);

    if (firstPhase) {
      let targetValue = this.getTargetValue();
      if (ownValue && !targetValue) this.syncTopDown(ownValue);
      if (targetValue && !ownValue) this.syncBottomUp(targetValue);
      if (typeof targetValue !== typeof ownValue) this.syncBottomUp(targetValue);
      else this.syncTopDown(ownValue);
      return;
    }

    // If own value has changed, overwrite the others. Own takes priority.
    if (!utils.strictEqual(ownValue, this.lastOwnValue)) {
      this.syncTopDown(ownValue);
      return;
    }

    // Otherwise sync the data back from the target. Don't bother syncing the
    // data between the target element and its VM.
    let targetValue = this.getTargetValue();
    if (!utils.strictEqual(targetValue, this.lastTargetValue)) {
      this.syncBottomUp(targetValue);
    }
  }

  syncTopDown(newValue: any): void {
    this.lastOwnValue = newValue;
    this.lastTargetValue = newValue;

    // Sync the result to the element. Dirty checking avoids setter side effects.
    if (!utils.strictEqual(this.targetPathfinder.read(this.element), newValue)) {
      this.targetPathfinder.assign(this.element, newValue);
    }

    // If the element has a VM that declares this property as bindable, sync
    // the result to it. Dirty checking avoids setter side effects.
    let vm = this.component;
    if (vm && isBindable(vm, this.targetPropertyPath)) {
      if (!utils.strictEqual(this.targetPathfinder.read(vm), newValue)) {
        this.targetPathfinder.assign(vm, newValue);
      }
    }
  }

  syncBottomUp(newValue: any): void {
    this.lastOwnValue = newValue;
    this.lastTargetValue = newValue;

    if (!utils.strictEqual(this.ownPathfinder.read(this.scope), newValue)) {
      this.ownPathfinder.assign(this.scope, newValue);
      scheduleReflow();
    }
  }

  getTargetValue(): any {
    let vm = this.component;
    if (vm && isBindable(vm, this.targetPropertyPath)) {
      return this.targetPathfinder.read(vm);
    }
    return  this.targetPathfinder.read(this.element);
  }
}

function isBindable(vm: ComponentVM, propertyPath: string): boolean {
  let VM = <ComponentClass>vm.constructor;
  let bindable = VM.bindable;
  return bindable instanceof Array && !!~bindable.indexOf(propertyPath);
}

class Pathfinder {
  private key: string;
  private track: string[];

  constructor(path: string) {
    this.track = path.split('.');
    if (this.track.length === 1) this.key = path;
  }

  read(source: any): void {
    if (this.key) return source[this.key];
    let track = this.track;
    for (let item of this.track) {
      source = source[item];
    }
    return source;
  }

  assign(target: any, value: any): void {
    if (this.key) target[this.key] = value;
    let track = this.track;
    for (var i = 0, ii = track.length - 1; i < ii; ++i) {
      target = target[track[i]];
    }
    target[track[i]] = value;
  }
}

@Attribute({attributeName: 'on'})
class On {
  element: Element;
  hint: string;
  expression: Expression;
  scope: any;

  constructor() {
    this.element.addEventListener(this.hint, event => {
      let result = this.expression.call(this.element, this.scope, {$event: event});
      if (result === false) event.preventDefault();
    });
  }
}

@Mold({attributeName: 'if'})
class If {
  // Autoassigned
  element: TemplateElement;
  hint: string;
  expression: Expression;
  scope: any;

  // Custom
  stash: Node[] = [];

  constructor() {
    utils.assert(this.hint === '', `custom attribute 'if' doesn't support hints, got ${this.hint}`);

    let container = this.element.content;
    while (container.hasChildNodes()) {
      let child = container.removeChild(container.lastChild);
      Meta.getOrAddMeta(child).isDomImmutable = true;
      this.stash.unshift(child);
    }
  }

  onPhase(): void {
    let ok = !!this.expression(this.scope);

    if (ok) while (this.stash.length) {
      this.element.appendChild(this.stash.shift());
    } else while (this.element.hasChildNodes()) {
      this.stash.unshift(this.element.removeChild(this.element.lastChild))
    }
  }
}

@Mold({attributeName: 'for'})
class For {
  // Autoassigned
  element: TemplateElement;
  hint: string;
  expression: Expression;
  scope: any;

  // Custom
  mode: string; // 'of' | 'in' | 'any'
  key: string;
  originals: Node[] = [];
  stash: Node[] = [];

  constructor() {
    let msg = `the 'for.*' attribute expects a hint in the form of 'X.of', 'X.in', or 'X', where X is a valid JavaScript identifier; received '${this.hint}'`;

    let match = utils.matchValidKebabIdentifier(this.hint);
    utils.assert(!!match, msg);

    // Find the variable key.
    this.key = utils.normalise(match[1]);

    // Choose the iteration strategy.
    if (!match[2]) this.mode = 'any';
    else if (match[2] === '.of') this.mode = 'of';
    else if (match[2] == '.in') this.mode = 'in';

    utils.assert(!!this.mode, msg);

    // Move the initial content to a safer place.
    let container = this.element.content;
    while (container.hasChildNodes()) {
      this.originals.unshift(container.removeChild(container.lastChild));
    }
  }

  onPhase(): void {
    let value = this.expression(this.scope);

    let isIterable = value instanceof Array || typeof value === 'string' ||
                     (value != null && typeof value === 'object' && this.mode !== 'of');

    // Stash existing content.
    while (this.element.hasChildNodes()) {
      this.stash.unshift(this.element.removeChild(this.element.lastChild));
    }

    if (!isIterable || !this.originals.length) return;

    if (this.mode === 'in' || !utils.isArrayLike(value)) this.iterateIn(value);
    else this.iterateOf(value);
  }

  iterateOf(value: ArrayLike): void {
    for (var i = 0, ii = value.length; i < ii; ++i) {
      this.step(value, i);
    }
  }

  iterateIn(value: {[key: string]: any}): void {
    for (let key in value) this.step(value, key);
  }

  step(value: any, index: number|string): void {
    let nodes: Node[];
    if (this.stash.length >= this.originals.length) {
      nodes = this.stash.splice(0, this.originals.length);
    } else {
      nodes = this.originals.map(node => {
        let clone = utils.cloneDeep(node);
        Meta.getOrAddMeta(clone).isDomImmutable = true;
        return clone;
      });
    }

    while (nodes.length) {
      let node = nodes.shift();
      this.element.appendChild(node);
      Meta.getOrAddMeta(node).insertScope({
        $index: index,
        [this.key]: value[index]
      });
    }
  }
}

@Attribute({attributeName: 'class'})
class Class {
  // Autoassigned
  element: Element;
  hint: string;
  expression: Function;
  scope: any;

  onPhase() {
    let result = this.expression(this.scope);
    if (result) this.element.classList.add(this.hint);
    else this.element.classList.remove(this.hint);
  }
}

@Attribute({attributeName: 'ref'})
class Ref {
  // Autoassigned
  element: Element;
  hint: string;
  scope: any;
  component: any;

  constructor() {
    utils.assert(!this.hint || this.hint === 'vm',
                   `expected 'ref.' or 'ref.vm', got: 'ref.${this.hint}'`);
    let value = this.element.getAttribute('ref.' + this.hint);
    let pathfinder = new Pathfinder(value);
    if (this.scope) {
      pathfinder.assign(this.scope, this.hint ? this.component : this.element);
    }
  }
}

@Mold({attributeName: 'let'})
class Let {
  // Autoassigned
  element: TemplateElement;
  hint: string;
  expression: Expression;
  scope: any;

  constructor() {
    utils.assert(utils.isValidKebabIdentifier(this.hint),
                   `'let.*' expects the hint to be a valid JavaScript identifier in kebab form, got: '${this.hint}'`);

    let identifier = utils.normalise(this.hint);

    // Make sure a scope is available.
    if (!this.scope) {
      let meta = Meta.getOrAddMeta(this.element);
      meta.insertScope();
      this.scope = meta.scope;
    }

    // The identifier must not be redeclared in the scope. We're being strict to
    // safeguard against elusive errors.
    utils.assert(!Object.prototype.hasOwnProperty.call(this.scope, identifier),
                   `unexpected re-declaration of '${identifier}'' with 'let'`);

    // Bring the identifier into scope, assigning the given value.
    this.scope[identifier] = this.expression.call(this.scope, this.scope);

    // Pass through any content.
    let content = this.element.content;
    while (content.hasChildNodes()) {
      this.element.appendChild(content.removeChild(content.firstChild));
    }
  }
}