<template lang="pug">
.user-account.m-b-1(v-if="targetUser")
  //- 用户左侧面板
  left-panel(:nav-links="navLinks" :target-user="targetUser")

  //- 用户中间面板 先hi用户的动态， 文章，恢复等信息
  .user-container.col-xs-12.col-md-7.p-r-0.m-b-1.box-shadow-panel#comment-content
    router-view
    //user-card(ref="userCard")
  //用户右侧面板
  right-panel(:forums="forums" :target-user="targetUser")
</template>
<style lang="less">
@import "../../../publicModules/base";
@media (max-width: 991px) {
  .user-container{
    padding: 0;
  }
}
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
