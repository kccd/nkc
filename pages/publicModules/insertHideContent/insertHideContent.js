NKC.modules.insertHideContent = function() {
  var self = this;
  self.dom = $("#insertHideContentContainer");
  self.dom.draggable({
    scroll: false,
    handle: ".module-sr-title",
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
  var width = $(window).width();
  self.dom.css("left", (width - self.dom.width())*0.5);
  self.app = new Vue({
    el: "#insertHideContentApp",
    data: {
      score: 1,
      isModify: false
    },
    methods: {
      close: function() {
        self.dom.hide();
      },
      open: function(callback, initScore) {
        this.score = 1;
        self.dom.show();
        if(callback && typeof callback === "function") this.callback = callback;
        if(initScore && typeof initScore === "number") {
          this.score = initScore;
          this.isModify = true;
        }
      },
      insert: function() {
        var score = parseInt(this.score);
        if(score !== this.score) return sweetWarning("分值必须是整数");
        if(score < 1) return sweetWarning("分值必须大于0");
        if(score > 99) return sweetWarning("分值必须小于100");

        this.callback(score);
        this.close();
      },
      callback: function(){}
    }
  });
  self.open = self.app.open;
  self.close = self.app.close;
};