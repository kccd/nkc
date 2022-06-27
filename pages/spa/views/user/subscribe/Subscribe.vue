<template lang="pug">
  .subscribe-container.box-shadow-panel
    .self(v-if="self")
      .paging-button
        a.radius-left.button(@click="toRoute('subUsers')" :class="t === 'subUsers'?'active':''") 用户
        a.button(@click="toRoute('subForums')" :class="t === 'subForums'?'active':''") 专业
        a.button(@click="toRoute('subColumns')" :class="t === 'subColumns'?'active':''") 专栏
        a.button(@click="toRoute('subCollection')" :class="t === 'subCollection' ? 'active' : ''") 文章
        //a.radius-right.button(@click="toRoute('blacklist')" :class="t === 'blacklist' ? 'active' : ''") 黑名单
      router-view
    .self(v-else)
      .operation 权限不足

</template>
<style lang="less" scoped>
@import '../../../../publicModules/base';
.paging-button {
  box-shadow: none;
}
.self {
  .operation {
    text-align: center;
    margin-top: 5rem;
    margin-bottom: 5rem;
    font-size: 2rem;
    font-weight: bold;
  }
}
</style>
<script>
import {getState} from "../../../../lib/js/state";
export default {
  data: () => ({
    t: null,
  }),
  computed: {
    self() {
      const {uid: targetUid} = getState();
      const {uid} = this.$route.params;
      return uid === targetUid;
    },
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      const {name} = this.$route;
      this.t = name;
    },
    //跳转到指定路由
    toRoute(name) {
      this.t = name;
      this.$router.push({
        name
      });
    },
  },
}
</script>
