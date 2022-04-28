<template lang="pug">
  .div
    .paging-button
      //a.radius-left.button(@click="toRoute('moment')" :class="t === 'moment'?'active':''") 动态
      a.button(@click="toRoute('post')" :class="t === 'post'?'active':''" v-if="t ==='post' || t === 'thread'") 回复
      a.button(@click="toRoute('thread')" :class="t === 'thread'?'active':''" v-if="t ==='post' || t === 'thread'") 文章
      a.button(@click="toRoute('follower')" :class="t === 'follower' ? 'active' : ''" v-if="t ==='follower' || t === 'fan'") 关注
      a.radius-right.button(@click="toRoute('fan')" :class="t === 'fan' ? 'active' : ''" v-if="t ==='follower' || t === 'fan'") 粉丝
    .post-panel-item.p-b-1
      router-view
</template>
<style lang="less" scoped>
@import "../../../../../publicModules/base";
.paging-button {
  padding: 15px;
}
.post-panel-item {
  padding: 0 15px;
}
</style>
<script>
export default {
  data: () => ({
    t: null,
  }),
  mounted() {
    this.initData();
  },
  updated() {
    this.initData();
  },
  methods: {
    initData() {
      const {params, name} = this.$route;
      const {uid} = params;
      this.uid = uid;
      this.t = name;
    },
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
