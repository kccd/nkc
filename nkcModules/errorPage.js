const pug = require("pug");
const path = require("path");
const errorTips = require('../config/errorTips.json')
const errorTemplatePath = path.resolve(__dirname, '../pages/error/errorTemplate.pug');
function getErrorPage(title, abstract, description, url) {
  return pug.renderFile(errorTemplatePath, {
    data: {
      title,
      abstract,
      description,
      url
    }
  });
}

function getErrorPage404(url, message = '') {
  return getErrorPage(
    '404 Not Found',
    message || '糟糕！你访问的页面 404 了，请检查链接。',
    errorTips.NotFound,
    url
  );
}

function getErrorPage500(url, message = '') {
  return getErrorPage(
    '500 Internal Server Error',
    message || '服务器内部错误',
    errorTips.InternalServerError,
    url
  );
}

module.exports = {
  getErrorPage,
  getErrorPage500,
  getErrorPage404
};

