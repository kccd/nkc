const { operationTree } = require('../settings/operationsTree/index.js');
const { Operations } = require('../settings/operations.js');
const { files: fileOperationsId } = require('../settings/operationGroups');
const methods = ['POST', 'GET', 'PUT', 'DELETE'];

// 获取所有的操作
function getOperationsId() {
  return [...Object.values(Operations)];
}

// 获取路由操作
function getRouterOperationsId() {
  const fn = (obj, arr) => {
    for (let key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue;
      }
      if (methods.includes(key)) {
        arr.push(obj[key]);
      } else {
        if (typeof obj[key] === 'object') {
          fn(obj[key], arr);
        }
      }
    }
  };
  const operations = [];
  fn(operationTree, operations);
  return [...new Set(operations)];
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
  let useOperationId;
  for (let i = 0; i < urlArr.length; i++) {
    if (obj && typeof obj === 'object' && obj.USE) {
      useOperationId = obj.USE;
      break;
    }
    const key = urlArr[i];
    if (!obj || typeof obj !== 'object') {
      break;
    }
    obj = fn(obj, key);
  }

  if (!useOperationId && obj && typeof obj === 'object' && obj.USE) {
    useOperationId = obj.USE;
  }

  if (useOperationId) {
    return useOperationId;
  }

  if (obj && typeof obj === 'object' && obj[method]) {
    return obj[method];
  } else {
    const error = new Error('not found');
    error.status = 404;
    throw error;
  }
}

function getLoggerOperationsId() {
  return getRouterOperationsId().filter(
    (operationId) => !fileOperationsId.includes(operationId),
  );
}

module.exports = {
  getOperationId,
  getOperationsId,
  getRouterOperationsId,
  getLoggerOperationsId,
};
