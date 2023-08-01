const xss = require('xss');
module.exports = (html = '') => {
  html = xss(html, {
    whiteList: {
      a: ['href', 'title', 'target'],
      img: ['src', 'alt'],
      br: [],
      p: [],
    },
    onIgnoreTag: function (tag, html, options) {
      return '';
    },
  });
  return html;
};
