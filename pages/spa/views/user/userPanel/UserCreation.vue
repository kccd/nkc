<template lang="pug">
  .user-creation
    .panel-header 创作信息
    .user-creation-list
      .item
        .item-name 学术分
        .item-count {{targetUser.xsf}}
      .item
        .item-name 论坛文章
        .item-count {{targetUser.threadCount}}
      .item
        .item-name 空间文章
        .item-count {{targetUser.zoneThreadCount}}
      .item
        .item-name 专栏文章
        .item-count {{targetUser.columnThreadCount}}
      .item
        .item-name 回复
        .item-count {{targetUser.postCount - targetUser.disabledPostsCount + targetUser.commentCount}}
      .clear
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.user-creation {
  font-size: 1.2rem;
  .user-creation-list {
    .item {
      width: 100%;
      float: left;
      margin-bottom: 0.5rem;
      .item-name {
        display: inline-block;
      }
      .item-count {
        display: inline-block;
        float: right;
      }
    }
    .clear {
      clear: both;
    }
  }
}
</style>
<script>
export default {
  props: ['target-user'],
  data: () => ({
  }),
  mounted() {
  },
  methods: {

  }
}
</script>
