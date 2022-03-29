<template lang="pug">
.review
  .no-review
    h4 内容未审核
    p 送审理由：{{post.reviewReason}}
    | 通过请点击
    button.btn.btn-xs.btn-default(@click="reviewPost(post.pid)") 通过
    | &nbsp; 按钮，不通过请点击
    button.btn.btn-xs.btn-default(@click="`NKC.methods.disabledPosts('${post.pid}')`") 退修或删除
    | 按钮。
  .reviewed
    | 审核中
</template>
<style lang="less">
@import "../../../../publicModules/base";
</style>
<script>
export default {
  props: ['post', 'permissions'],
  data: () => ({
  }),
  mounted() {
    console.log('post', this.post);
  },
  methods: {
    //审核post
    reviewPost(pid) {

    }
  }
}
</script>
