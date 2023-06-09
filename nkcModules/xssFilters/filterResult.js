const xss = require('xss');

module.exports = (html) => {
  html = xss(html, {
    whiteList: {
      div: [],
      a: [],
    },
  });
  return html;
};
