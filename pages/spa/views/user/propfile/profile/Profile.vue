<template lang="pug">
  .div
    .paging-button
      a.radius-left.button(@click="toRoute('moment')" :class="t === 'moment'?'active':''") 动态
      a.button(@click="toRoute('post')" :class="t === 'post'?'active':''") 回复
      a.button(@click="toRoute('thread')" :class="t === 'thread'?'active':''") 文章
      a.button(@click="toRoute('follower')" :class="t === 'follow' ? 'active' : ''") 关注
      a.radius-right.button(@click="toRoute('fan')" :class="t === 'fan' ? 'active' : ''") 粉丝
    .post-panel-item
      router-view
</template>
<style lang="less" scoped>
@import "../../../../../publicModules/base";
.paging-button {
  padding: 15px;
}
</style>
<script>
export default {
  data: () => ({
    t: null,
  }),
  mounted() {
    const {params, name} = this.$route;
    const {uid} = params;
    this.uid = uid;
    this.t = name;
  },
  methods: {
    //跳转到指定路由
    toRoute(name) {
      this.t = name;
      this.$router.push({
        name
      });
    },
  }
}
</script>
