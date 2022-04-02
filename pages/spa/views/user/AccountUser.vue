<template lang="pug">
.user-account.m-b-1(v-if="targetUser")
  //- 用户左侧面板
  .col-sx-12.col-md-3.box-shadow-panel.p-r-0.p-l-0.m-b-1#get-left-user-info-list
    left-panel(:nav-links="navLinks" :target-user="targetUser")

  //- 用户中间面板 先hi用户的动态， 文章，恢复等信息
  .col-xs-12.col-md-7.p-r-0.m-b-1#comment-content
    router-view
    //user-card(ref="userCard")
  //用户右侧面板
  .col-xs-12.col-md-2.box-shadow-panel.hidden-sm.hidden-xs.p-r-0.m-b-1
    right-panel(:forums="forums" :target-user="targetUser")
</template>
<style lang="less">
@import "../../../publicModules/base";
</style>
<script>
import {getColumnInfo} from "../../../lib/js/tools";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
export default {
  props: ['navLinks', 'target-user', 'type', 'forums'],
  data: () => ({
    targetColumn: getColumnInfo(),
  }),
  components: {
    "left-panel": LeftPanel,
    "right-panel": RightPanel
  },
  mounted() {
  },
  methods: {

  }
}

</script>
