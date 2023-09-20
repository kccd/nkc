<template lang="pug">
  .moment-commments.p-t-1
    moment-comment-child-editor(ref="momentCommentChildEditor")
    .m-b-1
      moment-comment-editor(:mid="momentId" :type="postType" @published="onPublished" v-if="logged")
    .moment-comment-nav(v-if="postType === 'comment'")
      .post-type 评论列表
      .sort-item(
        v-for='n in nav'
        :class="{'active': n.type === sort}"
        @click="setActiveNav(n.type)"
        ) {{n.name}}
    .moment-comment-nav(v-else)
      .post-type 转发列表
    .moment-comment-list-container
      .moment-comment-null.m-b-2(v-if="listData.length === 0")
        span(v-if="loading") 加载中...
        span(v-else) 空空如也~
      paging(:pages="pageButtons" @click-button="clickPageButton")
      .moment-comment-list
        moment-comment(
          v-for="(commentData, index) in listData"
          :key="commentData._id"
          :comment="commentData"
          :type="postType"
          :focus="focusCommentId"
          :permissions="permissions"
          @visit-comment-child="visitCommentChild"
          @on-reply-comment="onReplyComment"
          :mode="mode"
        )
      paging(:pages="pageButtons" @click-button="clickPageButton")
</template>

<style lang="less" scoped>
  @import '../../../publicModules/base';
  .moment-comment-nav{
    margin-bottom: 1rem;
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
    margin-bottom: 1rem;
    .moment-comment-null{
      text-align: center;
    }
    .moment-comment-list{
      margin-bottom: 1rem;

    }
  }
</style>

<script>
  import {sweetError} from "../../js/sweetAlert";
  import {momentVote} from "../../js/zone/vote";
  import {scrollPageToElement, visitUrl} from "../../js/pageSwitch";
  import {objToStr} from "../../js/tools";
  import Paging from '../Paging';
  import FromNow from '../FromNow';
  import MomentCommentEditor from './MomentCommentEditor';
  import MomentStatus from "./MomentStatus";
  import {getState} from "../../js/state";
  import {toLogin} from "../../js/account";
  import MomentComment from "./MomentComment";
  import MomentCommentChildrenEditor from './MomentCommentChild';
  const {uid} = getState();

  export default {
    // mode: simple, complete,
    props: ['mid', 'type', 'focus', 'permissions', 'mode'],
    components: {
      'paging': Paging,
      'from-now': FromNow,
      'moment-comment-editor': MomentCommentEditor,
      'moment-status': MomentStatus,
      'moment-comment-child-editor': MomentCommentChildrenEditor,
      'moment-comment': MomentComment
    },
    data: () => ({
      logged: !!uid,
      commentsData: [],
      repostData: [],
      paging: null,
      sort: 'time',
      loading: true,
      focusCommentId: '',
      loadFocusComment: false,
      nav: [
        {
          type: 'time',
          name: '按时间',
        },
        {
          type: 'hot',
          name: '按热度',
        }
      ],
      timer: null,
      timerCounter: 0,
    }),
    mounted() {
      this.setFocusCommentId(this.focus);
      this.setTimerToScrollPage();
    },
    computed: {
      listMode() {
        return this.mode || 'simple'
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
      listData() {
        const {postType, commentsData, repostData} = this;
        if(postType === 'comment') {
          return commentsData;
        } else {
          return repostData;
        }
      }
    },
    destroyed() {
      this.clearTimer();
    },
    methods: {
      visitUrl,
      objToStr: objToStr,
      clearTimer() {
        clearTimeout(this.timer);
      },
      setFocusCommentId(commentId) {
        this.loadFocusComment = false;
        this.focusCommentId = commentId;
      },
      setTimerToScrollPage() {
        const self = this;
        const {focusCommentId, timerCounter} = this;
        if(!focusCommentId || timerCounter >= 5) {
          return this.timerCounter = 0;
        }
        this.clearTimer();
        this.timer = setTimeout(() => {
          const element = $(`[data-id="${focusCommentId}"]`);
          if(element.length) {
            this.timerCounter = 0;
            scrollPageToElement(element);
          } else {
            this.timerCounter ++;
            self.setTimerToScrollPage();
          }
        }, 1000);

      },
      init() {
        this.setActiveNav(this.nav[0].type);
      },
      setSort(type) {
        this.sort = type;
      },
      setActiveNav(type) {
        this.setSort(type);
        this.getList();
      },
      getComments(page = 0) {
        const self = this;
        const {
          postType,
          momentId,
          focusCommentId,
          loadFocusComment,
          listMode,
        } = this;
        if(postType !== 'comment') return;
        let focus = '';
        if(focusCommentId && !loadFocusComment) {
          this.setSort(this.nav[0].type);
          focus = focusCommentId;
        }
        const url = `/z/m/${momentId}/comments?sort=${this.sort}&page=${page}&focus=${focus}&mode=${listMode}`;
        nkcAPI(url, 'GET')
          .then(res => {
            self.commentsData = res.commentsData;
            self.paging = res.paging;
            self.loading = false;
            self.loadFocusComment = true;
          })
          .catch(sweetError)
      },
      getRepost(page = 0) {
        const self = this;
        const {
          momentId
        } = this;
        const url = `/z/m/${momentId}/repost?page=${page}`;
        nkcAPI(url, 'GET')
          .then(res => {
            self.repostData = res.repostData;
            self.paging = res.paging;
            self.loading = false;
          })
          .catch(sweetError)
      },
      getList(page = 0) {
        const {postType} = this;
        if(postType === 'comment') {
          this.getComments(page);
        } else {
          this.getRepost(page);
        }
      },
      clickPageButton(page) {
        this.getList(page);
      },
      onPublished(res) {
        const {momentCommentId} = res;
        const {postType} = this;
        if(postType === 'comment') {
          this.setFocusCommentId(momentCommentId);
          this.setActiveNav(this.nav[0].type);
          this.$emit('post-comment');
          this.setTimerToScrollPage();
        } else {
          // visitUrl(`/g/moment`);
          // visitUrl(`/z`);
          this.refresh();
        }
      },
      vote(commentData) {
        if(!this.logged) return toLogin();
        const voteType = 'up';
        const cancel = voteType === commentData.voteType;
        const momentId = this.postType === 'comment'? commentData.momentCommentId: commentData.momentId;
        momentVote(momentId, voteType, cancel)
          .then(res => {
            const {voteUp} = res;
            commentData.voteUp = voteUp;
            commentData.voteType = cancel? '': voteType;
          })
          .catch(sweetError)
      },
      //打开其他操作
      openOption(e, moment, index) {
        const self = this;
        const target = e.target;
        const name = `momentOption_${index}`;
        self.$refs[name][0].open({DOM: $(target), moment});
        e.stopPropagation();
      },
      //投诉或举报
      complaint(mid) {
        this.$emit('complaint', mid);
      },
      visitCommentChild(comment) {
        this.$refs.momentCommentChildEditor.open({
          commentId: comment._id,
        });
      },
      replyComment(comment) {
        this.$refs.momentCommentChildEditor.open({
          commentId: comment.parentsId[1] || comment._id,
          replyCommentId: comment._id,
        });
      },
      onReplyComment(commentId) {
        this.setFocusCommentId(commentId);
        this.setActiveNav(this.nav[0].type);
        this.setTimerToScrollPage();
      },
      refresh(){
        visitUrl(`${window.location.pathname}${window.location.search}`);
      }
    },
  }
</script>
