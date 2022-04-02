<template lang="pug">
  .hidden-sm.hidden-xs(v-if="forums" )
    sub-forum(:forums="forums")
    user-manage(ref="userManage")
    share(ref="share")
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
</style>
<script>
import SubForum from "./userPanel/SubForum";
import UserManage from "./userPanel/UserManage";
import Share from "../../../lib/vue/Share";
export default {
  props: ['forums'],
  data: ()=> ({

  }),
  components: {
    "sub-forum": SubForum,
    "user-manage": UserManage,
    "share": Share
  },
  mounted() {
  },
  methods: {

  },
}
</script>
