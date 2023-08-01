const { operationTree } = require('../settings/operations/index.js');
const { Operations } = require('../settings/operations.js');

// 获取所有的操作权限
function getOperationsId() {
  return [...Object.values(Operations)];
}

// 根据 request 中的 url 和 method 获取操作权限
function getOperationId(url, method) {
  let urlArr = [];
  url = url.replace(/\?.*/, '');
  if (url === '/') {
    urlArr = ['home'];
  } else {
    urlArr = url.split('/');
    urlArr[0] = 'home';
  }
  const fn = (obj, dKey) => {
    for (let key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue;
      }
      if (key === 'PARAMETER') {
        return obj['PARAMETER'];
      } else if (dKey === key) {
        return obj[key];
      }
    }
  };
  let obj = Object.assign({}, operationTree);
  for (let i = 0; i < urlArr.length; i++) {
    const key = urlArr[i];
    obj = fn(obj, key);
  }
  if (obj && typeof obj === 'object' && obj[method]) {
    return obj[method];
  } else {
    const error = new Error('not found');
    error.status = 404;
    throw error;
  }
}

module.exports = {
  getOperationId,
  getOperationsId,
};
