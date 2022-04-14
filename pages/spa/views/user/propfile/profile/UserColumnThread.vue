<template lang="pug">
  .user-column-thread
    h4 这是用户在专栏下发表的文章
</template>
<style lang="less">

</style>
<script>
import {nkcAPI} from "../../../../../lib/js/netAPI";
export default {
  data: () => ({
    uid: '',
    threads: '',
    loading: false,
  }),
  mounted() {
    this.initData();
    this.getColumnThreads();
  },
  methods: {
    //获取基本数据
    initData() {
     const {uid} = this.$route.params;
     this.uid = uid;
    },
    //获取用户在专栏下发表的文章
    getColumnThreads(page) {
     this.loading = true;
     const self = this;
     nkcAPI(`/u/${self.uid}/p/column`, "GET")
     .then(res => {
        self.threads = res.threads;
        self.paging = res.paging;
     })
     .catch(err => {
       sweetError(err);
     })
     this.loading = false;
    }
  }
}
</script>
