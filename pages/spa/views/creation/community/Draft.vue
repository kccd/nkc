<template lang="pug">
  div.article-common.col-xs-12.col-md-9.m-b-1
    //-type = community 社区内容草稿 只显示beta版
    user-draft(ref="userDraft" type='community')
</template>

<script>
import UserDraft from "../../../../lib/vue/drafts/UserDraft";
export default {
  components:{
    "user-draft": UserDraft
  },
  data: () => ({
  }),
  mounted(){
  },
  methods:{
  }
}
</script>
<style lang="less" scoped>
.article-common{
  padding: 0!important;
}
</style>
