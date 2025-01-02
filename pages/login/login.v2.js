import Vue from 'vue';
// import LoginCore from '../lib/vue/LoginCore.vue';
import LoginCore from '../lib/vue/LoginCore.v2.vue';
import { getState } from '../lib/js/state';
import { RNCloseWebview, RNLogin } from '../lib/js/reactNative';
import { getDataById } from '../lib/js/dataConversion';
import { nkcAPI } from '../lib/js/netAPI';
import { visitUrl } from '../lib/js/pageSwitch';
import { getDefaultLoginType } from '../lib/js/login';
const { referer, type } = getDataById('data');

const { isApp, uid } = getState();
new Vue({
  el: '#app',
  data: {
    isApp,
    uid,
    loaded: false,
  },
  components: {
    'login-core': LoginCore,
  },
  mounted() {
    getDefaultLoginType().then((loginType) => {
      this.$refs.loginCore.selectLoginType(loginType);
      this.$refs.loginCore.selectMode(type);
      setTimeout(() => {
        this.loaded = true;
      });
    });

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
            visitUrl(referer);
          })
          .catch(() => {
            visitUrl('/');
          });
      } else {
        visitUrl('/');
      }
    },
    close() {
      if (isApp) {
        RNCloseWebview();
      }
    },
  },
});
