<template lang="pug">
  .subscribe-columns
    h4 作者是用户关注的专栏
</template>
<style lang="less">

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
export default {
  data: () => ({
    uid: NKC.configs.uid,
    columns: [],
  }),
  components: {

  },
  methods: {
    //获取用户关注的专栏列表
    getColumns() {
      const self = this;
      nkcAPI(`/u/${self.uid}/s/column`, 'GET')
      .then(res => {
        self.columns = res.columns;
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
