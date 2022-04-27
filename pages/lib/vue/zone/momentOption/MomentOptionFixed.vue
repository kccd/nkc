<template lang="pug">
  .moment-options( v-show="show" @click="")
    .post-options-panel(v-if='loading')
      .loading 加载中...
    .post-options-panel(v-else)
      a.option(v-if="moment.url" :href="moment.url")
        .fa.fa-newspaper-o
        span 查看详情
      a.option(v-if="options.delete" @click="deleteMoment")
        .fa.fa-edit
        span 删除
      .option(v-if="options.reviewed === 'unknown'" @click="passReview()")
        .fa.fa-check-circle-o
        span 通过审核
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
      //.option(v-if='options.ipInfo !== null' @click='displayIpInfo')
      //  .fa.fa-map-marker
      //  span 查看IP
      .option.time
        span {{timeFormat(toc)}}
</template>

<style lang="less" scoped>
@import '../../../../publicModules/base';
.moment-options{
  position: absolute;
  z-index: 1000;
  right: 0;
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
import {nkcAPI} from "../../../js/netAPI";
import {timeFormat} from "../../../js/tools";
import {EventBus} from "../../../../spa/eventBus";
export default {
  data: () => ({
    uid: NKC.configs.uid,
    show: false,
    loading: true,
    moment: null,
    options: {},
    toc: null,
  }),
  mounted() {
    const self = this;
    document.addEventListener('click', () => {
      self.show = false;
    })
  },
  methods: {
    timeFormat: timeFormat,
    clickElement(e) {
      e.stopPropagation();
    },
    //获取当前用户的操作权限
    getPermission() {
      const self = this;
      return nkcAPI(`/moment/${self.moment.momentCommentId?self.moment.momentCommentId:self.moment.momentId}/options`, 'GET', {})
        .then(res => {
          self.options = res.optionStatus;
          self.toc = res.toc;
          self.loading = false;
        })
        .catch(err => {
          sweetError(err);
        })
    },
    open(props) {
      this.loading = true;
      const {moment, DOM, direction} = props;
      this.toc = null;
      this.options = {};
      this.moment = moment;
      //获取菜单权限
      this.getPermission()
        .then(() => {
          this.show = true;
        });
    },
    close() {
      this.show = false;
    },
    //投诉或举报
    complaint() {
      this.$emit('complaint', this.moment.momentCommentId?this.moment.momentCommentId:this.moment.momentId);
    },
    //通过审核
    passReview(_id) {
      let docId;
      if(_id) {
        docId = _id;
      } else {
        if(!this.moment) return;
        docId = this.moment.momentCommentId?this.moment.momentCommentId:this.moment.momentId;
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
      if(!this.moment) return sweetWarning('未找到评论内容');
      const {momentId, momentCommentId}= this.moment;
      nkcAPI(`/moment/${momentCommentId?momentCommentId:momentId}/ipInfo`, 'GET')
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
      const {uid: tUid, momentId, momentCommentId} = this.moment;
      let _id = momentCommentId;
      if(!momentCommentId) {
        _id = momentId;
      }
      const {blacklist} = this.options;
      if(blacklist) {
        //移除黑名单
        this.removeUserToBlackList(tUid);
      } else {
        //加入黑名单
        this.addUserToBlackList(tUid, 'comment', _id)
      }
    },
    //违规记录
    viewViolationRecord() {
      EventBus.$emit('violation-record', this.moment.uid);
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
    //用户添加到黑名单 tUid 被拉黑的用户 form 拉黑来源 mid 被拉黑的moment
    addUserToBlackList(tUid, from, mid) {
      const self = this;
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
            return self.subscribeUserPromise(tUid, false);
          }
        })
        .then(function() {
          return nkcAPI('/blacklist', 'POST', {
            tUid: tUid,
            from: from,
            mid
          })
        })
        .then(function(data) {
          sweetSuccess('操作成功');
          return data;
        })
        .catch(sweetError);
    },
    subscribeUserPromise(id, sub, cid) {
      const method = sub? "POST": "DELETE";
      return nkcAPI("/u/" + id + "/subscribe", method, {cid: cid || []});
    },
    //删除动态
    deleteMoment() {
      const {momentId, momentCommentId} = this.moment;
      let _id = momentCommentId || '';
      if(!_id) {
        _id = momentId;
      }
      if(!_id) return;
      sweetQuestion("删除后不可回复，你确定要删除吗？")
        .then(() => {
          nkcAPI(`/moment/${_id}`, 'DELETE', {
          })
            .then(() => {
              sweetSuccess('操作成功');
            })
            .catch(err => {
              sweetError(err);
            })
        })
    },
    //查看详情
    detail() {
      const {url} = this.moment;
      if(url) {
        window.location.href = url;
      }
    }
  }
}
</script>
