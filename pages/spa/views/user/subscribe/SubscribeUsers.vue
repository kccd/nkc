<template lang="pug">
  //关注的用户
  .subscribe-user
    .subscribe-types
    .subscribe-type-edit 管理分类
    div 主分类：
      div
        button.subscribe-type 全部


</template>
<style lang="less">

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";

export default {
  data: () => ({
    uid: NKC.configs.uid,
    users: []
  }),
  components: {

  },
  mounted() {
    this.getSubUser();
  },
  methods: {
    //获取关注的用户
    getSubUser() {
      const self = this;
      nkcAPI(`/u/${self.uid}/profile/subscribe/user`, 'GET')
      .then(res => {
        self.users = res.users;
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
