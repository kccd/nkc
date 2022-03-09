<template lang="pug">
  .moment-commments 动态评论列表 MomentId: {{mid}}
    moment-comment-editor(:mid="momentId")
</template>

<style lang="less" scoped>

</style>

<script>
  import MomentCommentEditor from './MomentCommentEditor'
  export default {
    props: ['mid'],
    components: {
      'moment-comment-editor': MomentCommentEditor,
    },
    data: () => ({
      moments: [],
    }),
    computed: {
      momentId() {
        return this.mid;
      }
    }
  }
</script>
