import { loginTypes } from '../../../lib/js/login';
import { getDataById } from '../../../lib/js/dataConversion';
import { nkcAPI } from '../../../lib/js/netAPI';
import { sweetSuccess, sweetError } from '../../../lib/js/sweetAlert';

const data = getDataById('data');
var app = new window.Vue({
  el: '#app',
  data: {
    loginSettings: data.loginSettings,
    loginTypes,
  },
  methods: {
    save: function () {
      var loginSettings = this.loginSettings;
      nkcAPI('/e/settings/login', 'PUT', loginSettings)
        .then(function () {
          sweetSuccess('保存成功');
        })
        .catch(function (data) {
          sweetError(data);
        });
    },
  },
});
