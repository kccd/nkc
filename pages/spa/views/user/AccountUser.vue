<template lang="pug">
  .container-fluid.max-width
    .user-account.m-b-1(v-if="targetUser")
      .row
        //- 用户左侧面板
        .col-xs-12.col-md-2.left-panel-container
          .left-panel-box(:class="leftPanelBoxOperation ? 'left-panel-box-show' : 'left-panel-box-none'")
            .left-panel-box-operation(@click="clickLeftBox") {{leftPanelBoxOperation ? "收起" : "展开"}}
            left-panel(:nav-links="navLinks" :users-bl-uid="usersBlUid" :target-user="targetUser" :code="code" :target-user-scores="targetUserScores")
        //- 用户中间面板 先hi用户的动态， 文章，恢复等信息
        .col-xs-12.col-md-7.center-panel-container
          .user-container.p-r-0.m-b-1.box-shadow-panel
            router-view
          //user-card(ref="userCard")
        //用户右侧面板
        .col-xs-12.col-md-3
          right-panel(:forums="forums" :target-user="targetUser" :target-user-fans="targetUserFans" :target-user-followers="targetUserFollowers" )
</template>
<style lang="less">
@import "../../../publicModules/base";
.left-panel-box-operation{
  display: none;
}
.left-panel-container{
  @media(min-width: 992px) {
    padding-right: 0!important;
  }
}
.center-panel-container{
  @media(min-width: 992px) {
    padding-right: 0!important;
  }
}
@media (max-width: 991px) {
  .user-container{
    padding: 0;
  }
  .left-panel-box{
    .left-panel-box-operation{
      display: block;
      position: relative;
      top: 25px;
      z-index: 10;
      right: 10px;
      text-align: right;
      cursor:pointer;
    }
  }
  .left-panel-box-none{
    height: 130px;
    overflow: hidden;
    margin-top: -20px;
  }
  .left-panel-box-show{
    height: auto;
    margin-top: -20px;
    //overflow: hidden;
  }
}
</style>
<script>
import {getColumnInfo} from "../../../lib/js/column";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
export default {
  props: ['navLinks', 'target-user', 'type', 'forums', "targetUserFans", "targetUserFollowers", "code","targetUserScores", "usersBlUid"],
  data: () => ({
    targetColumn: getColumnInfo(),
    leftPanelBoxOperation: false,
  }),
  components: {
    "left-panel": LeftPanel,
    "right-panel": RightPanel
  },
  mounted() {
  },
  methods: {
    clickLeftBox(){
      this.leftPanelBoxOperation = !this.leftPanelBoxOperation
    }
  }
}

</script>
