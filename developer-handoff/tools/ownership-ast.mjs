import assert from 'node:assert/strict';

// Undo only the declared extraction wrapper for structural comparison with the
// immutable original app. This does not erase arbitrary changes in a handler.
export function expandOwnedBranches(node, functions, ownership) {
  const branches = new Map(ownership.handlers.filter(h => h.kind === 'branch').map(h => [h.name, h]));
  function restoreReturns(n) {
    if (!n || typeof n !== 'object') return n;
    if (Array.isArray(n)) return n.map(restoreReturns);
    if (/Function/.test(n.type)) return n; // callback returns were never changed
    if (n.type === 'ReturnStatement') {
      assert.equal(n.argument?.type, 'Literal', 'Handler return must preserve its consumed sentinel');
      assert.equal(n.argument.value, true, 'Early validation exits must consume the event');
      return {...n, argument: null};
    }
    return Object.fromEntries(Object.entries(n).map(([k, v]) => [k, restoreReturns(v)]));
  }
  function expand(n) {
    if (!n || typeof n !== 'object') return n;
    if (Array.isArray(n)) return n.map(expand);
    const wrapper = n.type === 'IfStatement' && n.consequent?.type === 'BlockStatement'
      && n.consequent.body.length === 1 ? n.consequent.body[0] : null;
    const call = wrapper?.type === 'IfStatement' && wrapper.test?.type === 'CallExpression' ? wrapper.test : null;
    const record = call && branches.get(call.callee?.name);
    if (record) {
      assert.equal(wrapper.alternate, null);
      assert.equal(wrapper.consequent.type, 'ReturnStatement');
      assert.equal(wrapper.consequent.argument, null);
      const fn = functions.get(record.name);
      assert.ok(fn, `Missing handler ${record.name}`);
      assert.deepEqual(fn.params.map(p => p.name), record.params);
      assert.deepEqual(call.arguments.map(p => p.type === 'Identifier' ? p.name : null), record.params);
      const tail = fn.body.body.at(-1);
      assert.equal(tail.type, 'ReturnStatement');
      assert.equal(tail.argument?.value, false, 'Unconsumed branch must retain fallthrough');
      const body = restoreReturns(fn.body.body.slice(0, -1));
      const consequent = record.originalBodyType === 'BlockStatement'
        ? {...fn.body, body} : (assert.equal(body.length, 1), body[0]);
      return {...n, test: expand(n.test), consequent: expand(consequent), alternate: expand(n.alternate)};
    }
    return Object.fromEntries(Object.entries(n).map(([k, v]) => [k, expand(v)]));
  }
  return expand(node);
}
