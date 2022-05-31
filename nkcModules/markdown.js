const md = require('markdown-it')();

function renderMarkdown(content) {
  return md.render(content);
}

module.exports = {
  renderMarkdown
};
