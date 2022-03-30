<template lang="pug">
  .subscribe-thread
    h4 这是用户收藏的文章
</template>
<style lang="less">

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
export default {
  data: () => ({
    uid: null,
    threads: [],
  }),
  components: {

  },
  mounted() {
    this.initData();
    this.getThreads();
  },
  methods: {
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取用户收藏的文章
    getThreads() {
      const self = this;
      nkcAPI(`/u/${self.uid}/profile/thread`, 'GET')
      .then(res => {
        self.threads = res.threads;
      })
      .catch(err => {
        sweetError(err);
      })
    },
  }
}
</script>
