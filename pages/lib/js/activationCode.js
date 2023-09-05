import {
  getFromLocalStorage,
  localStorageKeys,
  saveToLocalStorage,
} from './localStorage';

export function getRegisterActivationCodeFromLocalstorage() {
  const { code } = getFromLocalStorage(localStorageKeys.registerActivationCode);
  return code || '';
}

export function setRegisterActivationCodeToLocalstorage(code = '') {
  saveToLocalStorage(localStorageKeys.registerActivationCode, { code });
}
