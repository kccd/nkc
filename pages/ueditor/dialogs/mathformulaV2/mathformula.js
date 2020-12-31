NKC.modules.insertMathformula = function() {
  var self = this;
  self.dom = $("#mathformulaContainer");
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
    el: "#mathformulaApp",
    data: {
      text: ""
    },
    methods: {
      close: function() {
        self.dom.hide();
      },
      rendering: function() {
        var f = this.text || "$\\sum_{i=0}^N\\int_{a}^{b}g(t,i)\\text{d}t$";
        var outputDom = $("#mathOutput")[0];
        $(outputDom).html(f);
        MathJax.typesetPromise([outputDom]);
      },
      open: function(callback) {
        self.dom.show();
        if(callback && typeof callback === "function") this.callback = callback;
      },
      insert: function() {
        this.callback(this.text);
        this.close();
      },
      callback: function(){}
    }
  });
  self.open = self.app.open;
  self.close = self.app.close;
};

// 忽略标签名以mjx-开头的元素
Vue.config.ignoredElements = [
  /^mjx-/
]
