import {getState} from './state';
import {RNOpenNewPage} from "./reactNative";
/*
* 打开链接 兼容APP
* @param {String} url 链接
* @param {Boolean} blank 是否在后台打开
* @author pengxiguaa 2019-7-26
* */
export function visitUrl(url, blank) {
  if(!blank) {
    return window.location.href = url;
  } else {
    const {isApp} = getState();
    if(isApp) {
      if(url.indexOf('http') !== 0) {
        url = window.location.origin + url;
      }
      RNOpenNewPage(url);
    } else {
      window.open(url);
    }
  }
}
