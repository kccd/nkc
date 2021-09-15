class ComplaintSelector extends NKC.modules.DraggablePanel {
  constructor() {
    const domId = `#moduleComplaintSelector`;
    super(domId);
    const self = this;
    self.dom = $(domId);
    self.app = new Vue({
      el: domId + 'App',
      data: {
        loading: true
      },
      computed: {
      },
      mounted() {
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        open(callback, options = {}) {
          self.callback = callback;
          self.showPanel();
        },
        close() {
          self.hidePanel();
        },
      }
    })
  }
  open(props, options) {
    this.app.open(props, options);
  }
}
NKC.modules.ComplaintSelector = ComplaintSelector;
