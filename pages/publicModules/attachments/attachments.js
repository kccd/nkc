NKC.modules.Attachments = class {
  constructor(options) {
    const self = this;
    const {pid, fid} = options;
    if(!pid) return sweetError("附件模块初始化失败，id不能为空");
    this.app = new Vue({
      el: "#moduleAttachments",
      data: {
        pid, // post ID
        fid, // 存在文库的专业ID，可能为空。为空时不允许推送到文库
        loaded: false, // 是否已经加载完成
        mark: false, // 多选
        hidden: false,
        createFilePermission: false, // 是否有权限上传文件到文库
        attachments: []
      },
      mounted() {
        this.getAttachments();
        if(!window.ResourceInfo) {
          if(!NKC.modules.ResourceInfo) {
            sweetError("未引入资源信息模块");
          } else {
            window.ResourceInfo = new NKC.modules.ResourceInfo();
          }
        }
      },
      computed: {
        selectedAttachmentCount() {
          let count = 0;
          this.attachments.map(a => {
            if(a.mark) count ++;
          });
          return count;
        }
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        getSize: NKC.methods.tools.getSize,
        visitUrl: NKC.methods.visitUrl,
        format: NKC.methods.format,
        displayResourceInfo(r) {
          ResourceInfo.open({rid: r.rid});
        },
        postToLibrary() {
          const {attachments} = this;
          let rid = [];
          attachments.map(a => {
            if(a.mark) rid.push(a.rid);
          });
          if(rid.length === 0) return;
          rid = rid.join("-");
          this.visitUrl(`/f/${fid}/library?t=upload&id=${rid}`, true);
        },
        markAttachment(mark) {
          this.attachments.map(a => a.mark = false);
          this.mark = !!mark;
        },
        markAll() {
          const {attachments} = this;
          let markCount = 0;
          this.attachments.map(a => {
            if(a.mark) markCount++;
          });
          const mark = attachments.length !== markCount;
          this.attachments.map(a => a.mark = mark)
        },
        getAttachments() {
          this.request()
            .then(data => {
              self.app.createFilePermission = data.createFilePermission;
              data.resources.map(r => {
                r.mark = false;
              });
              self.app.attachments = data.resources;
              self.app.loaded = true;
            })
            .catch(err => {
              sweetError(err);
            })
        },
        request() {
          const {pid} = this;
          return nkcAPI(`/p/${pid}/resources?d=attachment`, "GET");
        }
      }
    });
  }
  hide() {
    this.app.hidden = true;
  }
  show() {
    this.app.hidden = false;
  }
};
