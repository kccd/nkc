<template lang="pug">
  .moment-comment-editor 动态评论编辑器
    .moment-comment-editor-container
      .moment-comment-textaea-ditor-container
        textarea-editor(
          ref="textareaEditor"
          :placeholder="placeholder"
          height="2rem"
          @content-change="onContentChange")
      .moment-comment-editor-button
        button.btn.btn-default.btn-sm 提交
</template>

<style lang="less" scoped>
  .moment-comment-editor{
    @buttonContainerWidth: 4rem;
    @buttonContainerHeight: 3rem;
    .moment-comment-editor-container{
      position: relative;
      padding-right: @buttonContainerWidth;
      min-height: @buttonContainerHeight;
      .moment-comment-editor-button{
        position: absolute;
        height: 100%;
        top: 0;
        right: 0;
        button{
          height: 100%;
          width: 100%;
        }
      }
    }
  }
</style>

<script>
  import TextareaEditor from './TextareaEditor';
  import {sweetError} from '../js/sweetAlert';
  export default {
    props: ['mid'],
    components: {
      'textarea-editor': TextareaEditor
    },
    data: () => ({
      placeholder: '发表你的评论',
      content: '',
    }),
    computed: {
      momentId() {
        return this.mid;
      }
    },
    methods: {
      getMomentComment() {
        const {momentId} = this;
        const self = this;
        nkcAPI(`/creation/zone/moment?from=editor&mid=${momentId}`, 'GET')
          .then(res => {
            const {content, momentId} = res;
            if(!momentId) return;
            self.content = content;
            self.syncTextareaEditorContent();
          })
          .catch(sweetError)
      },
      syncTextareaEditorContent() {
        this.$refs.textareaEditor.setContent(this.content);
      },
      onContentChange(content) {
        this.content = content;
      },
    }
  }
</script>