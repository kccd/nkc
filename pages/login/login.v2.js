import Vue from 'vue';
import LoginCore from '../lib/vue/LoginCore.vue';
import { getState } from '../lib/js/state';
import { RNLogin } from '../lib/js/reactNative';
import { getDataById } from '../lib/js/dataConversion';
import { nkcAPI } from '../lib/js/netAPI';
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
      this.onLogged();
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
  },
});
