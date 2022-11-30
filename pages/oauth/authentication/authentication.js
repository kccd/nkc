import {getDataById} from "../../lib/js/dataConversion";
import {nkcAPI} from "../../lib/js/netAPI";
import {visitUrl} from "../../lib/js/pageSwitch";
import {sweetError} from "../../lib/js/sweetAlert";
import {getState} from "../../lib/js/state";
import {toLogin} from "../../lib/js/account";

const {uid} = getState();
const data = getDataById('data');
const {appId, appName, appHome, token, operations} = data.oauthInfo;
const app = new Vue({
  el: '#app',
  data: {
    logged: !!uid,
    appId,
    appName,
    appHome,
    token,
    operations,
  },
  mounted() {
    if(!this.uid) {
      this.toLogin();
    }
  },
  methods: {
    toLogin,
    post(approved) {
      const {token} = this;
      nkcAPI(`/oauth/authentication`, 'PUT', {
        token,
        approved,
      })
        .then(data => {
          visitUrl(data.url);
        })
        .catch(sweetError)
    },
    submit() {
      this.post(true);
    },
    cancel() {
      this.post(false);
    }
  }
});
