const assert=require('node:assert/strict');
const ui=require('./i18n.js');
const icons=require('./icons.js');
assert.equal(ui.translate('优先关注','en'),'Prioritise');
assert.equal(ui.translate('优先关注','zh'),'优先关注');
assert.equal(ui.translate('收藏','en'),'Save');
assert.equal(ui.translate('共 5 条记录，当前显示 3 条。','en'),'5 records; showing 3.');
assert.equal(ui.translate('Example University','en'),'Example University');
for(const name of ['brand','internship','networking','globe']){
  const svg=icons.icon(name);assert.match(svg,/<svg/);assert.match(svg,/aria-hidden="true"/);assert.doesNotMatch(svg,/<script|onload=/);
}
console.log('Interface translation and original SVG icon checks passed.');
