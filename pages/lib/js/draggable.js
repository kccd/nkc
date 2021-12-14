/*
* 将元素设为可拖动元素
* @param {String} jQuery selector 需要设为可拖动元素的元素
* @param {String} jQuery selector 拖动的手柄（鼠标按下该元素后移动）
* */
import {getFromLocalStorage, saveToLocalStorage, storageKeys} from "./localStorage";

const defaultZIndex = 1050;

export function getZIndex() {
  let {zIndex} = getFromLocalStorage(storageKeys.draggableElement);
  try{
    if(!zIndex || typeof zIndex !== 'number') zIndex = defaultZIndex;
    zIndex += 10;
  } catch(err) {
    zIndex = defaultZIndex;
  }
  saveToLocalStorage(storageKeys.draggableElement, {zIndex});
  return zIndex;
}
export function setAsDraggableElement(container, handSelector, func) {
  const containerJQ = $(container);
  containerJQ.draggable({
    scroll: false,
    handle: $(handSelector),
    drag: function(event, ui) {
      if(ui.position.top < 0) ui.position.top = 0;
      var height = $(window).height();
      if(ui.position.top > height - 30) ui.position.top = height - 30;
      var width = containerJQ.width();
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
  });
  return containerJQ;
}

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
    const zIndex = getZIndex();
    this.JQRoot.css({
      'z-index': zIndex
    });
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
        "width": width * 0.8,
        "top": 0,
        "right": 0
      });
    } else {
      // 宽屏
      JQRoot.css("left", (width - JQRoot.width()) * 0.5 - 20);
    }
  }
}