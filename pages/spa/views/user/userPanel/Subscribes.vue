<template lang="pug">
  div
    sid-users(:target-user="targetUser" type="fan" :sid-users="fans" title="粉丝")
    sid-users(:target-user="targetUser" type="follower" :sid-users="subUser" title="关注")
</template>
<style lang="less">

</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";
import SidUsers from "./SidUsers";
export default {
  data: () => ({
    fans: '',
    subUser: '',
    targetUser: '',
  }),
  components: {
    "sid-users": SidUsers
  },
  mounted() {
    this.getSubscribes();
  },
  methods: {
    //获取关注的用户和粉丝
    getSubscribes() {
      const {uid} = this.$route.params;
      const self = this;
      nkcAPI(`/u/${uid}/p/subUser`, 'GET')
      .then(res => {
        self.targetUser = res.targetUser;
        self.fans = res.targetUserFans;
        self.subUser = res.targetUserFollowers;
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
