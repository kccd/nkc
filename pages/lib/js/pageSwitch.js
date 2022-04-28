import {getState} from './state';
import {RNOpenNewPage} from "./reactNative";
import {fixUrl} from "./url";

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
      url = fixUrl(url);
      RNOpenNewPage(url);
    } else {
      window.open(url);
    }
  }
}

export function setPageTitle(content) {
  $('title').text(content);
}
