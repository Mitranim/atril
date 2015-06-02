import {State} from './tree';

export class AttributeBinding {
  name: string;
  value: string;
  hint: string;
  expression: Expression;
  VM: Function;
  vm: AttributeCtrl;

  constructor(attr: Attr, VM: Function) {
    this.name = attr.name;
    this.value = attr.value;
    this.hint = attr.name.match(/^[a-z-]+\.(.*)/)[1];
    this.expression = compileExpression(attr.value);
    this.VM = VM;
  }

  refreshState(element: Element, state: State, scope: any): void {
    let isNew = this.isNew;
    if (isNew) {
      this.vm = Object.create(this.VM.prototype);
      this.vm.hint = this.hint;
      this.vm.expression = this.expression;
    }
    this.vm.element = element;
    this.vm.scope = scope;
    this.vm.component = state.vm || null;
    if (isNew) this.VM.call(this.vm);
  }

  phase(): boolean {
    if (typeof this.vm.onPhase === 'function') {
      return this.vm.onPhase(), true;
    }
    return false;
  }

  destroy(): void {
    if (typeof this.vm.onDestroy === 'function') {
      this.vm.onDestroy();
    }
  }

  get isNew(): boolean {return !this.vm}
}

export class AttributeInterpolation {
  name: string;
  value: string;
  expression: TextExpression;
  constructor(attr: Attr) {
    this.name = attr.name;
    this.value = attr.value;
    this.expression = compileTextExpression(attr.textContent);
  }
}

// Problems:
// * Provides access to globals.
// * Doesn't assign to missing properties (throws a reference error).
// * Has to be re-interpreted on each call to support locals that don't mess
//   with property assignment in scopes.
export function compileExpression(expression: string): Expression {
  if (!expression) return () => undefined;

  return function(scope: any, locals?: any) {
    let argList: string[] = [];
    let argValues: any[] = [];
    if (locals != null && typeof locals === 'object') {
      argList = Object.keys(locals);
      for (let i = 0, ii = argList.length; i < ii; ++i) {
        argValues.push(locals[argList[i]]);
      }
    }
    argValues.push(scope);
    let returnPrefix = ~expression.indexOf(';') ? '' : 'return ';
    let body = `with (arguments[${argValues.length - 1}]) {
      return function() {'use strict';
        ${returnPrefix}${expression}
      }.call(this);
    }`;
    argList.push(body);
    let func = Function(...argList);
    return func.call(this === window ? scope : this, ...argValues);
  };
}

export function hasInterpolation(text: string): boolean {
  return /\{\{((?:[^}]|}(?=[^}]))*)\}\}/g.test(text);
}

export function compileTextExpression(text: string): TextExpression {
  if (!text) return () => '';

  let reg = /\{\{((?:[^}]|}(?=[^}]))*)\}\}/g;
  let result: RegExpExecArray;
  let collection: (string|Expression)[] = [];
  let slice = text;

  while (result = reg.exec(slice)) {
    let piece = slice.slice(0, result.index);
    if (piece) collection.push(piece);
    slice = slice.slice(result.index).replace(result[0], '');
    collection.push(compileExpression(result[1]));
  }
  if (slice) collection.push(slice);

  return function(scope: any, locals?: any): string {
    if (scope == null) return '';
    let total = '';
    for (let i = 0, ii = collection.length; i < ii; ++i) {
      let item = collection[i];
      if (typeof item === 'string') {
        total += item;
        continue;
      }
      let result = (<Expression>item).call(scope, scope, locals);
      if (result != null) total += result;
    }
    return total;
  };
}