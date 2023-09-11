const xss = require('xss');
module.exports = (html = '') => {
  html = xss(html, {
    whiteList: {
      a: ['href', 'title', 'target'],
      img: [
        'src',
        '_src',
        'alt',
        'data-tag',
        'data-type',
        'data-uploading-order',
      ],
      br: [],
      p: [],
    },
    onTagAttr(tag, name, value) {
      if (tag === 'img' && name === 'src') {
        return `${name}="${xss.escapeAttrValue(value)}"`;
      }
    },
    onIgnoreTag: function () {
      return '';
    },
  });
  return html;
};
