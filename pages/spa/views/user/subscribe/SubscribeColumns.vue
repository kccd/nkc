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
    uid: null,
    columns: [],
  }),
  components: {

  },
  mounted() {
    this.initData();
    this.getColumns();
  },
  methods: {
    initData() {
      const {uid} = this.$route.params;
      this.uid = uid;
    },
    //获取用户关注的专栏列表
    getColumns() {
      const self = this;
      nkcAPI(`/u/${self.uid}/profile/subscribe/column`, 'GET')
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
