<template lang="pug">
  div
    panel(ref="panel" :fans-count="fansCount" :followers-count="followersCount" :code="code"  v-if="targetUser")
    account-user(
      ref="accountUser"
      :users-bl-uid="usersBlUid"
      :target-user-scores="targetUserScores"
      :target-user-fans="targetUserFans"
      :target-user-followers="targetUserFollowers"
      :target-user="targetUser"
      :nav-links="navLinks"
      :forums="subForums"
      :code="code"
      :account-register-info="accountRegisterInfo"
      )
    footer-vue(ref="footerVue")
</template>

<style lang="less" scoped>
@import "../../../publicModules/base";

</style>

<script>
import {getUrl} from "../../../lib/js/tools";
import {nkcAPI} from "../../../lib/js/netAPI";
import {getState} from "../../../lib/js/state";
import Panel from "./userPanel/Panel";
import AccountUser from "./AccountUser";
import Footer from "../../../lib/vue/publicVue/footer/Footer"
import {setPageTitle} from "../../../lib/js/pageSwitch";
import {RNSetSharePanelStatus} from "../../../lib/js/reactNative";
import {shareTypes} from "../../../lib/js/shareTypes";
export default {
  data:() => ({
    targetUser: null,
    navLinks: null,
    uid: null,
    isApp: null,
    subForums: [],
    targetUserScores: null,
    fansCount: null,
    followersCount: null,
    targetUserFans: null,
    targetUserFollowers: null,
    accountRegisterInfo: null,
    code: null,
    usersBlUid: [],
  }),
  components: {
    "panel": Panel,
    "account-user": AccountUser,
    "footer-vue": Footer
  },
  created() {
    const {isApp} = getState();
    this.isApp = isApp;
  },
  mounted() {
    const {uid} = this.$route.params;
    this.uid = uid;
    this.getUserInfo();
    RNSetSharePanelStatus(true, shareTypes.user, uid)
  },
  methods: {
    getUrl: getUrl,
    //获取用户主页信息
    getUserInfo() {
      const self = this;
      nkcAPI(`/u/${this.uid}/profile`, 'GET')
      .then(res => {
        self.subForums = res.targetUserSubForums;
        self.navLinks = res.navLinks;
        self.targetUser = res.targetUser;
        self.targetUserScores = res.targetUserScores;
        self.fansCount = res.fansCount;
        self.followersCount = res.followersCount;
        self.targetUserFans = res.targetUserFans;
        self.targetUserFollowers = res.targetUserFollowers;
        self.code = res.code;
        self.accountRegisterInfo = res.authorAccountRegisterInfo;
        self.usersBlUid = res.usersBlUid;
        const title = self.targetUser.username ? self.targetUser.username : '用户';
        setPageTitle(title  + '的主页');
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
