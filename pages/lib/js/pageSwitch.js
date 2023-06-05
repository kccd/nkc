import { getState } from './state';
import { RNOpenNewPage, RNSetPageTitle } from './reactNative';
import { fixUrl } from './url';

/*
 * 打开链接 兼容APP
 * @param {String} url 链接
 * @param {Boolean} blank 是否在后台打开
 * @author pengxiguaa 2019-7-26
 * */
export function visitUrl(url, blank) {
  if (!blank) {
    return (window.location.href = url);
  } else {
    const { isApp } = getState();
    if (isApp) {
      url = fixUrl(url);
      RNOpenNewPage(url);
    } else {
      window.open(url);
    }
  }
}
export function visitUrlReplace(url) {
  window.location.replace(url);
}

export function setPageTitle(title) {
  $('title').text(title);
  RNSetPageTitle(title);
}

export function scrollPageToElementById(
  id,
  offset = $(window).height() / 2 - 100,
) {
  scrollPageToElement($(`#${id}`), offset);
}

export function scrollPageToElement(
  jqElement,
  offset = $(window).height() / 2 - 100,
) {
  $('body, html').animate({
    scrollTop: jqElement.offset().top - offset,
  });
}
