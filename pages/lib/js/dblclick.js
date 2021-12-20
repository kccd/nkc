/*
* 给元素添加双击事件
* @param {Dom} element
* @param {Function} callback 触发双击后执行的回调
* @return {Function} 用于清除长按事件
* */
export function initDblclick(element, callback) {
  let timeoutId = null;
  let count = 0;
  const touchEndListener = (e) => {
    ++count;
    if(count === 2) {
      count = 0;
      clearTimeout(timeoutId);
      callback(e);
    }
    timeoutId = setTimeout((e) => {
      count = 0;
    }, 700);
  };
  const events = [
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
