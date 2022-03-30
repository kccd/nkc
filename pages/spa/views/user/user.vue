<template lang="pug">
.container-fluid.max-width
  .row
    .col-sx-12.col-md-12
      .row
        Panel(ref="panel" :target-user="targetUser" v-if="targetUser")
        account-user(ref="accountUser" :target-user="targetUser" :nav-links="navLinks")
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
export default {
  data:() => ({
    targetUser: null,
    navLinks: null,
    t: '',
    uid: null,
    isApp: null,
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
      nkcAPI(`/u/${this.uid}/profile`, 'GET')
      .then(res => {
        self.t = res.t;
        self.navLinks = res.navLinks;
        self.targetUser = res.targetUser;
      })
      .catch(err => {
        sweetError(err);
      })
    }
  }
}
</script>
