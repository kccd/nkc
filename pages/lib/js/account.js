import {nkcAPI} from "./netAPI";
import {getState} from './state';
import {RNLogout, RNOpenLoginPage} from "./reactNative";
const {isApp} = getState();

export function logout() {
  const href = window.location.href;
  nkcAPI("/logout?t=" + Date.now(), "GET")
    .then(function () {
      return nkcAPI(href, "GET");
    })
    .then(function() {
      if(isApp) {
        RNLogout();
      } else {
        window.location.reload();
      }
    })
    .catch(function (data) {
      window.location.href = "/";
    })
}

/*
* 打开登录窗口
* @param {String} type login(默认), register
* */
export function toLogin(type = 'login') {
  window.RootApp.openLoginPanel(type);
}
