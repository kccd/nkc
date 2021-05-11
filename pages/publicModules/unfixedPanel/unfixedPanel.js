/*
* 初始化非固定类弹窗
* 设置.unfixed-panel为可拖动
* 设置.unfixed-panel-title为拖动手柄
* */
NKC.methods.initUnfixedPanel = function() {
  var dom = $(".unfixed-panel:not('[data-init=\"true\"]')");
  dom.draggable({
    scroll: false,
    handle: ".unfixed-panel-title",
    drag: function(event, ui) {
      if(ui.position.top < 0) ui.position.top = 0;
      var height = $(window).height();
      if(ui.position.top > height - 30) ui.position.top = height - 30;
      var winWidth = $(window).width();
      if(ui.position.left > winWidth - 30) ui.position.left = winWidth - 30;
    }
  });
  dom.attr("data-init", "true");
  var width = $(window).width();
  for(var i = 0; i < dom.length; i++) {
    var d = dom.eq(i);
    d.css("left", (width - d.width())*0.5);
  }
};