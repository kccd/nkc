<template lang="pug">
  div
    sid-users(:target-user="targetUser" type="fan" :sid-users="targetUserFans" title="粉丝")
    sid-users(:target-user="targetUser" type="follower" :sid-users="targetUserFollowers" title="关注")
</template>
<style lang="less">

</style>
<script>
import SidUsers from "./SidUsers";
export default {
  props: ["targetUserFans", "targetUserFollowers"],
  data: () => ({
    targetUser: '',
  }),
  components: {
    "sid-users": SidUsers
  },
}
</script>
