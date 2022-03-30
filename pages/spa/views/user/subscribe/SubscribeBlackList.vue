<template lang="pug">
  .subscribe-black-list
    h4 这是用户黑名单
</template>
<style lang="less">
@import "../../../../publicModules/base";
</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
export default {
  data: () => ({
    uid: NKC.configs.uid,
    blackList: [],
  }),
  components: {

  },
  methods: {
    //获取用户黑名单
    getBlackList() {
      const self = this;
      nkcAPI(`/u/${this.uid}/s/blackList`, 'GET')
      .then(res => {
        self.blackList = res.blackList;
      })
      .catch(err => {
        sweetError(err);
      })
    },
  }
}
</script>
