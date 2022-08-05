<template lang="pug">
  div
    moment-comment-child-editor(ref="momentCommentChildEditor")
    .moment-comment-item(
      :class=`{'active': !!focus, 'unknown': commentData.status === 'unknown', 'deleted': commentData.status === 'deleted'}`
    )
      moment-status(ref="momentStatus" :moment="commentData" :permissions="permissions")
      .moment-comment-item-header
        a.moment-comment-avatar(:href="commentData.userHome" target="_blank")
          img(
            :src="commentData.avatarUrl"
            data-global-mouseover="showUserPanel"
            data-global-mouseout="hideUserPanel"
            :data-global-data="objToStr({uid: commentData.uid})"
          )
          span(
            data-global-mouseover="showUserPanel"
            data-global-mouseout="hideUserPanel"
            :data-global-data="objToStr({uid: commentData.uid})"
          ) {{commentData.username}}

        span(v-if="commentData.parentData")
          .moment-comment-time.m-r-05 回复
          a.moment-comment-avatar(:href="commentData.userHome" target="_blank")
            span(
              data-global-mouseover="showUserPanel"
              data-global-mouseout="hideUserPanel"
              :data-global-data="objToStr({uid: commentData.uid})"
            ) {{commentData.username}}

        .moment-comment-time
          from-now(:time="commentData.toc")

        .moment-comment-options
          .moment-comment-option(title="回复" @click="replyComment(commentData)")
            .fa.fa-comment-o
          .moment-comment-option(@click="vote(commentData)" :class="{'active': commentData.voteType === 'up'}" title="点赞")
            .fa.fa-thumbs-o-up
            span(v-if="commentData.voteUp > 0") {{commentData.voteUp}}
          //-.moment-comment-options
            .fa.fa-comment-o
          .moment-comment-option.fa.fa-ellipsis-h(@click="openOption($event, commentData)" data-direction="up")
            moment-option(
              :ref="`momentOption_${commentData._id}`"
              @complaint="complaint"
            )
      .moment-comment-item-content(v-html="commentData.content" v-if="type === 'comment'")
      .moment-comment-item-content.pointer(v-html="commentData.content" v-else @click="visitUrl(commentData.url, true)")
    .moment-comment-comments(v-if="commentData.commentsData && commentData.commentsData.length > 0")
      moment-comment(
        v-for="_comment in commentData.commentsData"
        :comment="_comment"
        :focus="false"
        :type="type"
        :permissions="permissions"
        :key="_comment._id"
      )
      .more-comment(v-if="commentData.commentCount > 2") 查看更多
</template>

<script>
import MomentStatus from "./MomentStatus";
import MomentOptionFixed from "./momentOption/MomentOptionFixed";
import MomentCommentChildrenEditor from './MomentCommentChildEditor';
import FromNow from '../FromNow';
import {toLogin} from "../../js/account";
import {momentVote} from "../../js/zone/vote";
import {visitUrl} from "../../js/pageSwitch";
import {sweetError} from "../../js/sweetAlert";
import {getState} from "../../js/state";
import {objToStr} from "../../js/tools";
const state = getState();
export default {
  name: 'moment-comment',
  props: {
    comment: {
      type: Object,
      required: true
    },
    permissions: {
      type: Object,
      required: true
    },
    focus: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      required: true
    }
  },
  components: {
    'moment-status': MomentStatus,
    'moment-option': MomentOptionFixed,
    'from-now': FromNow,
    'moment-comment-child-editor': MomentCommentChildrenEditor,
  },
  data: () => ({
    logged: !!state.uid,
  }),
  computed: {
    commentData() {
      return this.comment;
    }
  },
  methods: {
    objToStr,
    visitUrl,
    //投诉或举报
    complaint(mid) {
      this.$emit('complaint', mid);
    },
    replyComment(comment) {
      if(!this.logged) return toLogin();
      this.$refs.momentCommentChildEditor.open({
        uid: comment.uid,
        time: comment.time,
        avatarUrl: comment.avatarUrl,
        username: comment.username,
        userHome: comment.userHome,
        momentCommentId: comment.momentCommentId,
        content: comment.content,
      });
    },
    vote(commentData) {
      if(!this.logged) return toLogin();
      const voteType = 'up';
      const cancel = voteType === commentData.voteType;
      const momentId = this.type === 'comment'? commentData.momentCommentId: commentData.momentId;
      momentVote(momentId, voteType, cancel)
        .then(res => {
          const {voteUp} = res;
          commentData.voteUp = voteUp;
          commentData.voteType = cancel? '': voteType;
        })
        .catch(sweetError)
    },
    openOption(e, moment) {
      const self = this;
      const target = e.target;
      const name = `momentOption_${moment._id}`;
      console.log(self.$refs[name], self.$refs[name].length)
      self.$refs[name].open({DOM: $(target), moment});
      e.stopPropagation();
    },
  }
}
</script>


<style lang="less" scoped>
@import '../../../publicModules/base';
.moment-comment-item{
  &:hover{
    background-color: #f4f4f4;
  }
  &.active{
    background-color: #ffebcf;
    padding: 0.5rem;
  }
  &.unknown {
    background: #ffd598;
  }
  &.deleted {
    background: #bdbdbd;
  }
  padding: 0.5rem 0;
  margin-bottom: 0;
  .moment-comment-item-header{
    margin-bottom: 0.5rem;
    position: relative;
  }
  .moment-comment-options{
    @height: 2rem;
    position: absolute;
    top: 0;
    right: 0;
    height: @height;
    .moment-comment-option{
      display: inline-block;
      height: @height;
      line-height: @height;
      text-align: center;
      cursor: pointer;
      padding: 0 0.2rem;
      margin-left: 0.5rem;
      &.active{
        color: @accent;
      }
      span{
        margin-left: 0.2rem;
      }
      #modulePostOptions{

      }
    }
  }
  .moment-comment-time{
    display: inline-block;
    font-size: 1rem;
    color: #555;
  }
  .moment-comment-avatar{
    margin-right: 0.5rem;
    span{
      display: inline-block;
      //margin-right: 0.5rem;
      font-size: 1.25rem;
      color: @primary;
    }
    img{
      margin-right: 0.5rem;
      height: 2rem;
      width: 2rem;
      border-radius: 50%;
      vertical-align: middle;
    }
  }
  .moment-comment-item-content {
    //margin-bottom: 0.5rem;
    word-break: keep-all;
    word-wrap: break-word;
    white-space: pre-wrap;
    /deep/img{
      height: 1.5rem;
      width: 1.5rem;
      margin: 0 0.1rem;
      vertical-align: text-bottom;
    }
    /deep/a{
      color: @primary;
    }
  }
}
.moment-comment-comments{
  padding-left: 2rem;
  border-left: 1px solid #cbcbcb;
  margin-bottom: 1rem;
  .more-comment{
    display: inline-block;
    height: 2rem;
    line-height: 2rem;
    padding: 0 1rem;
    border: 1rem;
    border-radius: 1rem;
    color: #fff;
    background-color: @darkGray;
    margin-top: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    &:hover{
      opacity: 0.7;
    }
  }
}
</style>
