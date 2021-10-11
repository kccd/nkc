class CommentControl extends NKC.modules.DraggablePanel {
  constructor() {
    const domId = `#moduleCommentControl`;
    super(domId);
    const self = this;
    self.dom = $(domId);
    self.app = new Vue({
      el: '#moduleCommentControlApp',
      data: {
        pid: '',
        comment: '',
        loading: true
      },
      methods: {
        submit() {
          nkcAPI(`/p/${this.pid}/comment`, 'POST', {
            comment: this.comment
          })
            .then(() => {
              sweetSuccess('保存成功');
              self.close();
            })
            .catch(err => {
              sweetError(err);
            });
        },
        open(pid) {
          self.showPanel();
          const _this = this;
          _this.pid = pid;
          nkcAPI(`/p/${pid}/comment`, 'GET')
            .then((res) => {
              _this.comment = res.comment;
              _this.loading = false;
            })
            .catch((err) => {
              sweetError(err);
            });
        },
        close() {
          self.hidePanel();
        }
      }
    });
  }
  open(pid) {
    this.app.open(pid);
  }
  close(){
    this.app.close();
  }
}

NKC.modules.CommentControl = CommentControl;
