export const sessionStorageKeys = {
  draggableElement: 'draggableElement',
  scrollTop: 'scrollTop'
};

export function getFromSessionStorage(name) {
  const data = window.sessionStorage.getItem(name);
  if(!data) return {};
  return JSON.parse(data);
}

export function saveToSessionStorage(name, data = {}) {
  window.sessionStorage.setItem(name, JSON.stringify(data));
}

export function updateInSessionStorage(name, newData = {}) {
  const data = getFromSessionStorage(name);
  Object.assign(data, newData);
  saveToSessionStorage(name, data);
}
