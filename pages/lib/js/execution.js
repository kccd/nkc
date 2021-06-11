/*
* 延迟执行 防抖
* @param {Function} callback 需要执行的函数
* @param {Number} time 延迟ms
* */
export function debounce(callback, time) {
  let t = null;
  return function() {
    const _this = this;
    clearTimeout(t);
    const props = arguments;
    t = setTimeout(() => {
      callback.bind(_this)(...props);
    }, time);
  }
}

/*
* 限流
* */
export function throttle() {

}