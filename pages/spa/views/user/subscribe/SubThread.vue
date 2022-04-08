<template lang="pug">
  .subscribe-thread(v-if="targetUser")
    h4 这是用户关注的文章
</template>
<style lang="less">

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
export default {
  data: () => ({
    t: null,
    uid: null,
    targetUser: null,
    parentType: null,
    subscribes: [],
  }),
  methods: {
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    getSubThread(page) {
      const self = this;
      let url = `/u/${self.uid}p/s/thread`
      if(this.t) {
        url += `?t=${this.t}`;
      }
      if(page) {
        if(url.indexOf('?') === -1) {
          url += `?page=${page}`;
        } else {
          url += `&page=${page}`;
        }
      }
      nkcAPI(url, 'GET')
      .then(res => {
        this.targetUser = res.targetUser;
        this.t = res.t;
        this.parentType = res.parentType;
        this.subscribes = res.subscribes;
      })
      .catch(err => {
        sweetError(err);
      })
    }
  },
}
</script>
