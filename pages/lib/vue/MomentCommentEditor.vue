<template lang="pug">
  .moment-comment-editor 动态评论编辑器
    textarea-editor(:placeholder="placeholder" )
</template>

<style lang="less" scoped>

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