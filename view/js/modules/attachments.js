NKC.modules.Attachments = class {
  constructor(options) {
    const self = this;
    const {pid} = options;
    if(!pid) return sweetError("附件模块初始化失败，id不能为空");
    this.app = new Vue({
      el: "#moduleAttachments",
      data: {
        pid, // post ID
        loaded: false, // 是否已经加载完成
        attachments: []
      },
      mounted() {
        this.getAttachments();
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        getSize: NKC.methods.tools.getSize,
        visitUrl: NKC.methods.visitUrl,
        format: NKC.methods.format,
        getAttachments() {
          this.request()
            .then(data => {
              self.app.attachments = data.resources;
              self.app.loaded = true;
            })
            .catch(err => {
              sweetError(err);
            })
        },
        request() {
          const {pid} = this;
          return nkcAPI(`/p/${pid}/resources?t=attachment`, "GET");
        }
      }
    });
  }
};