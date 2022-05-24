<template lang="pug">
  #modulePostOptions(:style="'top:'+position.top+'px;left:'+position.left+'px'" v-show="show" @click="")
    .post-options-panel(v-if='loading')
      .loading 加载中...
    .post-options-panel(v-else)
      a.option(v-if="options.editor" @click="editor()")
        .fa.fa-edit
        span 编辑
      .option(v-if='options.digest !== null' @click='commentDigest')
        .fa.fa-star-o(v-if='options.digest === false')
        .fa.fa-star(v-else)
        span(v-if='options.digest === false') 设为精选
        span(v-else) 取消精选
      .option(v-if="options.reviewed === 'unknown'" @click="passReview()")
        .fa.fa-check-circle-o
        span 通过审核
      .option(v-if="options.disabled" @click="disableComment()")
        .fa.fa-eye-slash
        span 退修或删除
      .option(v-if='options.violation !== null' @click='viewViolationRecord')
        .fa.fa-newspaper-o
        span 违规记录
      .option(v-if="options.complaint" @click="complaint")
        .fa.fa-minus-circle
        span 投诉或举报
      .option(v-if='options.blacklist !== null' @click='userBlacklist')
        .fa.fa-ban
        span(v-if='options.blacklist === false') 加入黑名单
        span(v-else) 移除黑名单
      .option(v-if='options.ipInfo !== null' @click='displayIpInfo')
        .fa.fa-map-marker
        span 查看IP
      .option.time
        span {{timeFormat(toc)}}
</template>

<style lang="less">
@import '../publicModules/base';
#modulePostOptions{
  position: absolute;
  z-index: 1000;
  .loading{
    text-align: center;
  }
  .post-options-panel{
    padding: 0.5rem 0;
    min-width: 12rem;
    background-color: #fff;
    box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
    border: 1px solid rgba(0, 0, 0, .23);
    border-radius: 4px;
    transition: height 1s;
    @optionHeight: 2rem;
    .option{
      text-align: left;
      &:hover{
        background-color: #eee;
      }
      &.time{
        padding-left: 0;
        text-align: center;
        border-top: 1px solid #eee;
        font-size: 1rem;
        padding-top: 0.25rem;
        &:hover{
          background-color: inherit;
        }
      }
      display: block;
      color: #333;
      padding-left: 3.4rem;
      height: @optionHeight;
      line-height: @optionHeight;
      position: relative;
      cursor: pointer;
      font-size: 1.15rem;
      text-decoration: none;
      .fa{
        left: 1.4rem;
        top: 0;
        bottom: 0;
        margin: auto;
        position: absolute;
        height: @optionHeight;
        font-size: 1.25rem;
        line-height: @optionHeight;
      }
    }
  }
}


</style>

<script>
import {timeFormat} from "../lib/js/tools";
import {nkcAPI} from "../lib/js/netAPI";
import {screenTopAlert} from "../lib/js/topAlert";
export default {
  data: () => ({
    show: false,
    loading: true,
    jqDOM: null,
    domHeight: 0,
    domWidth: 0,
    comment: null,
    direction: '',
    commentId: null,
    options: {},
    toc: null,
    digestData: null,
  }),
  computed: {
    position() {
      const {jqDOM, domHeight, domWidth, direction} = this;
      if(!jqDOM) return {
        left: 0,
        top: 0,
      }
      const {left, top} = jqDOM.offset();
      if(direction === 'up') {
        const position = {
          top: top - domHeight,
          left: left - domWidth + jqDOM.width(),
        }
        return position;
      } else {
        return {
          top: top + jqDOM.height(),
          left: left - domWidth + jqDOM.width(),
        }
      }
    }
  },
  mounted() {
    const self = this;
    document.addEventListener('click', () => {
      self.show = false;
    })
  },
  updated() {
    const dom = $(this.$el);
    const content = $('#comment-content');
    let top = 0,left = 0;
    if(content) {
      top = (content.offset()).top;
      left = (content.offset()).left;
    }
    this.domHeight = dom.height() + top;
    this.domWidth = dom.width() + left;
  },
  methods: {
    timeFormat: timeFormat,
    getPermission() {
      const self = this;
      return nkcAPI(`/comment/${self.comment._id}/options?aid=${self.comment.sid}`, 'GET', {})
      .then(res => {
        self.options = res.options;
        self.toc = res.toc;
        self.loading = false;
        self.digestData = {
          digestRewardScore: res.digestRewardScore,
          redEnvelopeSettings: res.redEnvelopeSettings,
        };
      })
      .catch(err => {
        sweetError(err);
      })
    },
    open(props) {
      this.loading = true;
      const {comment, DOM, direction} = props;
      this.toc = null;
      this.options = {};
      this.comment = comment;
      //获取菜单权限
      this.getPermission()
      .then(() => {
        this.show = true;
      });
      this.direction = direction;
      this.jqDOM = DOM;
    },
    close() {
      this.show = false;
    },
    //编辑评论
    editor() {
      this.$emit('editor-comment', this.comment._id);
    },
    //退修或删除
    disableComment() {
      this.$emit('disable-comment', this.comment.docId);
    },
    //投诉或举报
    complaint() {
      this.$emit('complaint', this.comment._id);
    },
    //通过审核
    passReview(_id) {
      let docId;
      if(_id) {
        docId = _id;
      } else {
        if(!this.comment) return;
        docId = this.comment.docId;
      }
      nkcAPI('/review' , 'PUT', {
        pass: true,
        docId,
        type: 'document'
      })
        .then(res => {
          sweetSuccess('操作成功');
        })
        .catch(err => {
          sweetError(err);
        })
    },
    //查看IP
    displayIpInfo() {
      if(!this.comment) return sweetWarning('未找到评论内容');
      const {_id}= this.comment;
      nkcAPI(`/comment/${_id}/ipInfo`, 'GET')
      .then((res) => {
        return res.ipInfo;
      })
      .then((info) => {
        if(!info) return sweetError('获取ip地址失败');
        return asyncSweetCustom("<p style='font-weight: normal;'>ip: "+ info.ip +"<br>位置: "+ info.location +"</p>");
      })
      .catch((err) => {
        sweetError(err);
      })
    },
    //加入黑名单 tUid 被拉黑的用户
    userBlacklist() {
      const {uid: tUid, _id: cid} = this.comment;
      const {blacklist} = this.options;
      if(blacklist) {
        //移除黑名单
        this.removeUserToBlackList(tUid);
      } else {
        //加入黑名单
        this.addUserToBlackList(tUid, 'comment', cid)
      }
    },
    //违规记录
    viewViolationRecord() {
      this.$emit('violation-record', this.comment.uid);
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
    addUserToBlackList(tUid, from, cid) {
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
            cid
          })
        })
        .then(function(data) {
          sweetSuccess('操作成功');
          return data;
        })
        .catch(sweetError);
    },
    //评论加精
    digestComment(kcb) {
      const self = this;
      const {_id} = self.comment;
      return nkcAPI(`/comment/${_id}/digest`, 'POST', {
        kcb
      })
        .then(() => {
          screenTopAlert('操作成功');
          self.options.digest = true;
        })
        .catch(console.error)
    },
    unDigestComment() {
      const self = this;
      const {_id} = self.comment;
      return nkcAPI(`/comment/${_id}/digest`, 'DELETE')
        .then(() => {
          screenTopAlert('已取消精选');
          self.options.digest = false;
        })
        .catch(console.error)
    },
    //评论加精控制
    commentDigest() {
      const {digest} = this.options;
      const self = this;
      if(!digest) {
        window.RootApp.openDigest((kcb) => {
          self.digestComment(kcb)
            .then(() => {
              window.RootApp.closeDigest();
            });
        }, {
          digestData: self.digestData,
        })
      } else {
        self.unDigestComment();
      }
    }
  }
}
</script>
