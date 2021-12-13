/*
* 字符串转对象，对应pug渲染函数objToStr
* @param {String} str 对象字符串
* @return {Object}
* @author pengxiguaa 2019-7-26
* */
export function strToObj(str) {
  return JSON.parse(decodeURIComponent(str));
}