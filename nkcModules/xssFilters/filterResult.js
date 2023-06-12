const xss = require('xss');
const { ThrowCommonError } = require("../error");

module.exports = (html) => {
  html = xss(html, {
    whiteList: {
      div: [],
      a: [],
    },
    onTag: (tag) => {
      if (tag !== 'div' && tag !== 'a') {
        // 检测到不在白名单上的标签
        ThrowCommonError(`检测到不在白名单上的标签: <${tag}>`);
        // 这里可以根据需要进行提示给用户的逻辑处理
      }
    },
  });
  return html;
};
