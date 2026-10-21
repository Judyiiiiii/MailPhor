// DOM-level checks only; a real browser visual check remains separate.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() { this.children = []; this.textContent = ''; this.value = ''; }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.append(child); }
  replaceChildren(...children) { this.children = children; }
  get childElementCount() { return this.children.length; }
}
function text(node) { return node.textContent + node.children.map(text).join('\n'); }

async function main() {
  const nodes = new Map();
  const document = {
    createElement: () => new Element(),
    querySelector: selector => {
      if (!nodes.has(selector)) nodes.set(selector, new Element());
      return nodes.get(selector);
    }
  };
  const original = [{subject:'Saved mail', status:'deferred', reason:'Old failure'}];
  let fetches = 0;
  const context = vm.createContext({document, fetch: async url => {
    assert.equal(url, '/mail_audit.json');
    fetches++;
    return {status:200,ok:true,json:async()=>JSON.parse(JSON.stringify(original))};
  }});
  const html = fs.readFileSync(__dirname + '/mail-audit.html', 'utf8');
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  await new Promise(setImmediate);
  assert.match(text(nodes.get('#records')), /不能追溯具体模型失败原因/);
  assert.equal(fetches, 1);
  nodes.get('#preview').onclick();
  assert.equal(fetches, 1, 'Preview must not call any API');
  assert.equal(nodes.get('#records').childElementCount, 5);
  assert.match(nodes.get('#status').textContent, /模拟示例，非真实邮件/);
  const previewText = text(nodes.get('#records'));
  for (const phrase of ['模板规则，没有 AI 请求', 'demo/model', 'length', '截断', 'TimeoutError', '75 秒']) {
    assert.ok(previewText.includes(phrase), phrase);
  }
  nodes.get('#filter').value = 'deferred';
  nodes.get('#filter').onchange();
  assert.equal(nodes.get('#records').childElementCount, 2);
  nodes.get('#filter').value = '';
  await nodes.get('#refresh').onclick();
  assert.equal(fetches, 2);
  assert.equal(nodes.get('#records').childElementCount, 1);
  assert.ok(text(nodes.get('#records')).includes('Saved mail'));
  assert.equal(nodes.get('#preview-note').textContent, '');
  assert.ok(!nodes.get('#status').textContent.includes('模拟示例'));
  console.log('Audit DOM checks passed: legacy fallback, five diagnostic examples, filtering, refresh restores real records; zero external requests.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
