<template lang="pug">
  .container-fluid.max-width
    .hidden-md.hidden-lg
    .drawer-fixed-button-left(@click="switchLeftDrawer()" :class="{'active': leftDrawFlag}")
      .fa.fa-angle-double-right(v-if="!leftDrawFlag")
      .fa.fa-angle-double-left(v-if="leftDrawFlag")
    .drawer-dom
      .drawer-mask(@click="closeDrawer()" :class="{'active': leftDrawFlag}")
      .left(:class="{'active': leftDrawFlag}")
        .dom
          left-panel(:nav-links="navLinks" :users-bl-uid="usersBlUid" :target-user="targetUser" :code="code" :target-user-scores="targetUserScores")
    .user-account.m-b-1(v-if="targetUser")
      .row
        //- 用户左侧面板
        .col-xs-12.col-md-2.left-panel-container
          //.left-panel-box(:class="leftPanelBoxOperation ? 'left-panel-box-show' : 'left-panel-box-none'").clearPaddingLeftByMargin.clearPaddingRightByMargin
          //  left-panel(:nav-links="navLinks" :users-bl-uid="usersBlUid" :target-user="targetUser" :code="code" :target-user-scores="targetUserScores")
          //.left-panel-box-operation.fa(@click="clickLeftBox" :class="leftPanelBoxOperation ? 'fa-angle-up' : 'fa-angle-down'").clearPaddingLeftByMargin.clearPaddingRightByMargin
          .left-panel-box.clearPaddingLeftByMargin.clearPaddingRightByMargin
            left-panel(
              :account-register-info="accountRegisterInfo"
              :nav-links="navLinks"
              :users-bl-uid="usersBlUid"
              :target-user="targetUser"
              :code="code"
              :target-user-scores="targetUserScores"
              )

        //- 用户中间面板 先hi用户的动态， 文章，恢复等信息
        .col-xs-12.col-md-7.center-panel-container
          .user-container.p-r-0.m-b-1.box-shadow-panel.clearPaddingLeftByMargin.clearPaddingRightByMargin
            //.m-b-1
              user-creation-home(:target-user="targetUser")
            router-view
          //user-card(ref="userCard")
        //用户右侧面板
        .col-xs-12.col-md-3.right-panel-container
          right-panel(:forums="forums" :target-user="targetUser" :target-user-fans="targetUserFans" :target-user-followers="targetUserFollowers" )
</template>
<style lang="less" scoped>
@import "../../../publicModules/base";

.left-panel-box{
  height: 100%;
}

@media (min-width: 992px) {
  //.left-panel-box-operation.fa{
  //  display: none;
  //}
  .drawer-fixed-button-left,.drawer-dom {
    display: none;
  }
  .center-panel-container {
    padding-left: 0;
    padding-right: 0;
  }
}

@media (max-width: 991px) {
  .left-panel-box{
    display: none;
  }
  //.left-panel-box-operation{
  //  display: block;
  //  text-align: center;
  //  cursor:pointer;
  //  font-size: 3rem;
  //  background: #f6f2ee;
  //}
  //.left-panel-box-none{
  //  height: 0rem;
  //  overflow: hidden;
  //}
  //.left-panel-box-show{
  //  height: 100%;
  //  transition: height 1s;
  //}
  //.box-shadow-panel {
  //
  //}
}
</style>
<script>
import {getColumnInfo} from "../../../lib/js/column";
import {getState} from "../../../lib/js/state";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import UserCreationHome from "./userPanel/UserCreationHome";
export default {
  props: [
    'navLinks',
    'target-user',
    'type',
    'forums',
    "targetUserFans",
    "targetUserFollowers",
    "code",
    "targetUserScores",
    "usersBlUid",
    'accountRegisterInfo'
  ],
  data: () => ({
    targetColumn: '',
    leftPanelBoxOperation: false,
    leftDrawFlag: false,
  }),
  components: {
    "left-panel": LeftPanel,
    "right-panel": RightPanel,
    "user-creation-home": UserCreationHome
  },
  watch: {
    leftDrawFlag(oldValue, newValue) {
      let bodyEl = document.body;
      let nkcDrawerBodyTop;
      if(this.leftDrawFlag === true) {
        nkcDrawerBodyTop = window.scrollY;
        bodyEl.style.position = 'fixed';
        bodyEl.style.top = -nkcDrawerBodyTop + 'px';
      } else {
        bodyEl.style.position = '';
        bodyEl.style.top = '';
        window.scrollTo(0, nkcDrawerBodyTop) // 回到原先的top
      }
    }
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
    },
    //左侧菜单栏开关
    switchLeftDrawer() {
      this.leftDrawFlag = !this.leftDrawFlag;
    },
    //关闭菜单栏
    closeDrawer() {
      this.leftDrawFlag = false;
    }
  }
}

</script>
