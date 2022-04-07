<template lang="pug">
.container-fluid.max-width(v-cloak)
  .col-sx-12.col-md-12
    Panel(ref="panel" :target-user="targetUser" :target-user-scores="targetUserScores" v-if="targetUser")
    account-user(ref="accountUser" :target-user="targetUser" :nav-links="navLinks" :forums="subForums")
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
import Footer from "../../../lib/vue/publicVue/Footer/Footer"
import {setPageTitle} from "../../../lib/js/pageSwitch";
export default {
  data:() => ({
    targetUser: null,
    navLinks: null,
    uid: null,
    isApp: null,
    subForums: [],
    targetUserScores:null,
  }),
  components: {
    Panel: Panel,
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
  },
  methods: {
    getUrl: getUrl,
    //获取用户主页信息
    getUserInfo() {
      const self = this;
      nkcAPI(`/u/${this.uid}/p`, 'GET')
      .then(res => {
        self.subForums = res.targetUserSubForums;
        self.navLinks = res.navLinks;
        self.targetUser = res.targetUser;
        self.targetUserScores = res.targetUserScores;
        setPageTitle(self.targetUser.username + '的主页');
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
