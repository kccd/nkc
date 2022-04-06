<template lang="pug">
  .hidden-sm.hidden-xs(v-if="forums" )
    sub-forum(:forums="forums")
    user-manage(ref="userManage")
    subscribes
    share(ref="share" share-type="user" :share-title="targetUser.username || targetUser.uid" :share-id="targetUser.uid" :share-description="targetUser.description" :share-avatar="targetUser.avatar")
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
</style>
<script>
import SubForum from "./userPanel/SubForum";
import UserManage from "./userPanel/UserManage";
import Share from "../../../lib/vue/Share";
import Subscribes from "./userPanel/Subscribes";
export default {
  props: ['forums', 'target-user'],
  data: ()=> ({

  }),
  components: {
    "sub-forum": SubForum,
    "user-manage": UserManage,
    "share": Share,
    "subscribes": Subscribes
  },
  mounted() {
  },
  methods: {

  },
}
</script>
