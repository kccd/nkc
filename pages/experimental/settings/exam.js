import { getDataById } from '../../lib/js/dataConversion';
import { nkcAPI } from '../../lib/js/netAPI';
import { sweetSuccess, sweetError } from '../../lib/js/sweetAlert';

const data = getDataById('data');
var app = new window.Vue({
  el: '#app',
  data: {
    examSettings: data.examSettings,
  },
  methods: {
    save: function () {
      nkcAPI('/e/settings/exam', 'PUT', { examSettings: app.examSettings })
        .then(function () {
          sweetSuccess('保存成功');
        })
        .catch(function (data) {
          sweetError(data);
        });
    },
  },
});

window.app = app;
