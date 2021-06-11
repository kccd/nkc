/*
* 将元素设为可拖动元素
* @param {String} jQuery selector 需要设为可拖动元素的元素
* @param {String} jQuery selector 拖动的手柄（鼠标按下该元素后移动）默认：.draggable-handle
* */
export function setAsDraggableElement(container, func) {
  const containerJQ = $(container);
  containerJQ.draggable({
    scroll: false,
    handle: '.draggable-handle',
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
}