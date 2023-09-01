import Vue from 'vue';
import LoginCore from '../lib/vue/LoginCore.vue';
import { getState } from '../lib/js/state';
import { RNCloseWebview, RNLogin } from '../lib/js/reactNative';
import { getDataById } from '../lib/js/dataConversion';
import { nkcAPI } from '../lib/js/netAPI';
import { visitUrl } from '../lib/js/pageSwitch';
const { referer, type } = getDataById('data');

const { isApp, uid } = getState();
new Vue({
  el: '#app',
  data: {
    isApp,
    uid,
  },
  components: {
    'login-core': LoginCore,
  },
  mounted() {
    this.$refs.loginCore.selectType(type);
    if (this.uid) {
      this.onLogged();
    }
  },
  methods: {
    onLogged() {
      if (isApp) {
        RNLogin();
      } else if (window.onLogged) {
        window.onLogged();
      } else {
        this.visitReferer();
      }
    },
    onRegistered() {
      if (this.isApp) {
        RNLogin();
      } else {
        visitUrl('/register/subscribe');
      }
    },
    visitReferer() {
      if (referer) {
        nkcAPI(referer, 'GET')
          .then(() => {
            window.location.href = referer;
          })
          .catch(() => {
            window.location.href = '/';
          });
      } else {
        window.location.href = '/';
      }
    },
    close() {
      if (isApp) {
        RNCloseWebview();
      }
    },
  },
});
