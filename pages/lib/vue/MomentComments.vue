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
      paging(:pages="pageButtons" @click-button="clickPageButton")
      .moment-comment-list
        .moment-comment-item(v-for="commentData in commentsData")
          .moment-comment-item-header
            a.moment-comment-avatar(:href="commentData.userHome" target="_blank")
              img(:src="commentData.avatarUrl")
              span {{commentData.username}}
            .moment-comment-time
              from-now(:time="commentData.toc")
            .moment-comment-options
              .moment-comment-option
                .fa.fa-thumbs-o-up
              .moment-comment-option
                .fa.fa-ellipsis-h
          .moment-comment-item-content(v-html="commentData.content")
      paging(:pages="pageButtons" @click-button="clickPageButton")

    moment-comment-editor(:mid="momentId" :type="postType" @published="onPublished")
</template>

<style lang="less" scoped>
  @import '../../publicModules/base';
  .moment-comment-nav{
    margin-bottom: 2rem;
    .post-type{
      font-weight: 700;
      display: inline-block;
      margin-right: 1rem;
    }
    .sort-item{
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
    .moment-comment-list{
      margin-bottom: 1rem;
      .moment-comment-item{
        &:hover{
          background-color: #eee;
        }
        padding: 0.5rem 0;
        margin-bottom: 0rem;
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
          width: 2 * @height;
          .moment-comment-option{
            display: inline-block;
            height: @height;
            line-height: @height;
            text-align: center;
            width: @height;
            cursor: pointer;
            &:hover{
              opacity: 0.7;
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
  import {sweetError} from "../js/sweetAlert";
  import Paging from '../vue/Paging';
  import FromNow from '../vue/FromNow';
  export default {
    props: ['mid', 'type'],
    components: {
      'paging': Paging,
      'from-now': FromNow,
      'moment-comment-editor': MomentCommentEditor,
    },
    data: () => ({
      commentsData: [],
      paging: null,
      sort: null,
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
        const {sort, postType, momentId} = this;
        if(postType !== 'comment') return;
        nkcAPI(`/moment/${momentId}/comments?sort=${sort}&page=${page}`, 'GET')
          .then(res => {
            self.commentsData = res.commentsData;
            self.paging = res.paging;
          })
          .catch(sweetError)
      },
      clickPageButton(page) {
        this.getComments(page);
      },
      onPublished(res) {
        const {momentCommentPage} = res;
        this.getComments(momentCommentPage);
      }
    },
    computed: {
      postType() {
        return this.type;
      },
      momentId() {
        return this.mid;
      },
      pageButtons() {
        return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
      }
    }
  }
</script>
