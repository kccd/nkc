<template lang="pug">
  .post-panel
    .post-panel-item
      router-view
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.post-panel {
  padding: 0;
}
</style>
<script>
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
  },
  computed: {
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
