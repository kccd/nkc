let UserInfo;
window.PostOption = new Vue({
  el: '#modulePostOptions',
  data: {
    show: false,

    loading: true,

    uid: NKC.configs.uid,
    // 类型 thread、post
    pid: '',
    postType: '',
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
    ipInfo: null
  },
  computed: {
    position() {
      const {top, left, domHeight, domWidth} = this;
      return {
        top: top - domHeight,
        left: left - domWidth
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
    clickElement(e) {
      e.stopPropagation();
    },
    close() {
      this.show = false;
    },
    open(props) {
      const {pid, top, left} = props;
      this.top = top;
      this.left = left;
      const self = this;
      self.show = true;
      self.loading = true;
      nkcAPI(`/p/${pid}/option`, 'GET')
        .then(data => {
          const {tid, pid, options, userColumnId, postType, postUserId} = data;
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

          self.userColumnId = userColumnId;
          self.postType = postType;
          self.tid = tid;
          self.pid = pid;

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
        UserInfo = new NKC.modules.UserInfo();
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
    }
  }
});

NKC.methods.initPostOption = () => {
  const options = $('[data-type="postOption"]');
  for(let i = 0; i < options.length; i++) {
    const dom = options.eq(i);
    const init = dom.attr('data-init');
    if(init === 'ture') continue;
    dom.on('click', (e) => {
      let {left, top} = dom.offset();
      const pid = dom.attr('data-pid');
      PostOption.open({
        pid,
        left: left + dom.width(),
        top: top - 2,
      });
      e.stopPropagation();
    });
  }
};

$(function() {
  NKC.methods.initPostOption();
  const options = $('[data-type="postOption"]');
  options.eq(0).click();
})
