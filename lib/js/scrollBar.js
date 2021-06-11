/*
* 判断页面是否存在滚动条
* @return {Boolean}
* */
export function hasScrollBar() {
  return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
}

/*
* 获取浏览器滚动条宽度
* @return {Number} px
* */
export function getScrollBarWidth() {
  const scrollDiv = document.createElement('div');
  scrollDiv.style.cssText = `width: 20px; height: 20px;overflow: scroll; position: absolute; top: -100px;`;
  document.body.appendChild(scrollDiv);
  const scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollBarWidth;
}