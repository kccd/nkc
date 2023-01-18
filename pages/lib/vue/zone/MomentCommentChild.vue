<template lang="pug">
  .comment-comment-editor(ref="container")
    .comment-comment-header
      .comment-comment-title(ref="header") {{title}}
      .comment-comment-button(@click="close")
        .fa.fa-remove
    .comment-comment-body
      .mask(v-if="replyCommentId")
      .text-center.p-t-3.p-b-3(v-if="!commentData") 加载中...

      .content-container(v-else)
        .comment-container
          moment-comment(
            :comment="commentData"
            type="comment"
            :focus="focusCommentId === commentData._id"
            :permissions="permissions || {}"
            @to-reply-comment="replyComment"
          )
        .comment-header
          .post-type 评论列表
          .sort-item(
            v-for='n in nav'
            :class="{'active': n.type === sort}"
            @click="setActiveNav(n.type)"
          ) {{n.name}}
        .p-t-3.p-b-3.text-center(v-if="commentsData.length === 0") 空空如也~
        .comments-container.m-b-1(v-else)
          paging(:pages="pages" @click-button="selectPage")
          moment-comment(
            v-for="commentChildData in commentsData"
            :key="commentChildData._id"
            :comment="commentChildData"
            type="comment"
            :focus="focusCommentId === commentChildData._id"
            :permissions="permissions || {}"
            @to-reply-comment="replyComment"
          )
          paging.m-t-05(:pages="pages" @click-button="selectPage")
      .editor-container(v-if="replyCommentId && logged")
        textarea-editor(
          ref='textareaEditor'
          :placeholder="'回复 ' + replyUsername"
          max-height="20rem"
          @content-change="onContentChange"
        )
        .editor-button.text-right
          button.btn.btn-default.btn-sm.m-r-05(@click="closeEditor") 取消
          button.btn.btn-primary.btn-sm(@click="submit") 提交

</template>

<script>
import {DraggableElement} from "../../js/draggable";
import TextareaEditor from '../TextareaEditor';
import {nkcAPI} from "../../js/netAPI";
import Paging from '../../vue/Paging';
import MomentComment from './MomentComment'
import {getState} from "../../js/state";
const state = getState();

export default {
  components: {
    'textarea-editor': TextareaEditor,
    'moment-comment': MomentComment,
    'paging': Paging,
  },
  data: () => {
    return {

      logged: !!state.uid,
      momentId: '',
      commentId: '',
      replyCommentId: '',
      focusCommentId: '',
      pages: [],

      permissions: {},

      sort: 'time',

      commentData: null,
      commentsData: [],

      draggableElement: null,
      content: '',

      nav: [
        {
          type: 'time',
          name: '按时间',
        },
        {
          type: 'hot',
          name: '按热度',
        }
      ]
    }
  },

  computed: {
    title() {
      return '评论详情'
    },
    replyUsername() {
      const {replyCommentId, commentData, commentsData} = this;
      if(!replyCommentId || !commentData) return '';
      const arr = [commentData, ...commentsData];
      let name = '';
      for(const comment of arr) {
        if(comment._id === replyCommentId) {
          name = comment.username;
          break;
        }
      }
      return name;
    }
  },

  mounted() {
    this.initDragElement();
  },

  methods: {
    setActiveNav(type) {
      this.sort = type;
      this.getComments();
    },
    replyComment(comment) {
      this.replyCommentId = comment._id;
    },
    closeEditor() {
      this.replyCommentId = '';
    },
    open(props) {
      const {
        // 一级评论ID
        commentId = '',
        // 需要回复的评论ID
        replyCommentId = '',
        // 高亮ID
        focusCommentId = '',
      } = props;

      this.commentId = commentId;
      this.focusCommentId = focusCommentId;
      this._focusCommentId = focusCommentId;
      this.replyCommentId = replyCommentId;

      // 回复某一条评论
      if(replyCommentId) {

      }

      // 加载评论列表

      this.show();

      this.getComments();

    },

    getComments(page = 0) {
      const {commentId, sort, _focusCommentId} = this;
      const self = this;
      return Promise.resolve()
        .then(() => {
          return nkcAPI(`/zone/m/${commentId}/comments/child?page=${page}&sort=${sort}&focus=${_focusCommentId}`, 'GET')
        })
        .then(res => {
          const {commentData, commentsData, paging, permissions} = res;
          self.commentData = commentData;
          self.commentsData = commentsData;
          self.pages = paging.buttonValue;
          self.permissions = permissions;
          self.clearFocus();
        })
        .catch(sweetError)
    },

    clearFocus() {
      this._focusCommentId = '';
    },

    openOld(comment) {
      const {
        uid,
        avatarUrl,
        username,
        userHome,
        time,
        content,
        momentCommentId
      } = comment;

      if(this.comment.momentCommentId !== momentCommentId) {
        this.clearContent();
      }

      this.show();
      this.comment.uid = uid;
      this.comment.avatarUrl = avatarUrl;
      this.comment.username = username;
      this.comment.userHome = userHome;
      this.comment.time = time;
      this.comment.content = content;
      this.comment.momentCommentId = momentCommentId;
    },
    clearContent() {
      this.$refs.textareaEditor.setContent('');
    },
    show() {
      this.draggableElement.show();
      setTimeout(() => {
        this.draggableElement.setPositionCenter();
      })

    },
    close() {
      this.draggableElement.hide();
    },
    initDragElement() {
      this.draggableElement = new DraggableElement(
        this.$refs.container,
        this.$refs.header,
      );
      this.draggableElement.setPositionCenter();
    },
    destroyDragElement() {
      if(this.draggableElement && this.draggableElement.destroy) {
        this.draggableElement.destroy();
      }
    },
    onContentChange(content) {
      this.content = content;
    },
    selectPage(page) {
      this.getComments(page)
    },
    submit() {
      const {content, replyCommentId} = this;
      const self = this;
      return Promise.resolve()
        .then(() => {
          if(!content) throw new Error('请输入评论内容');
          return nkcAPI(`/creation/zone/moment/${replyCommentId}/comment`, 'POST', {
            content
          });
        })
        .then((res) => {
          sweetSuccess('提交成功');
          self.setActiveNav(self.nav[0].type);
          self.focusCommentId = res.commentId;
          self._focusCommentId = res.commentId;
          self.closeEditor();
          self.getComments();
          // self.$emit('submit');
          // self.close();
        })
        .catch(sweetError)
    }
  }
}
</script>

<style scoped lang="less">
@import '../../../publicModules/base';
.comment-comment-editor{
  width: 40rem;
  display: none;
  position: fixed;
  background-color: #fff;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #f0f0f0;
  .comment-comment-header{
    cursor: move;
    @buttonSize: 3rem;
    height: @buttonSize;
    line-height: @buttonSize;
    background-color: #dadada;
    padding-left: 1rem;
    position: relative;
    padding-right: @buttonSize;
    .comment-comment-button{
      height: @buttonSize;
      width: @buttonSize;
      line-height: @buttonSize;
      text-align: center;
      position: absolute;
      top: 0;
      right: 0;
      cursor: pointer;
      &:hover{
        background-color: red;
        color: #fff;
      }
    }
  }
  .comment-comment-body{
    position: relative;
    .user-container{
      margin-bottom: 0.2rem;
    }
    .user-avatar{
      height: 2rem;
      width: 2rem;
      border-radius: 50%;
      margin-right: 0.5rem;
    }
    .user-name, .user-time{
      font-size: 1.2rem;
      display: inline-block;
      margin-right: 0.5rem;
    }
    .comment-content{
      word-break: keep-all;
      word-wrap: break-word;
      white-space: pre-wrap;
      margin-bottom: 0.5rem;
      img{
        height: 1.5rem;
        width: 1.5rem;
        margin: 0 0.1rem;
        vertical-align: text-bottom;
      }
    }
  }
  .comment-container{
    margin-bottom: 1rem;
  }
  .comments-container{
    //padding-left: 2rem;
    //border-left: 1px solid #cbcbcb;
  }
  .editor-container{
    padding: 1rem;
    border-radius: 10px 10px 0 0;
    position: absolute;
    background-color: #fff;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 200;
  }
  .mask{
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
  }
  .content-container{
    max-height: 40rem;
    min-height: 30rem;
    overflow-y: auto;
    padding: 1rem;
  }
  .comment-header{
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
}
</style>
