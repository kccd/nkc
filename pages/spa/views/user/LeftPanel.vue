<template lang="pug">
  .left-panel.box-shadow-panel
    //用户动态码和财政
    .m-b-1(v-if="isSelf")
      user-code-and-finance(ref="userProfileInfo" :target-user="targetUser" :code="code" :target-user-scores="targetUserScores")
    //用户信息
    .m-b-1(v-if="targetUser")
      user-profile-info(ref="userProfileInfo" :target-user="targetUser" :code="code")
    //访客用户加黑举报操作
    .m-b-1(v-if="!isSelf")
      visitor-operate(:users-bl-uid="usersBlUid" :target-user="targetUser")
    //用户自己操作
    .m-b-1(v-if="isSelf")
      user-operate(:target-user="targetUser")
    //- 用户链接
    .m-b-1(v-if="isSelf")
      nav-links(ref="userLink" :nav-links="navLinks")
    user-manage(ref="userManage")
    //  分享链接
    .m-b-1
      share(ref="share" share-type="user" :share-title="targetUser.username || targetUser.uid" :share-id="targetUser.uid" :share-description="targetUser.description" :share-avatar="targetUser.avatar")

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
import {getState} from "../../../lib/js/state";
import {EventBus} from "../../eventBus";

export default {
  props: ['nav-links', 'target-user', "code","targetUserScores", "usersBlUid"],
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
    "user-focus-on": UserFocusOn,
    "nav-links": NavLinks,
    "share":Share,
    "user-manage": UserManage,
    "user-profile-info": UserProfileInfo,
    "user-operate": UserOperate,
    "user-code-and-finance": UserCodeAndFinance,
    "visitor-operate": VisitorOperate
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
