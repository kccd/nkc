<template lang="pug">
  .container-fluid.max-width.clear-padding
    .user-account.m-b-1(v-if="targetUser")
      .row
        //- 用户左侧面板
        .col-xs-12.col-md-2.left-panel-container
          .left-panel-box(:class="leftPanelBoxOperation ? 'left-panel-box-show' : 'left-panel-box-none'")
            left-panel(:nav-links="navLinks" :users-bl-uid="usersBlUid" :target-user="targetUser" :code="code" :target-user-scores="targetUserScores")
          .left-panel-box-operation.fa(@click="clickLeftBox" :class="leftPanelBoxOperation ? 'fa-angle-up' : 'fa-angle-down'")

        //- 用户中间面板 先hi用户的动态， 文章，恢复等信息
        .col-xs-12.col-md-7.center-panel-container
          .user-container.p-r-0.m-b-1.box-shadow-panel
            router-view
          //user-card(ref="userCard")
        //用户右侧面板
        .col-xs-12.col-md-3.right-panel-container
          right-panel(:forums="forums" :target-user="targetUser" :target-user-fans="targetUserFans" :target-user-followers="targetUserFollowers" )
</template>
<style lang="less">
@import "../../../publicModules/base";
.clear-padding{
  @media (max-width: 992px){
    padding-left: 0;
    padding-right: 0;
  }
}
.left-panel-box{
  height: 100%;
}

@media (min-width: 992px) {
  .left-panel-box-operation.fa{
    display: none;
  }
  .center-panel-container {
    padding-left: 0;
    padding-right: 0;
  }
}
@media (max-width: 991px) {
  .left-panel-box-operation{
    display: block;
    text-align: center;
    cursor:pointer;
    font-size: 3rem;
    background: #f6f2ee;
  }
  .left-panel-box-none{
    height: 0rem;
    overflow: hidden;
  }
  .left-panel-box-show{
    height: 100%;
    transition: height 1s;
  }
  .box-shadow-panel {

  }
}
</style>
<script>
import {getColumnInfo} from "../../../lib/js/column";
import {getState} from "../../../lib/js/state";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
export default {
  props: ['navLinks', 'target-user', 'type', 'forums', "targetUserFans", "targetUserFollowers", "code","targetUserScores", "usersBlUid"],
  data: () => ({
    targetColumn: '',
    leftPanelBoxOperation: false,
  }),
  components: {
    "left-panel": LeftPanel,
    "right-panel": RightPanel
  },
  mounted() {
    const self = this;
    if(getState().uid) {
      getColumnInfo()
      .then(res => {
        self.targetColumn = res;
      })
    }
  },
  methods: {
    clickLeftBox(){
      this.leftPanelBoxOperation = !this.leftPanelBoxOperation
    }
  }
}

</script>
