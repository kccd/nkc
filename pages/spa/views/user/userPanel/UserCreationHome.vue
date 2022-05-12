<template lang="pug">
  .user-number(v-if="targetUser")
    .col-xs-2
      .number {{targetUser.xsf}}
      .title 学术分
    .col-xs-2
      .number {{targetUser.threadCount - targetUser.disabledThreadsCount}}
      .title 社区文章
    .col-xs-2
      .number {{targetUser.columnThreadCount}}
      .title 专栏文章
    .col-xs-2
      .number {{targetUser.zoneThreadCount}}
      .title 空间文章
    .col-xs-2
      .number {{targetUser.postCount - targetUser.disabledPostsCount + targetUser.commentCount}}
      .title 回复
    .clear
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.user-number {
  .number {
    text-align: center;
  }
  .title {
    text-align: center;
  }
  .clear {
    clear: both;
  }
}
</style>
<script>
export default {
 props: ['target-user'],
}
</script>
