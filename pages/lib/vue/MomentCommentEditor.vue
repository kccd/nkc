<template lang="pug">
  .moment-comment-editor 动态评论编辑器
    .moment-comment-editor-container
      .moment-comment-textaea-ditor-container
        textarea-editor(:placeholder="placeholder" height="2rem")
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
  import TextareaEditor from './TextareaEditor'
  export default {
    components: {
      'textarea-editor': TextareaEditor
    },
    data: () => ({
      placeholder: '发表你的评论',
    })
  }
</script>