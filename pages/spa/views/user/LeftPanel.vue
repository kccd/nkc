<template lang="pug">
  .left-panel
    .col-sx-12.col-md-3.box-shadow-panel.p-r-0.p-l-0.m-b-1
      //用户动态码和财政
      .m-b-1(v-if="isSelf")
        user-code-and-finance(ref="userProfileInfo" :target-user="targetUser" :code="code" :target-user-scores="targetUserScores")
      //用户信息
      .m-b-1(v-if="targetUser")
        user-profile-info(ref="userProfileInfo" :target-user="targetUser" :code="code")
      //用户操作
      .m-b-1(v-if="isSelf")
        user-operate(:target-user="targetUser")
      //- 用户链接
      .m-b-1(v-if="isSelf")
        nav-links(ref="userLink" v-if="rolePermissionsType" :nav-links="navLinks")
      //用户关注
      //.m-b-1(v-if="rolePermissionsType" )
      //  user-focus-on(ref="userFocusOn")
      .m-b-1
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
import NavLinks from "./userPanel/NavLinks";
import Share from "../../../lib/vue/Share";
import UserManage from "./userPanel/UserManage";
import {getState} from "../../../lib/js/state";

export default {
  props: ['nav-links', 'target-user', "code","targetUserScores"],
  data: () => ({
    rolePermissionsType: null,
    targetUid: '',
    uid: getState().uid,
  }),
  created() {
    this.rolePermissionsType = this.rolePermissions
  },
  computed:{
    rolePermissions(){
      if(this.$route.params.uid===getState().uid){
        return true
      }else{
        return false
      }
    },
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
    "user-code-and-finance": UserCodeAndFinance
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      const {uid} = this.$route.params;
      this.targetUid = uid;
    }
  }
}
</script>
