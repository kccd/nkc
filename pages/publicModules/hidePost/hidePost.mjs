NKC.modules.HidePost = class {
  constructor() {
    const self = this;
    self.dom = $("#moduleHidePost"); 
    self.dom.modal({
      show: false
    });
    self.app = new Vue({
      el: "#moduleHidePostApp",
      data: {
        pid: "",
        hide: ""        
      },
      methods: {
        open(callback, options) {
          self.callback = callback;
          const {pid, hide} = options;
          this.pid = pid;
          this.hide = hide;
          self.dom.modal("show");
        },
        close() {
          self.dom.modal("hide");
        },
        submit() {
          nkcAPI(`/p/${this.pid}/hide`, "PATCH", {
            hide: this.hide
          })
            .then(() => {
              self.callback();
              self.app.close();
            })
            .catch(sweetError);
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }
}