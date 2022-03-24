<template lang="pug">
  .moment-commments
    .moment-comment-nav(v-if="postType === 'comment'")
      .post-type 评论列表
      .sort-item(
        v-for='n in nav'
        :class="{'active': n.type === sort}"
        @click="setActiveNav(n.type)"
        ) {{n.name}}
    .moment-comment-nav(v-else)
      .post-type 转发动态
    .moment-comment-list-container(v-if="postType === 'comment'")
      .moment-comment-null(v-if="commentsData.length === 0")
        span(v-if="loading") 加载中...
        span(v-else) 空空如也~
      paging(:pages="pageButtons" @click-button="clickPageButton")
      .moment-comment-list
        .moment-comment-item(
          v-for="commentData in commentsData"
          :class=`{'active': focusCommentId === commentData.momentCommentId, 'unknown': commentData.status === 'unknown', 'deleted': commentData.status === 'deleted'}`
          )
          moment-status(ref="momentStatus" :moment="commentData")
          .moment-comment-item-header
            a.moment-comment-avatar(:href="commentData.userHome" target="_blank")
              img(:src="commentData.avatarUrl")
              span {{commentData.username}}
            .moment-comment-time
              from-now(:time="commentData.toc")
            .moment-comment-options
              .moment-comment-option(@click="vote(commentData)" :class="{'active': commentData.voteType === 'up'}")
                .fa.fa-thumbs-o-up
                span(v-if="commentData.voteUp > 0") {{commentData.voteUp}}
              .moment-comment-option.fa.fa-ellipsis-h(@click.stop="openOption($event, commentData)" data-direction="up")

          .moment-comment-item-content(v-html="commentData.content")
      paging(:pages="pageButtons" @click-button="clickPageButton")

    moment-comment-editor(:mid="momentId" :type="postType" @published="onPublished")
</template>

<style lang="less" scoped>
  @import '../../../publicModules/base';
  .moment-comment-nav{
    margin-bottom: 2rem;
    .post-type{
      font-weight: 700;
      display: inline-block;
      margin-right: 1rem;
    }
    .sort-item{
      user-select: none;
      display: inline-block;
      cursor: pointer;
      margin-right: 0.5rem;
      &.active{
        color: @primary;
      }
    }
  }
  .moment-comment-list-container{
    margin-bottom: 2rem;
    .moment-comment-null{
      text-align: center;
    }
    .moment-comment-list{
      margin-bottom: 1rem;
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
            &:hover{
              opacity: 0.7;
            }
            &.active{
              color: @accent;
            }
            span{
              margin-left: 0.2rem;
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
            margin-right: 0.5rem;
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
    }
  }
</style>

<script>
  import MomentCommentEditor from './MomentCommentEditor';
  import {sweetError} from "../../js/sweetAlert";
  import Paging from '../Paging';
  import FromNow from '../FromNow';
  import {momentVote} from "../../js/zone/vote";
  import {visitUrl} from "../../js/pageSwitch";
  import MomentStatus from "./MomentStatus";

  export default {
    props: ['mid', 'type', 'focus'],
    components: {
      'paging': Paging,
      'from-now': FromNow,
      'moment-comment-editor': MomentCommentEditor,
      'moment-status': MomentStatus
    },
    data: () => ({
      commentsData: [],
      paging: null,
      sort: null,
      loading: true,
      focusedComment: false,
      nav: [
        {
          type: 'hot',
          name: '按热度',
        },
        {
          type: 'time',
          name: '按时间',
        }
      ]
    }),
    computed: {
      focusCommentId() {
        return this.focus;
      },
      postType() {
        return this.type;
      },
      momentId() {
        return this.mid;
      },
      pageButtons() {
        return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
      },

    },
    methods: {
      init() {
        if(this.postType === 'comment') {
          this.setActiveNav(this.nav[0].type);
        }
      },
      setActiveNav(type) {
        this.sort = type;
        this.getComments();
      },
      getComments(page = 0) {
        const self = this;
        const {
          postType,
          momentId,
          focusCommentId,
          focusedComment
        } = this;
        if(postType !== 'comment') return;
        let focus = '';
        if(!focusedComment) {
          this.focusedComment = true;
          if(focusCommentId) {
            this.setActiveNav(this.nav[1].type);
            focus = focusCommentId;
          }
        }
        const url = `/zone/m/${momentId}/comments?sort=${this.sort}&page=${page}&focus=${focus}`;
        nkcAPI(url, 'GET')
          .then(res => {
            self.commentsData = res.commentsData;
            self.paging = res.paging;
            self.loading = false;
          })
          .catch(sweetError)
      },
      clickPageButton(page) {
        this.getComments(page);
      },
      onPublished(res) {
        const {momentCommentPage} = res;
        const {postType} = this;
        if(postType === 'comment') {
          this.getComments(momentCommentPage);
          this.$emit('post-comment');
        } else {
          visitUrl(`/g/moment`);
        }
      },
      vote(commentData) {
        const voteType = 'up';
        const cancel = voteType === commentData.voteType;
        momentVote(commentData.momentCommentId, voteType, cancel)
          .then(res => {
            const {voteUp} = res;
            commentData.voteUp = voteUp;
            commentData.voteType = cancel? '': voteType;
          })
          .catch(sweetError)
      },
      //打开其他操作
      openOption(e, moment) {
        const target = e.target;
        const direction = $(target).attr('data-direction') || 'up';
        const init = $(target).attr('data-init');
        if(init === 'true') return;
        this.$emit('open-comment-option', {DOM: $(target), moment, direction});
        //阻止浏览器默认事件
        e.stopPropagation();
      }
    },
  }
</script>
