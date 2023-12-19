<template lang="pug">
  div
    MomentVisible(ref="momentVisible")
    .moment-options(v-show="show")
      .post-options-panel(v-if='loading')
        .loading 加载中...
      .post-options-panel(v-else)
        a.option(v-if="moment.url" @click="toMoment(moment.url)" target="_blank")
          .fa.fa-newspaper-o
          span 查看详情
        a.option(v-if="options.delete" @click="deleteMoment")
          .fa.fa-trash
          span 删除
        a.option(v-if="options.disable" @click="disableMoment")
          .fa.fa-ban
          span 屏蔽
        .option(v-if="options.reviewed === 'unknown'" @click="passReview(stableDocument._id)")
          .fa.fa-check-circle-o
          span 通过审核
        .option(v-if='options.violation !== null' @click='viewViolationRecord')
          .fa.fa-newspaper-o
          span 违规记录
        .option(v-if="options.complaint" @click="complaint")
          .fa.fa-minus-circle
          span 投诉或举报
        .option(v-if="options.visibleMoment" @click="visibleMoment")
          .fa.fa-eye
          span 可见状态
        .option(v-if="options.editorMoment" @click="editorMoment")
          .fa.fa-edit
          span 编辑
        .option(v-if="options.visitHistory" @click="visitHistory")
          .fa.fa-history
          span 历史
        .option(v-if='options.ipInfo' @click='displayIpInfo')
          .fa.fa-map-marker
          span 查看IP
        .option(v-if='options.blacklist !== null' @click='userBlacklist')
          .fa.fa-ban
          span(v-if='options.blacklist === false') 加入黑名单
          span(v-else) 移除黑名单
        //.option(v-if='options.ipInfo !== null' @click='displayIpInfo')
        //  .fa.fa-map-marker
        //  span 查看IP
        //- 分享按钮
        .option(
          data-global-click='showSharePanel'
          :data-global-data="objToStr({type: 'moment', id: moment.momentCommentId? moment.momentCommentId: moment.momentId})"
          title='分享'
        )
          .fa.fa-share-square-o
          span 分享
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
    font-size: 1.2rem;
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
import {timeFormat, objToStr} from "../../../js/tools";
import {EventBus} from "../../../../spa/eventBus";
import {visitUrl} from "../../../js/pageSwitch";
import {getUrl} from "../../../js/tools";
import MomentVisible from "../MomentVisible.vue";
export default {
  data: () => ({
    uid: NKC.configs.uid,
    show: false,
    loading: true,
    moment: null,
    options: {},
    toc: null,
    stableDocument: null,
    isAddEvent: false,
  }),
  mounted() {
  },
  components:{
    MomentVisible
  },
  methods: {
    objToStr: objToStr,
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
          self.stableDocument = res.stableDocument;
          self.toc = res.toc;
          self.loading = false;
        })
        .catch(err => {
          sweetError(err);
        })
    },
    //评论详情
    toMoment(url){
      visitUrl(url,true)
    },
    open(props) {
      if(!this.isAddEvent){
        document.addEventListener('click', (e) => {
          this.show = false;
          this.isAddEvent = true;
          e.stopPropagation();
        })
      }
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
        return
        // if(!this.moment) return;
        // docId = this.moment.momentCommentId?this.moment.momentCommentId:this.moment.momentId;
      }
      nkcAPI('/review' , 'PUT', {
        pass: true,
        docId,
        reviewType: 'document'
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
            info = '该会员在你的联系人列表中，确定放入黑名单吗？';
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
      sweetQuestion("删除后不可恢复，确定要删除吗？")
        .then(() => {
          nkcAPI(`/moment/${_id}`, 'DELETE', {
          })
            .then(() => {
              sweetSuccess('操作成功');
              // 刷新
              visitUrl(`${window.location.pathname}${window.location.search}`);
            })
            .catch(err => {
              sweetError(err);
            })
        })
    },
    disableMoment(){
      const {momentId, momentCommentId} = this.moment;
      let _id = momentCommentId || '';
      if(!_id) {
        _id = momentId;
      }
      if(!_id) return;
      sweetQuestion("确定要屏蔽吗？")
        .then(() => {
          nkcAPI(`/moment/${_id}/disable`, 'POST',{
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
    },
    //设置可见状态
    visibleMoment(){
      const mid = this.moment.momentCommentId?this.moment.momentCommentId:this.moment.momentId
      this.$refs.momentVisible.open(mid)
    },
    //编辑电文
    editorMoment(){
      if(this.moment.status !== 'normal'){
        return sweetError('当前电文不可编辑')
      }
      const mid = this.moment.momentCommentId?this.moment.momentCommentId:this.moment.momentId
      this.$emit('selectedMomentId', mid);
    },
    // 访问历史
    visitHistory() {
      visitUrl(getUrl('zoneMomentHistory', this.moment.momentId), true);
    }
  }
}
</script>
