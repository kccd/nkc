<template lang="pug">
  .post-panel.b-s-10
    .paging-button
      a.radius-left.button(@click="toRoute('moment')" :class="t === 'moment'?'active':''") 动态
      a.button(@click="toRoute('post')" :class="t === 'post'?'active':''") 回复
      a.button(@click="toRoute('thread')" :class="t === 'thread'?'active':''") 文章
      a.button(@click="toRoute('follow')" :class="t === 'follow' ? 'active' : ''") 关注
      a.radius-right.button(@click="toRoute('fans')" :class="t === 'fans' ? 'active' : ''") 粉丝
    .post-panel-item
      router-view
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
</style>
<script>
import Paging from "../../Paging";
export default {
  data:() => ({
    uid: '',
    t: null,
    momentsData: null,
    posts: null,
    users: [],
    paging: null,
  }),
  components: {
    "paging": Paging,
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
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
