<template lang="pug">
  .col-xs-12.col-md-2.box-shadow-panel.hidden-sm.hidden-xs.p-r-0.m-b-1(v-if="forums")
    sub-forum(:forums="forums")
    subscribes(:target-user-fans="targetUserFans" :target-user-followers="targetUserFollowers" )
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
</style>
<script>
import SubForum from "./userPanel/SubForum";
import Subscribes from "./userPanel/Subscribes";
export default {
  props: ['forums', 'target-user', "targetUserFans", "targetUserFollowers"],
  data: ()=> ({

  }),
  components: {
    "sub-forum": SubForum,
    "subscribes": Subscribes
  },
  mounted() {
  },
  methods: {

  },
}
</script>
