/*
 * 延迟执行 防抖
 * @param {Function} callback 需要执行的函数
 * @param {Number} time 延迟ms
 * */
export function debounce(callback, time) {
  let t = null;
  return function () {
    const _this = this;
    clearTimeout(t);
    const props = arguments;
    t = setTimeout(() => {
      callback.bind(_this)(...props);
    }, time);
  };
}
/*
 * 立即执行 防抖 控制执行间隔时间
 * @param {Function} callback 需要执行的函数
 * @param {Number} time 延迟ms
 * */
export function immediateDebounce(callback, time) {
  let timeout = null;
  let runTime = 0;
  return function () {
    const _this = this;
    const props = arguments;
    const now = Date.now();
    if (now - runTime >= time) {
      callback.bind(_this)(...props);
      runTime = Date.now();
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        callback.bind(_this)(...props);
        runTime = Date.now();
      }, time - (now - runTime));
    }
  };
}

/*
 * 限流
 * @param {Function} callback 需要执行的函数
 * @param {Number} time callback 执行的间隔 ms
 * */
export function throttle(callback, time) {
  let running = false;
  return function () {
    if (!running) {
      callback.bind(this)(...arguments);
      running = true;
      setTimeout(() => {
        running = false;
      }, time);
    }
  };
}
