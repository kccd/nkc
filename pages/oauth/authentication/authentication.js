import {getDataById} from "../../lib/js/dataConversion";
import {nkcAPI} from "../../lib/js/netAPI";
import {visitUrl} from "../../lib/js/pageSwitch";
import {sweetError} from "../../lib/js/sweetAlert";

const data = getDataById('data');
const {appId, appName, appHome, token, operations} = data.oauthInfo;
const app = new Vue({
  el: '#app',
  data: {
    appId,
    appName,
    appHome,
    token,
    operations,
  },
  methods: {
    submit() {
      const {token} = this;
      nkcAPI(`/oauth/authentication`, 'POST', {
        token
      })
        .then(data => {
          visitUrl(data.url);
        })
        .catch(sweetError)
    },
    cancel() {
      window.history.back();
    }
  }
});
