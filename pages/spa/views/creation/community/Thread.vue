<template lang="pug">
  div.article-common.col-xs-12.col-md-9.m-b-1(style="disply:none" ref='block')
    user-post-list(ref="userPostList")
</template>


<script>
import UserPostList from "../../user/propfile/profile/UserPostList";
export default {
  components:{
    "user-post-list": UserPostList,
  },
  data: () => ({
  }),
  methods:{
  }
}
</script>
<style lang="less" scoped>
.article-common{
  padding: 0!important;
}
</style>
