<template lang="pug">
  .comment-comment-editor(ref="container")
    .comment-comment-header(ref="header")
      .comment-comment-title {{title}}
      .comment-comment-button(@click="close")
        .fa.fa-remove
    .comment-comment-body
      .user-container
        img.user-avatar(:src="comment.avatarUrl")
        a.user-name(:href="comment.userHome") {{comment.username}}
        .user-time {{comment.time}}
      .comment-content(v-html="comment.content")
      .editor-container
        textarea-editor(
          ref='textareaEditor'
          placeholder="发表你的回复"
          max-height="20rem"
          @content-change="onContentChange"
          )
      .editor-button.text-right
        button.btn.btn-default.btn-sm.m-r-05(@click="close") 取消
        button.btn.btn-primary.btn-sm(@click="submit") 提交

</template>

<script>
import {DraggableElement} from "../../js/draggable";
import TextareaEditor from '../TextareaEditor';
import {nkcAPI} from "../../js/netAPI";

export default {
  components: {
    'textarea-editor': TextareaEditor
  },
  data: () => {
    return {
      draggableElement: null,
      comment: {
        uid: '',
        avatarUrl: '',
        username: '',
        userHome: '',
        time: '',
        content: '',
        momentCommentId:  '',
      },
      content: '',
    }
  },

  computed: {
    title() {
      return '回复'
    }
  },

  mounted() {
    this.initDragElement();
  },

  methods: {
    open(comment) {
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
    submit() {
      const {content, comment} = this;
      return Promise.resolve()
        .then(() => {
          if(!content) throw new Error('请输入评论内容');
          return nkcAPI(`/creation/zone/moment/${comment.momentCommentId}/comment`, 'POST', {
            content
          });
        })
        .then(() => {
          sweetSuccess('提交成功');
          this.$emit('submit');
          this.hide();
        })
        .catch(sweetError)
    }
  }
}
</script>

<style scoped lang="less">
.comment-comment-editor{
  width: 30rem;
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
    padding: 1rem;
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
}
</style>
