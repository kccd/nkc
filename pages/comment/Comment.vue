<template lang="pug">
  div
    options(ref="commentOptions"
      :source="source"
      :sid="sid"
      @editor-comment="editorComment"
      @disabled="disabledComment"
      @complaint="complaint"
      @pass-review="passReview"
      @display-ip-info="displayIpInfo"
      @view-violation="viewViolation"
      )
    float-user-panel(ref="floatUserPanel" @open-subscribe="openSubscribe")
    sticker(ref="sticker")
    violation-record(ref="violationRecord")
    complaint(ref="complaint")
    disabled-comment(ref="disabledComment")
    subscribe-types(ref="subscribeTypes")
    mixin skeleton
      .comment-item
        .comment-item-header
          .comment-item-avatar.skeleton
          .comment-item-info
            .comment-item-username.skeleton
            .comment-item-time.skeleton
        .comment-item-content
          div.skeleton
          div.skeleton
          div.skeleton

    .comment-header 评论列表 {{source}} {{sid}}
    .comment-list(v-if="loading")
      .loading(v-if="loading")
        +skeleton
        +skeleton
        +skeleton

    .comment-list(v-else-if="comments.length === 0")
      .text-center.p-t-3.p-b-3 空空如也~
    .comment-list(v-else)
      .comment-item(v-for="comment in comments" :data-type="comment.type" :data-status="comment.status" :data-cid="comment._id" data-show-comments="false")
        .single-post-header(v-if="comment.status === 'faulty'")
          .reture 当前内容已被退回修改，请作者点击编辑按钮修改
          span 原因：{{comment.reason}}
        .single-post-header(v-if="comment.status === 'unknown' && !permissions.reviewed")
          .unknown
            span.m-r-05 内容待审核
        .single-post-header(v-if="comment.status === 'disabled'")
          .disabled
            span.m-r-05 内容已被屏蔽
            a(@click="unblock(comment)" v-if="permissions.disabled") 点击解封
        .single-post-header(v-if="comment.status === 'unknown' && permissions.reviewed")
          .review 内容待审核
            span= "送审原因："
            span {{comment.reason}}
            div
              | 通过请点击
              button.btn.btn-xs.btn-default(@click="passReview(comment)") 通过
              | &nbsp;  按钮，不通过请点击
              button.btn.btn-xs.btn-default(@click="disabledComment(comment._id)") 退修或删除
              | 按钮。
              a(href=`/review` target="_blank") 待审核列表
        .comment-item-header
          .comment-item-avatar(:data-float-uid="comment.user.uid")
            img(:src="comment.user.avatar")
          .comment-item-info
            .comment-item-username
              span(v-if="!comment.user.userHome") {{comment.user.username}}
              a(v-else :href="comment.user.userHome" :data-float-uid="comment.user.uid") {{comment.user.username}}
            .comment-item-time {{timeFormat(comment.toc)}}
          .comment-item-floor
            span {{comment.order}}楼
        .quote-post(v-if="comment.quote")
          .quote-position
            | 引用
            a(
              :href="comment.quote.userHome"
              target="_blank"
              :data-float-uid="comment.quote.uid"
            ) {{comment.quote.username}}
            | &nbsp;发表于&nbsp;
            span {{comment.quote.order}}
            | &nbsp楼的内容
          .quote-content {{comment.quote.content}}
        .comment-item-content(v-html="comment.content")
        comment-post-editor(:ref="`editorContainer_${comment._id}`" :cid="comment._id" @close-editor="closeCommentEditor")
        .comment-item-do
          .do-item(@click="quote(comment)")
            .fa.fa-comment-o
            span 引用
          .do-item.fa.fa-sliders(data-type="commentOption" :data-cid="comment._id" @click="openOptions($event, comment)")
    .comment-editor
      comment-editor(ref="commentEditor" :source="source" :sid="sid" :comment="selfComment")
</template>

<style lang="less" scoped>
  @import "../publicModules/base";
  .comment-header {
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f4f4f4;
  }
  .comment-item{
    min-height: 4rem;
    margin: 1rem 0;
    border-bottom: 1px #eee solid;
    padding: 0.5rem;
    &[data-show-comments='true']{
      background-color: #c3b7a7;
      .comment-item-content {
        display: none;
      }
    }
    &[data-type='stable'][data-status='unknown'] {
      background: #ffdcb2!important;
    }
    &[data-type='beta'][data-status='unknown'] {
      background: #ccc!important;
    }
    &[data-type='stable'][data-status='disabled'] {
      background: #bdbdbd!important;
    }
    &[data-type='stable'][data-status='faulty'] {
      background: #ffdbd5 !important;
    }
    .single-post-header{
      text-align: center;
      font-style: oblique;
      button{
        font-style: normal;
      }
      .return{
        color: red;
      }
      .review{
        color: red;
      }
      .disabled{
        cursor: pointer;
        color: #c70000;
      }
      .unknown {
        color: red;
      }
    }
    .comment-item-header{
      @height: 3rem;
      margin-bottom: 0.5rem;
      height: 3rem;
      padding-left: @height + 0.5rem;
      position: relative;
      .comment-item-avatar{
        cursor: pointer;
        position: absolute;
        border-radius: 50%;
        overflow: hidden;
        top: 0;
        left: 0;
        height: @height;
        width: @height;
        img{
          height: 100%;
          width: 100%;
        }
      }
      .comment-item-info{
        .comment-item-username{
          font-size: 1.3rem;
          height: 1.6rem;
          line-height: 1.6rem;
          .hideText(@line: 1);
          margin-bottom: 0.2rem;
        }
        .comment-item-time{
          font-size: 1rem;
          height: 1.3rem;
          line-height: 1.3rem;
          .hideText(@line: 1);
        }
      }
      .comment-item-floor {
        position: absolute;
        top: 0;
        font-size: 1rem;
        color: #ccc;
        right: 0;
        height: 3.2rem;
        line-height: 3.2rem;
        text-align: center;
        span {
          color: #ccc;
        }
      }
    }
    .quote-post {
      position: relative;
      font-size: 1rem;
      font-style: oblique;
      padding: 7px 10px;
      border-left-color: #ddd;
      background-color: #f8f8ee;
      margin: 10px 0px;
      border-left: 5px solid #eee;
      .quote-content {
        font-size: 1.2rem;
        font-style: normal;
      }
    }
    .comment-item-do {
      text-align: right;
      font-size: 1.2rem;
      .do-item {
        display: inline-block;
        margin-right: 0.5rem;
        cursor: pointer;
        .fa {
          margin-right: 0.2rem;
        }
      }
    }
  }
  .highlight {
    background: #ffdcb2;
  }
  .loading{
    @bgColor: #eee;
    @height: 1.2rem;
    .comment-item-avatar{
      background-color: @bgColor;
    }
    .comment-item-username{
      max-width: 6rem;
      height: @height;
      background-color: @bgColor;
    }
    .comment-item-time{
      max-width: 10rem;
      height: @height;
      background-color: @bgColor;
    }
    .comment-item-content div{
      height: @height;
      background-color: @bgColor;
      margin-bottom: 0.3rem;
      &:last-child{
        max-width: 60%;
      }
    }
    .skeleton{
      background-image: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
      width: 100%;
      height: 0.6rem;
      list-style: none;
      background-size: 400% 100%;
      background-position: 100% 50%;
      animation: skeleton-loading 1s ease infinite;
    }
    @keyframes skeleton-loading {
      0% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0 50%;
      }
    }
  }
</style>

<script>
  import CommentEditor from "./CommentEditor";
  import {nkcAPI} from "../lib/js/netAPI";
  import {getUrl, timeFormat} from "../lib/js/tools";
  import {replaceNKCRender} from "../lib/js/replaceNKCRender";
  import CommentOptions from "./CommentOptions";
  import CommentPostEditor from "../lib/vue/CommentPostEditor";
  import Complaint from "../lib/vue/Complaint";
  import DisabledComment from "../lib/vue/DisabledComment";
  import ViolationRecord from "../lib/vue/ViolationRecord";
  import {screenTopAlert} from "../lib/js/topAlert";
  import FloatUserPanel from "../lib/vue/FloatUserPanel";
  import Sticker from "../lib/vue/Sticker";
  import ImageViewer from "../lib/vue/ImageViewer";
  import SubscribeTypes from "../lib/vue/SubscribeTypes";
  // import {initNKCVideo} from "../lib/js/replaceNKCRender";
  export default {
    props: ['source', 'sid'],
    data: () => ({
      loading: true,
      comments: [],
      selfComment: '',
      ready: false,
      editors: {},
      permissions: {
        disabled: false,
        reviewed: false,
      },
    }),
    components: {
      "comment-editor": CommentEditor,
      "comment-post-editor": CommentPostEditor,
      "options": CommentOptions,
      complaint: Complaint,
      "disabled-comment": DisabledComment,
      "violation-record": ViolationRecord,
      "float-user-panel": FloatUserPanel,
      sticker: Sticker,
      "image-viewer": ImageViewer,
      "subscribe-types": SubscribeTypes
    },
    mounted() {
      this.getComments();
    },
    methods: {
      getUrl: getUrl,
      timeFormat: timeFormat,
      replaceNKCUrl: replaceNKCRender,
      initRender(){
        const self = this;
        $(document).ready(function(){
          // document 不写默认document
          self.$nextTick(() => {
            self.$refs.floatUserPanel.initPanel();
            self.$refs.sticker.init();
            self.replaceNKCUrl();
          });
        })
      },
      getComments() {
        const self = this;
        nkcAPI(`/comment?sid=${self.sid}`, 'GET', {})
        .then(res => {
          self.comments = res.comments;
          self.selfComment = res.comment;
          self.permissions = res.permissions;
          self.loading = false;
        })
        .then(() => {
          self.initRender();
        })
        .catch(err => {
          sweetError(err);
        })
      },
      quote(item) {
        if(item.status === 'faulty' || item.status === 'disabled') return sweetError('无法引用已被退修或禁用的评论');
        if(item.status === 'unknown') return sweetError('当前评论未审核');
        if(item.type !== 'stable') return sweetError('评论未发布');
        this.$refs.commentEditor.changeQuote(item);
      },
      //关闭评论编辑器
      hideCommentEditor(cid) {
      },
      //评论背景开关
      switchPostBackground(cid, show) {
        const dom = $(`.comment-item[data-cid="${cid}"]`);
        dom.attr('data-show-comments', show);
      },
      //关闭评论编辑器
      closeCommentEditor(id) {
        this.switchPostBackground(id, 'false');
      },
      //评论编辑器开关
      switchCommentEditor(cid) {
        this.$refs[`editorContainer_${cid}`][0].open(cid);
        //评论背景
        this.switchPostBackground(cid, 'true');
      },
      //投诉或举报
      complaint(cid) {
        this.$refs.complaint.open('comment', cid);
      },
      //退修或删除
      disabledComment(cid) {
        this.$refs.disabledComment.open(function (res){
        }, {
          cid
        })
      },
      //编辑评论
      editorComment(cid) {
        //获取档期那评论的内容填入编辑器中
        if(!cid) return;
        const self = this;
        self.switchCommentEditor(cid);
      },
      //通过审核
      passReview(comment) {
        const {docId: documentId, did} = comment;
        if(!documentId || !did) return;
        nkcAPI('/review' , 'PUT', {
          pass: true,
          documentId,
          did,
          type: 'document'
        })
        .then(res => {
          sweetSuccess('操作成功');
        })
        .catch(err => {
          sweetError(err);
        })
      },
      //打开多选菜单
      openOptions(e, comment) {
        const target = e.target || e.srcElement
        const direction = $(target).attr('data-direction') || 'up';
        const init = target.getAttribute('data-init');
        if(init === 'true') return;
        this.$refs.commentOptions.open({DOM: $(target), comment, direction});
        //阻止事件冒泡到父级
        e.stopPropagation();
      },
      //显示Ip信息
      displayIpInfo(ip) {
        if(!ip) return;
        nkcAPI(`/ipinfo?ip=${ip}`, 'GET')
          .then(function(res) {return res.ipInfo})
          .then(function(info){
            if(!info) return sweetError('获取ip信息失败！');
            return asyncSweetCustom("<p style='font-weight: normal;'>ip: "+ info.ip +"<br>位置: "+ info.location +"</p>");
          })
          .catch(err => {
            sweetError(err);
          })
      },
      //显示违规记录
      viewViolation(uid) {
        this.$refs.violationRecord.open({uid});
      },
      //解封
      unblock(value) {
        if(!value.docId) return;
        nkcAPI(`/comment/${value.docId}/unblock`, 'POST', {
          docsId: [value.docId]
        })
        .then(res => {
          screenTopAlert(value.docId+' 已解除屏蔽')
        })
        .catch(err => {
          sweetError(err);
        })
      },
      //打开关注分类
      openSubscribe(options) {
        const {uid, subscribed} = options;
        if(!uid) return;
        this.$refs.subscribeTypes.subscribeUser(uid, subscribed);
      }
    }
}
</script>

