NKC.modules.downloadResource = class {
  constructor() {
    const self = this;
    self.dom = $("#moduleDownloadResource");
    self.app = new Vue({
      el: "#moduleDownloadResourceApp",
      data: {
        uid: NKC.configs.uid,
        paging: {},
        perpage: 7,
        loading: false,
        drafts: []
      },
      methods: {
        fromNow: NKC.methods.fromNow,
        initDom() {
          const height = "43.5rem";
          self.dom.css({
            height
          });
          self.dom.draggable({
            scroll: false,
            handle: ".module-sd-title",
            drag: function(event, ui) {
              if(ui.position.top < 0) ui.position.top = 0;
              const height = $(window).height();
              if(ui.position.top > height - 30) ui.position.top = height - 30;
              const width = self.dom.width();
              if(ui.position.left < 100 - width) ui.position.left = 100 - width;
              const winWidth = $(window).width();
              if(ui.position.left > winWidth - 100) ui.position.left = winWidth - 100;
            }
          });
          const width = $(window).width();
          if(width < 700) {
            // 小屏幕
            self.dom.css({
              "width": width * 0.8,
              "top": 0,
              "right": 0
            });
          } else {
            // 宽屏
            self.dom.css("left", (width - self.dom.width())*0.5 - 20);
          }
          self.dom.show();
        },
        open(callback) {
          self.callback = callback;
          this.initDom();
          // this.getDrafts();
        },
        close() {
          self.dom.hide();
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }
};