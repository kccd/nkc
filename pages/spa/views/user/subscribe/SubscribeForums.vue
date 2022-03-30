<template lang="pug">
  .home-subscribe-forum
    h4 这是用户关注的专业
</template>
<style lang="less">

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
export default {
  data: () => ({
    uid: null,
    forums: [],
  }),
  components: {

  },
  mounted() {
    this.initData();
    this.getForums();
  },
  methods: {
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取用户关注的专业列表
    getForums() {
      const self = this;
      nkcAPI(`/u/${self.uid}/profile/subscribe/forum`, 'GET')
      .then(res => {
        self.forums = res.forums;
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
