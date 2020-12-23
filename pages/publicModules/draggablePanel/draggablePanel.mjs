NKC.modules.DraggablePanel = class {
  constructor(domId) {
    const self = this;
    self.dom = $(domId);
    const handle = `.draggable-panel-title`;
    self.dom.draggable({
      scroll: false,
      handle,
      drag: function(event, ui) {
        if(ui.position.top < 0) ui.position.top = 0;
        var height = $(window).height();
        if(ui.position.top > height - 30) ui.position.top = height - 30;
        var width = self.dom.width();
        if(ui.position.left < 100 - width) ui.position.left = 100 - width;
        var winWidth = $(window).width();
        if(ui.position.left > winWidth - 100) ui.position.left = winWidth - 100;
      }
    });
    self.resetPosition();
    self.dom.on("click", function() {
      self.active();
    });
  }
  resetPosition() {
    const dom = this.dom;
    const width = $(window).width();
    const height = $(window).height();
    if(width < 700) {
      // 小屏幕
      dom.css({
        "top": 0,
        "left": 0,
      });
    } else {
      // 宽屏
      dom.css("left", (width - dom.width())*0.5);
      dom.css('top', (height - dom.height()) * 0.5);
    }
  }
  active() {
    const panels = $('.draggable-panel');
    let maxIndex;
    for(let i = 0; i < panels.length; i++) {
      const d = panels.eq(i);
      let _index = d.attr('data-z-index');
      if(!_index === undefined) continue;
      _index = Number(_index);
      if(maxIndex === undefined || maxIndex < _index) maxIndex = _index;
    }
    maxIndex = (maxIndex || 5000) + 1;
    this.dom.css({
      'z-index': maxIndex
    });
    this.dom.attr('data-z-index', maxIndex);
  }
  setSize(type) {
    const dom = this.dom;
    const width = $(window).width();
    if(width < 700) {
      if(type === 'show') {
        dom.css({
          width: '80%',
          left: '20%',
        });
      } else {
        dom.css({
          width: 'auto',
        });
      }
    }
  }
  showPanel() {
    this.resetPosition();
    this.setSize('show');
    this.active();
    this.dom.css('display', 'block');
  }
  hidePanel() {
    this.dom.css('display', 'none');
    this.setSize('hide');
  }
}
