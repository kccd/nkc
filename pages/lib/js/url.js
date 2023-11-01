import { getState } from './state';

/*
 * 补全相对链接
 * @param {String} url
 * */
export function fixUrl(url) {
  if (url.indexOf('http') !== 0) {
    url = window.location.origin + url;
  }
  return url;
}

/*
 * 判断链接是否为绝对链接
 * @param {String} url
 * @return {Boolean}
 * */
export function isAbsolutePath(url) {
  const reg = /^https?:\/\/.*/i;
  return reg.test(url);
}

/*
 * 判断连接是否为本站链接
 * */
export function isSameDomain(url) {
  return url.indexOf(location.host) === 0 || /(^\.)|(^\/)/.test(url);
}

// 判断链接是否为本站的文件链接
export function isFileDomain(url) {
  const { fileDomain } = getState();
  if (fileDomain) {
    return url.indexOf(fileDomain) === 0;
  } else {
    return isSameDomain(url);
  }
}

