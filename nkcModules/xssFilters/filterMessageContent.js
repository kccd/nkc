const xss = require('xss');

module.exports = (html) => {
  html = xss(html, {
    whiteList: {
      a: ['href']
    },
    onTagAttr: function(tag, name, value, isWhiteAttr) {
      if(isWhiteAttr) {
        if(tag === 'a' && name === 'href') {
          const valueHandled = value.replace('javascript:', '');
          return `href=${valueHandled}`;
        }
      }
    },
    css: {
      whiteList: {}
    }
  });
  return html;
};
