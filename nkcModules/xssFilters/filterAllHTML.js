const xss = require('xss');

module.exports = (html) => {
  html = xss(html, {
    whiteList: {},
    css: {
      whiteList: {}
    }
  });
  return html;
};
