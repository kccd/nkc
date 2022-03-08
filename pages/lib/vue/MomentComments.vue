<template lang="pug">
  .moment-commments 动态评论列表 MomentId: {{mid}}
    textarea-editor(:placeholder="placeholder" )
</template>

<style lang="less" scoped>

</style>

<script>
  import TextareaEditor from './TextareaEditor'
  export default {
    props: ['mid'],
    components: {
      'textarea-editor': TextareaEditor,
    },
    data: () => ({
      moments: [],
      placeholder: '发表你的评论',
    }),
    computed: {
      momentId() {
        return this.mid;
      }
    }
  }
</script>
