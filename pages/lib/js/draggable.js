import {getFromSessionStorage, saveToSessionStorage, sessionStorageKeys} from "./sessionStorage";
const defaultZIndex = 1050;
/*
* 从 sessionStorage 中获取最大 zIndex
* @param {Number} oldZIndex 旧的 zIndex，如果已经是最大了则直接返回
* @return {Number}
* */
export function getZIndex(oldZIndex) {
  let {zIndex} = getFromSessionStorage(sessionStorageKeys.draggableElement);
  if(!zIndex || typeof zIndex !== 'number') {
    zIndex = defaultZIndex;
  }
  if(!oldZIndex || oldZIndex < zIndex) {
    zIndex += 1;
  }
  saveToSessionStorage(sessionStorageKeys.draggableElement, {zIndex});
  return zIndex;
}
/*
* 重置 zIndex
* */
export function resetZIndex() {
  saveToSessionStorage(sessionStorageKeys.draggableElement, {zIndex: defaultZIndex});
}
/*
* 可拖动元素
* @param {String} jQuery selector 需要设为可拖动元素的元素
* @param {String} jQuery selector 拖动的手柄（鼠标按下该元素后移动）
* @param {Function} func 位置改变时的回调
* @return {DraggableElement} 可拖动元素实例
* */

export class DraggableElement {
  constructor(element, handSelector, func) {
    const self = this;
    this.root = element;
    this.JQRoot = $(this.root);
    this._mousedownEvent = () => {
      self.updateZIndex();
    };
    this.JQRoot
      .draggable({
        scroll: false,
        handle: $(handSelector),
        drag: function(event, ui) {
          if(ui.position.top < 0) ui.position.top = 0;
          var height = $(window).height();
          if(ui.position.top > height - 30) ui.position.top = height - 30;
          var width = self.JQRoot.width();
          if(ui.position.left < 100 - width) ui.position.left = 50 - width;
          var winWidth = $(window).width();
          if(ui.position.left > winWidth - 100) ui.position.left = winWidth - 50;
          if(func) {
            func({
              top: ui.position.top,
              left: ui.position.left
            });
          }
        }
      })
      .on('mousedown', this._mousedownEvent);
    this.addClassAndInsertDraggableStyleToDocument();
    this.updateZIndex();
    this.setPositionCenter();
  }
  show() {
   this.JQRoot.show();
   this.updateZIndex();
  }
  hide() {
    this.JQRoot.hide();
  }
  updateZIndex() {
    let oldZIndex = this.JQRoot.attr('data-z-index');
    oldZIndex = Number(oldZIndex);
    oldZIndex = isNaN(oldZIndex)? 0: oldZIndex;
    const zIndex = getZIndex(oldZIndex);
    this.JQRoot
      .css({
        'z-index': zIndex
      })
      .attr('data-z-index', zIndex);
  }
  destroy() {
    this.JQRoot.draggable('destroy');
    this.JQRoot.off('mousedown', this._mousedownEvent);
  }
  setPositionCenter() {
    const width = $(window).width();
    const {JQRoot} = this;
    if(width < 700) {
      // 小屏幕
      JQRoot.css({
        "height": "auto!important",
        "width": width * 0.8,
        "top": 0,
        "right": 0
      });
    } else {
      // 宽屏
      JQRoot.css({
        'left':  (width - JQRoot.width()) * 0.5 - 20,
        'height': 'auto!important'
      });
    }
  }
  addClassAndInsertDraggableStyleToDocument() {
    const className = 'draggable-element';
    const dataType = 'draggableStyle';
    let style = $(`style[data-type="${dataType}"]`);
    if(style.length === 0) {
      style = $('<style></style>');
      style.attr('data-type', dataType);
      style.text(`.${className}{height: auto!important;}`);
      $(body).append(style);
    }
    this.JQRoot.addClass(className);
  }
}
