<template lang="pug">
  .moment-commments.p-t-1
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
          :focus="focusCommentId === commentData.momentCommentId"
          :permissions="permissions"
        )
        //.moment-comment-item(
        //  v-for="(commentData, index) in listData"
        //  :class=`{'active': postType === 'comment' && focusCommentId === commentData.momentCommentId, 'unknown': commentData.status === 'unknown', 'deleted': commentData.status === 'deleted'}`
        //  )
        //  moment-status(ref="momentStatus" :moment="commentData" :permissions="permissions")
        //  .moment-comment-item-header
        //    a.moment-comment-avatar(:href="commentData.userHome" target="_blank")
        //      img(
        //        :src="commentData.avatarUrl"
        //        data-global-mouseover="showUserPanel"
        //        data-global-mouseout="hideUserPanel"
        //        :data-global-data="objToStr({uid: commentData.uid})"
        //        )
        //      span(
        //        data-global-mouseover="showUserPanel"
        //        data-global-mouseout="hideUserPanel"
        //        :data-global-data="objToStr({uid: commentData.uid})"
        //      ) {{commentData.username}}
        //    .moment-comment-time
        //      from-now(:time="commentData.toc")
        //    .moment-comment-options
        //      .moment-comment-option(title="回复" @click="replyComment(commentData)")
        //        .fa.fa-comment-o
        //      .moment-comment-option(@click="vote(commentData)" :class="{'active': commentData.voteType === 'up'}" title="点赞")
        //        .fa.fa-thumbs-o-up
        //        span(v-if="commentData.voteUp > 0") {{commentData.voteUp}}
        //      //-.moment-comment-options
        //        .fa.fa-comment-o
        //      .moment-comment-option.fa.fa-ellipsis-h(@click="openOption($event, commentData, index)" data-direction="up")
        //        moment-option(
        //          :ref="`momentOption_${index}`"
        //          @complaint="complaint"
        //        )
        //  .moment-comment-item-content(v-html="commentData.content" v-if="postType === 'comment'")
        //  .moment-comment-item-content.pointer(v-html="commentData.content" v-else @click="visitUrl(commentData.url, true)")
        //  .moment-comment-comments(v-if="commentData.comments && commentData.comments.length > 0")
        //    span 下级评论

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
  import {visitUrl} from "../../js/pageSwitch";
  import {objToStr} from "../../js/tools";
  import Paging from '../Paging';
  import FromNow from '../FromNow';
  import MomentCommentEditor from './MomentCommentEditor';
  import MomentStatus from "./MomentStatus";
  import MomentOptionFixed from "./momentOption/MomentOptionFixed";
  import {getState} from "../../js/state";
  import {toLogin} from "../../js/account";
  import MomentComment from "./MomentComment";
  import MomentCommentChildrenEditor from './MomentCommentChildEditor';
  const {uid} = getState();

  export default {
    props: ['mid', 'type', 'focus', 'permissions'],
    components: {
      'paging': Paging,
      'from-now': FromNow,
      'moment-comment-editor': MomentCommentEditor,
      'moment-status': MomentStatus,
      'moment-option': MomentOptionFixed,
      'moment-comment-child-editor': MomentCommentChildrenEditor,
      'moment-comment': MomentComment
    },
    data: () => ({
      logged: !!uid,
      commentsData: [],
      repostData: [],
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
      listData() {
        const {postType, commentsData, repostData} = this;
        if(postType === 'comment') {
          return commentsData;
        } else {
          return repostData;
        }
      }
    },
    methods: {
      visitUrl,
      objToStr: objToStr,
      init() {
        this.setActiveNav(this.nav[0].type);
        /*if(this.postType === 'comment') {
          this.setActiveNav(this.nav[0].type);
        }*/
      },
      setActiveNav(type) {
        this.sort = type;
        this.getList();
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
      getRepost(page = 0) {
        const self = this;
        const {
          momentId
        } = this;
        const url = `/zone/m/${momentId}/repost?page=${page}`;
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
        const {momentCommentPage} = res;
        const {postType} = this;
        if(postType === 'comment') {
          this.getList(momentCommentPage);
          this.$emit('post-comment');
        } else {
          visitUrl(`/g/moment`);
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
      }
    },
  }
</script>
