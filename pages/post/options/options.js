let UserInfo;
window.PostOption = new Vue({
  el: '#modulePostOptions',
  data: {
    show: false,

    loading: true,

    jqDOM: null,

    uid: NKC.configs.uid,
    // 类型 thread、post
    pid: '',
    postType: '',
    isComment: false,
    postUserId: '',
    tid: '',
    // 发表时间
    toc: '',
    // 作者
    author: {
      username: '',
      uid: ''
    },

    top: 300,
    left: 300,

    domHeight: 0,
    domWidth: 0,

    anonymous: null,
    anonymousUser: null,
    blacklist: null,
    collection: null,
    complaint: null,
    digest: null,
    disable: null,
    edit: null,
    hidePost: null,
    history: null,
    inColumn: null,
    kcb: null,
    subscribe: null,
    topped: null,
    violation: null,
    warningPost: null,
    xsf: null,
    ipInfo: null,
    reviewed: null,
    commentControl: null,
  },
  computed: {
    position() {
      const {direction, jqDOM, domHeight, domWidth} = this;
      if(jqDOM === null) return {
        left: 0,
        top: 0,
      };
      const {top, left} = jqDOM.offset();
      if(direction === 'up') {
        return {
          top: top - domHeight,
          left: left - domWidth + jqDOM.width()
        }
      } else {
        return {
          top: top + jqDOM.height(),
          left: left + jqDOM.width() - domWidth
        }
      }
    }
  },
  mounted() {
    const self = this;
    document.addEventListener('click', (e) => {
      self.show = false;
    });
  },
  updated() {
    const dom = $(this.$el);
    this.domHeight = dom.height();
    this.domWidth = dom.width();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    format: NKC.methods.format,
    visitUrl: NKC.methods.visitUrl,
    clickElement(e) {
      e.stopPropagation();
    },
    close() {
      this.show = false;
    },
    open(props) {
      const {pid, direction, jqDOM} = props;
      this.jqDOM = jqDOM;
      this.direction = direction;
      const self = this;
      self.show = true;
      self.loading = true;
      nkcAPI(`/p/${pid}/option`, 'GET')
        .then(data => {
          const {tid, pid, toc, options, userColumnId, postType, postUserId, isComment} = data;
          self.isComment = isComment;
          self.anonymous = options.anonymous;
          self.anonymousUser = options.anonymousUser;
          self.blacklist = options.blacklist;
          self.collection = options.collection;
          self.complaint = options.complaint;
          self.digest = options.digest;
          self.disable = options.disable;
          self.edit = options.edit;
          self.hidePost = options.hidePost;
          self.history = options.history;
          self.inColumn = options.inColumn;
          self.kcb = options.kcb;
          self.subscribe = options.subscribe;
          self.topped = options.topped;
          self.violation = options.violation;
          self.warningPost = options.warningPost;
          self.xsf = options.xsf;
          self.ipInfo = options.ipInfo;
          self.reviewed = options.reviewed;
          self.commentControl = options.commentControl;

          self.userColumnId = userColumnId;
          self.postType = postType;
          self.tid = tid;
          self.pid = pid;
          self.toc = toc;

          self.postUserId = postUserId;

          self.loading = false;
        })
        .catch(err => {
          sweetError(err);
        });
    },
    toColumn() {
      const {inColumn, pid, userColumnId} = this;
      if(inColumn) {
        removeToColumn(pid, userColumnId);
      } else {
        addToColumn(pid, userColumnId);
      }
    },
    setAnonymous() {
      const self = this;
      const {anonymous, pid} = this;
      nkcAPI("/p/" + pid + "/anonymous", "POST", {
        anonymous: !anonymous
      })
        .then(function(data) {
          self.anonymous = data.anonymous;
          if(self.anonymous) {
            sweetSuccess(`内容已匿名`);
          } else {
            sweetSuccess(`内容已取消匿名`);
          }
        })
        .catch(function(data) {
          sweetError(data);
        })

    },
    viewAuthorInfo() {
      if(!UserInfo) {
        window.UserInfo = new NKC.modules.UserInfo();
      }
      UserInfo.open({
        type: "showUserByPid",
        pid: this.pid
      });
    },
    collectionThread() {
      const {tid, collection} = this;
      const self = this;
      SubscribeTypes.collectionThreadPromise(tid, !collection)
        .then(() => {
          self.collection = !collection;
          if(collection) {
            sweetSuccess(`已取消收藏`);
          } else {
            sweetSuccess(`已加入收藏`);
          }
        })
        .catch(sweetError);
    },
    subscribeThread() {
      const {tid, subscribe} = this;
      SubscribeTypes.subscribeThread(tid, !subscribe);
    },
    replyPost() {
      window.quotePost(this.pid);
    },
    hidePostContent() {
      const {pid, hidePost} = this;
      if(!window.hidePostPanel) {
        window.hidePostPanel = new NKC.modules.HidePost();
      }
      window.hidePostPanel.open(function() {
        sweetSuccess('执行成功');
      }, {
        pid: pid,
        hide: hidePost
      });
    },
    postTopped() {
      const {pid, topped} = this;
      const self = this;
      nkcAPI("/p/" + pid + "/topped", "POST", {topped: !topped})
        .then(function() {
          sweetSuccess("操作成功");
          self.topped = !topped;
        })
        .catch(function(data) {
          sweetError(data);
        });
    },
    addXSF() {
      const {pid} = this;
      credit(pid, 'xsf');
    },
    addKCB() {
      const {pid} = this;
      credit(pid, 'kcb');
    },
    postDigest() {
      const {pid, digest} = this;
      if(digest) {
        unDigestPost(pid);
      } else {
        digestPost(pid);
      }
    },
    postWarning() {
      openPostWarningDom(this.pid);
    },
    disablePost() {
      disabledThreadPost(this.pid);
    },
    viewViolationRecord() {
      NKC.modules.violationRecord.open({uid: this.postUserId});
    },
    complaintPost() {
      if(this.postType === 'thread') {
        moduleComplaint.open("thread", this.tid);
      } else {
        moduleComplaint.open("post", this.pid);
      }
    },
    userBlacklist() {
      const {blacklist, postUserId} = this;
      if(blacklist) {
        NKC.methods.removeUserFromBlacklist(postUserId);
      } else {
        NKC.methods.addUserToBlacklist(postUserId, 'post', this.pid);
      }
    },
    displayIpInfo() {
      NKC.methods.getIpInfo(this.ipInfo);
    },
    reviewPost() {
      const {pid} = this;
      reviewPost(pid)
    },
    toCommentControl() {
      const {pid} = this;
      if(!window.commentControl) {
        window.commentControl = new NKC.modules.CommentControl();
      }
      window.commentControl.open(pid);
    }
  }
});

NKC.methods.initPostOption = () => {
  const options = $('[data-type="postOption"]');
  for(let i = 0; i < options.length; i++) {
    const dom = options.eq(i);
    const init = dom.attr('data-init');
    if(init === 'true') continue;
    dom.on('click', (e) => {
      let {left, top} = dom.offset();
      const pid = dom.attr('data-pid');
      const direction = dom.attr('data-direction') || 'up';
      PostOption.open({
        pid,
        direction,
        jqDOM: dom,
      });
      e.stopPropagation();
    });
    dom.attr('data-init', 'true');
  }
};

$(function() {
  NKC.methods.initPostOption();
})
