import { getDataById } from '../../../lib/js/dataConversion';
import Vue from 'vue';
import { nkcAPI } from '../../../lib/js/netAPI';

const data = getDataById('data');

var app = new Vue({
  el: '#app',
  data: {
    error: '',
    info: '',
    subSettings: data.subSettings,
  },
  methods: {
    save: function () {
      this.error = '';
      this.info = '';
      var subSettings = this.subSettings;
      if (
        subSettings.subUserCountLimit < 0 ||
        subSettings.subForumCountLimit < 0 ||
        subSettings.subColumnCountLimit < 0
      ) {
        return (this.error = '');
      }
      nkcAPI('/e/settings/sub', 'PUT', subSettings)
        .then(function () {
          app.info = '保存成功';
        })
        .catch(function (data) {
          app.error = data.error || data;
        });
    },
  },
});
