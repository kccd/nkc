const xss = require('xss');

module.exports = (html) => {
  html = xss(html, {
    whiteList: {
      span: ['style', 'data-type', 'data-url'],
    },
    onTagAttr: function (tag, name, value) {
      if (tag === 'span' && name === 'style') {
        if (value !== 'color: #e85a71;') {
          return '';
        }
      }
    },
  });
  return html;
};
