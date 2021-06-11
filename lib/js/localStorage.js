/*
* 从本地存储中读取数据
* @param {String} name 键名
* @return {Object} 如果不存在键名所对应的数据，则返回空对象
* */
export function getFromLocalStorage(name) {
  const data = window.localStorage.getItem(name);
  if(!data) return {};
  return JSON.parse(data);
}

/*
* 将数据存入本地存储
* @param {String} name 键名
* @param {Object} 需要存入的数据
* */
export function saveToLocalStorage(name, data = {}) {
  window.localStorage.setItem(name, JSON.stringify(data));
}

/*
* 更新本地存储中的数据 Object.assign 覆盖原数据的字段
* @param {String} name 键名
* @param {Object} 全部或部分新数据
* */
export function updateInLocalStorage(name, newData = {}) {
  const data = getFromLocalStorage(name);
  Object.assign(data, newData);
  saveToLocalStorage(name, data);
}