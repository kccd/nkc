<template lang="pug">
  .left-panel.box-shadow-panel(v-if="targetUser")
    //- 用户ID用户动态码和财政
    .m-b-1(v-if="isSelf").hidden-xs.hidden-sm
      user-code-and-finance(ref="userProfileInfo" :target-user="targetUser" :code="code" :target-user-scores="targetUserScores")
    //- 用户信息
    .m-b-1(v-if="targetUser").hidden-xs.hidden-sm
      user-profile-info(ref="userProfileInfo" :target-user="targetUser" :code="code")

    .m-b-1.hidden-xs.hidden-sm
      .panel-header 主体信息
      account-register-info(:info="accountRegisterInfo")
    //- 用户创作信息
    //-.m-b-1.user-creation
      user-creation(:target-user="targetUser")
    //- 访客用户加黑举报操作
    .m-b-1(v-if="!isSelf")
      visitor-operate(:users-bl-uid="usersBlUid" :target-user="targetUser")
    //- 用户自己操作
    //-.m-b-1(v-if="isSelf")
      user-operate(:target-user="targetUser")
    //- 用户链接
    //-.m-b-1(v-if="isSelf")
      nav-links(ref="userLink" :nav-links="navLinks")
    user-manage(ref="userManage")
    //- 分享链接
    .m-b-1
      .panel-header 分享
      share(ref="share" type='user' :id="targetUser.uid")

</template>
<style lang="less">
@import "../../../publicModules/base";
</style>
<script>
import UserOperate from "./userPanel/UserOperate";
import UserProfileInfo from "./userPanel/UserProfileInfo";
import UserCodeAndFinance from "./userPanel/UserCodeAndFinance";
import UserFocusOn from "./userPanel/UserFocusOn";
import VisitorOperate from "./userPanel/VisitorOperate";
import NavLinks from "./userPanel/NavLinks";
import Share from "../../../lib/vue/Share";
import UserManage from "./userPanel/UserManage";
import UserCreation from "./userPanel/UserCreation";
import {getState} from "../../../lib/js/state";
import AccountRegisterInfo from './propfile/profile/AccountRegisterInfo'
export default {
  props: ['nav-links', 'target-user', "code","targetUserScores", "usersBlUid", 'accountRegisterInfo'],
  data: () => ({
    rolePermissionsType: null,
    targetUid: '',
    uid: getState().uid,
    permissions: '',
  }),
  created() {
  },
  computed:{
    isSelf() {
      const {uid, targetUid} = this;
      return targetUid === uid;
    }
  },
  components: {
    'account-register-info': AccountRegisterInfo,
    "user-focus-on": UserFocusOn,
    "nav-links": NavLinks,
    "share": Share,
    "user-manage": UserManage,
    "user-profile-info": UserProfileInfo,
    "user-operate": UserOperate,
    "user-code-and-finance": UserCodeAndFinance,
    "visitor-operate": VisitorOperate,
    "user-creation": UserCreation
  },
  mounted() {
    const self = this;
    self.initData();
  },
  methods: {
    initData() {
      const {uid} = this.$route.params;
      this.targetUid = uid;
    }
  }
}
</script>
