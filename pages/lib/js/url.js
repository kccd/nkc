/*
* 补全相对链接
* @param {String} url
* */
export function fixUrl(url) {
  if(url.indexOf('http') !== 0) {
    url = window.location.origin + url;
  }
  return url;
}