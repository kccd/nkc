<template lang="pug">
  .left-panel
    //用户信息

    //- 用户链接
    .m-b-1(v-if="rolePermissionsType" )
      user-link(ref="userLink" :target-user="targetUser" :nav-links="navLinks")
    //用户关注
    .m-b-1(v-if="rolePermissionsType" )
      user-focus-on(ref="userFocusOn")
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
import UserFocusOn from "./userPanel/UserFocusOn";
import UserLink from "./userPanel/UserLink";
import Share from "../../../lib/vue/Share";
import UserManage from "./userPanel/UserManage";
import {getState} from "../../../lib/js/state";

export default {
  props: ['nav-links', 'target-user'],
  data: () => ({
    rolePermissionsType: null,
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
    }
  },
  components: {
    "user-focus-on": UserFocusOn,
    "user-link": UserLink,
    "share":Share,
    "user-manage": UserManage,
  },
  methods: {

  }
}
</script>
