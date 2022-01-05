/*
* 给 dom 元素添加长按事件
* @param {Dom} element
* @param {Function} callback 触发长按后执行的回调
* @return {Function} 用于清除长按事件
* */
export function initLongPressEvent(element, callback) {
  let timeoutId = null;
  const touchStartListener = (e) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(e);
    }, 500);
  };
  const touchMoveListener = () => {
    clearTimeout(timeoutId);
  };
  const touchEndListener = () => {
    clearTimeout(timeoutId);
  };
  const events = [
    ['touchstart', touchStartListener],
    ['touchmove', touchMoveListener],
    ['touchend', touchEndListener]
  ];
  for(const event of events) {
    element.addEventListener(event[0], event[1]);
  }
  return () => {
    for(const event of events) {
      clearTimeout(timeoutId);
      element.removeEventListener(event[0], event[1]);
    }
  };
}