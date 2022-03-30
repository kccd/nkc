<template lang="pug">
  //关注的用户
  .subscribe-user
    .subscribe-types
    .subscribe-type-edit 管理分类
    div 主分类：
      div
        button.subscribe-type 全部
      div(v-for="t in subscribeTypes" :key=t)
        button.subscribe-type {{t}}


</template>
<style lang="less">

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
import {getState} from "../../../../lib/js/state";
export default {
  data: () =>({
    uid: NKC.configs.uid,
    users: [],
    subscribeTypes:['XIAO','垃圾']
  }),
  components: {

  },
  methods: {
    getUser() {
      const self = this;
      nkcAPI(`/u/${self.uid}/s/user`, 'GET')
      .then((res) => {
        self.users = res.users;
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
