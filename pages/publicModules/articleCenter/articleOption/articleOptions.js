import {nkcAPI} from "../../../lib/js/netAPI";
import {getUrl} from "../../../lib/js/tools";
import {visitUrl} from "../../../lib/js/pageSwitch";

import {screenTopAlert, screenTopWarning} from "../../../lib/js/topAlert";
window.articleOption = new Vue({
  el: '#moduleArticleOptions',
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
    tid: null,
    collected: null,
    type: 'article', //需要操作的文章
    // 发表时间
    toc: '',
    // 作者
    author: {
      username: '',
      uid: ''
    },
    
    article: null,
  
    direction: null,
    
    top: 300,
    left: 300,
    
    domHeight: 0,
    domWidth: 0,
    optionStatus: {},
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
        const position =  {
          top: top - domHeight,
          left: left - domWidth + jqDOM.width()
        }
        return position;
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
    //查看文章历史
    showHistory() {
      const {_id} = this.article;
      const url = getUrl('history', "article", _id);
      visitUrl(url, true);
    },
    open(props) {
      const {aid, direction, jqDOM, tid = '', collected = '',} = props;
      this.jqDOM = jqDOM;
      this.direction = direction;
      const self = this;
      self.loading = true;
      //获取当前用户对文章的操作权限
      if(aid)  {
        self.getPermissions(aid)
      } else if(tid) {
        self.tid = tid;
        self.collected = collected;
        self.loading = false;
        self.show = true;
        self.type = 'thread';
      }
    },
    //获取当前操作权限
    getPermissions(aid) {
      const self = this;
      nkcAPI(`/article/${aid}/options`, 'GET')
        .then(data => {
          if(data.optionStatus) self.optionStatus = data.optionStatus;
          self.article = data.article;
          self.loading = false;
          self.show = true;
          self.toc = data.toc;
          self.digestData = {
            digestRewardScore: data.digestRewardScore,
            redEnvelopeSettings: data.redEnvelopeSettings,
          };
        })
        .catch(err => {
          sweetError(err);
        });
    },
    editArticle() {
      if(this.article) {
        visitUrl(this.article.editorUrl, true);
      }
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
      if(!window.UserInfo) {
        window.UserInfo = new NKC.modules.UserInfo();
      }
      window.UserInfo.open({
        type: "showUserByPid",
        pid: this.pid
      });
    },
    collectionThread() {
      let {type, tid, collected} = this;
      const self = this;
      if(type === 'article') {
        const {_id} = self.article;
        const {collection} = self.optionStatus;
        nkcAPI(`/article/${_id}/collection`, 'POST', {
          type: !collection,
        })
          .then(() => {
            self.optionStatus.collection = !collection;
            if(collection) {
              sweetSuccess(`已取消收藏`);
            } else {
              sweetSuccess(`已加入收藏`);
            }
          })
          .catch(sweetError);
      } else if(type === 'thread') {
        if(collected === 'true') {
          collected = true
        } else if(collected === 'false') {
          collected = false;
        }
        SubscribeTypes.collectionThreadPromise(tid, !collected)
          .then(() => {
            if(collected) {
              sweetSuccess(`已取消收藏`);
            } else {
              sweetSuccess(`已加入收藏`);
            }
          })
          .catch(sweetError);
      }
    },
    subscribeThread() {
      const {tid, subscribe} = this;
      SubscribeTypes.subscribeThread(tid, !subscribe);
    },
    replyArticle() {
      if(this.type === 'article') {
        window.location.href = '#container';
      } else if(this.type === 'thread') {
        visitUrl(`/t/${this.tid}#container`, true);
      }
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
      const {_id} = this.article;
      window.RootApp.addXsf((data) => {
        const {num, description} = data;
        const obj = {
          num,
          description,
        };
        nkcAPI(`/article/${_id}/credit/xsf`, 'POST', obj)
          .then(() => {
            window.RootApp.closeXsf();
            window.location.reload();
          })
          .catch(err => {
            screenTopWarning(err);
          })
      }, {})
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
    disableArticle() {
      const {_id} = this.article.document;
      NKC.methods.disabledDocuments(_id);
    },
    viewViolationRecord() {
      const {uid} = this.article;
      NKC.modules.violationRecord.open({uid});
    },
    complaintPost() {
      if(this.postType === 'thread') {
        moduleComplaint.open("thread", this.tid);
      } else {
        moduleComplaint.open("post", this.pid);
      }
    },
    //用户黑名单
    userBlacklist() {
      const {blacklist, articleUserId} = this.optionStatus;
      const {uid, _id} = this.article;
      if(blacklist) {
        this.removeUserToBlackList(articleUserId);
      } else {
        this.addUserToBlackList(articleUserId, 'article', _id);
      }
    },
    //用户移除黑名单 tUid 被拉黑的用户
    removeUserToBlackList(uid) {
      nkcAPI('/blacklist?tUid=' + uid, 'GET')
        .then(data => {
          if(!data.bl) throw "对方未在黑名单中";
          return nkcAPI('/blacklist?tUid=' + uid, 'DELETE');
        })
        .then(data => {
          sweetSuccess('操作成功！');
          return data;
        })
        .catch(sweetError);
    },
    //用户添加到黑名单 tUid 被拉黑的用户 form 拉黑来源 cid 被拉黑的comment
    addUserToBlackList(tUid, from, aid) {
      var isFriend = false, subscribed = false;
      return Promise.resolve()
        .then(function() {
          return nkcAPI('/blacklist?tUid=' + tUid,  'GET')
        })
        .then(function(data) {
          isFriend = data.isFriend;
          subscribed = data.subscribed;
          var bl = data.bl;
          if(bl) throw '对方已在黑名单中';
          var info;
          if(isFriend) {
            info = '该会员在你的好友列表中，确定放入黑名单吗？';
          } else if(subscribed) {
            info = '该会员在你的关注列表中，确定放入黑名单吗？';
          }
          if(info) return sweetQuestion(info);
        })
        .then(function() {
          if(isFriend) {
            return nkcAPI(`/message/friend?uid=` + tUid, 'DELETE', {})
          }
        })
        .then(function() {
          if(subscribed) {
            return SubscribeTypes.subscribeUserPromise(tUid, false);
          }
        })
        .then(function() {
          return nkcAPI('/blacklist', 'POST', {
            tUid: tUid,
            from: from,
            aid
          })
        })
        .then(function(data) {
          sweetSuccess('操作成功');
          return data;
        })
        .catch(sweetError);
    },
    //文章解封
    unblock() {
      const {document, _id} = this.article;
      const {_id: docId} = document;
      if(_id) return;
      nkcAPI(`/comment/${_id}/unblock`, 'POST', {
        docsId: [docId]
      })
        .then(res => {
          screenTopAlert('已解除屏蔽');
        })
        .catch(err => {
          sweetError(err);
        })
    },
    displayIpInfo() {
      NKC.methods.getIpInfo(this.ipInfo);
    },
    reviewArticle() {
      const {_id} = this.article.document;
      nkcAPI('/review', 'PUT', {
        pass: true,
        docId: _id,
        type: 'document'
      })
        .then(res => {
          sweetSuccess('操作成功');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        })
        .catch(err => {
          sweetError(err);
        })
    },
    toCommentControl() {
      const {pid} = this;
      if(!window.commentControl) {
        window.commentControl = new NKC.modules.CommentControl();
      }
      window.commentControl.open(pid);
    },
    complaintSelector(){
      var self = this;
      const {_id} = self.article;
      if(!window.complaintSelector)
        window.complaintSelector = new NKC.modules.ComplaintSelector();
      complaintSelector.open("article", _id);
      self.close();
    },
    //独立文章取消精选
    unDigestArticle() {
      const self = this;
      const {_id} = self.article;
      nkcAPI('/article/'+_id+'/digest', 'DELETE', {})
        .then(function() {
          screenTopAlert('已取消精选');
          self.optionStatus.digest = false;
        })
        .catch(function(data) {
          screenTopWarning(data.error||data);
        })
    },
    //独立文章加精
    digestArticle(kcb) {
      const self = this;
      const {_id} = self.article;
      return nkcAPI(`/article/${_id}/digest`, 'POST', {
        kcb,
      })
        .then(() => {
          screenTopAlert('操作成功');
          self.optionStatus.digest = true;
        })
        .catch((data) => {
          screenTopWarning(data.error || data);
        })
    },
    //精选控制
    articleDigest() {
      const {digest} = this.optionStatus;
      const self = this;
      if(!digest) {
        window.RootApp.openDigest((kcb)=> {
          self.digestArticle(kcb)
            .then(() => {
              window.RootApp.closeDigest();
            });
        },{
          digestData: self.digestData,
        });
      } else {
        self.unDigestArticle();
      }
    }
  }
});


NKC.methods.initArticleOption = () => {
  const options = $('[data-type="articleOption"]');
  for(let i = 0; i < options.length; i++) {
    const dom = options.eq(i);
    const init = dom.attr('data-init');
    if(init === 'true') continue;
    dom.on('click', (e) => {
      const aid = dom.attr('data-aid');
      const tid = dom.attr('data-tid');
      const collected = dom.attr('data-collected');
      const direction = dom.attr('data-direction') || 'up';
      articleOption.open({
        aid,
        tid,
        collected,
        direction,
        jqDOM: dom,
      });
      //阻止浏览器默认行为
      e.stopPropagation();
    });
    dom.attr('data-init', 'true');
  }
};

$(function() {
  NKC.methods.initArticleOption();
})
