<template lang="pug">
  .user-column-thread
    .user-column-head
      .user-column-avatar
        img()
      .user-column-content
        a.user-column-username 专栏名称
        span.user-column-from 添加文章
        .user-column-time-sm
          span 时间


</template>
<style lang="less">
.user-column-head{
  padding-left: 3.3rem;
  min-height: 2.8rem;
  position: relative;
  margin-bottom: 0.5rem;
}
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
