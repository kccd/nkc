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
* 立即执行 防抖
* @param {Function} callback 需要执行的函数
* @param {Number} time 延迟ms
* */
export function immediateDebounce(callback, time) {
  let t = null;
  return function() {
    const _this = this;
    const props = arguments;
    if (!t) {
      callback.bind(_this)(...props);
    }
    clearTimeout(t);
    t = setTimeout(() => {
      callback.bind(_this)(...props);
    }, time);
  }
}

/*
* 限流
* @param {Function} callback 需要执行的函数
* @param {Number} time callback 执行的间隔 ms
* */
export function throttle(callback, time) {
  let running = false;
  return function() {
    if(!running) {
      callback.bind(this)(...arguments);
      running = true;
      setTimeout(() => {
        running = false;
      }, time)
    }
  }
}
