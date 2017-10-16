const render = require('./nkc_render');
const pug = require('pug');
pug.filters.thru = function(k){return k};
let pugoptions = {
  markdown:render.commonmark_render,
  markdown_safe:render.commonmark_safe,
  bbcode:render.bbcode_render,
  thru: function(k){return k}
}
let filters = {
  markdown: render.commonmark_render,
  markdown_safe:render.commonmark_safe,
};
let pugRender = (template, data) => {
  let options = {};
  options.data = data;
  options.filters = filters;
  return pug.renderFile(template, options);
}
module.exports = pugRender;
//module.exports = require('pug').renderFile;