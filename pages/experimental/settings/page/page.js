import { getDataById } from '../../../lib/js/dataConversion';
import Vue from 'vue';
import { nkcAPI } from '../../../lib/js/netAPI';
import { sweetError, sweetSuccess } from '../../../lib/js/sweetAlert';

const data = getDataById('data');
new Vue({
  el: '#app',
  data: {
    articlePanelStyleTypes: data.articlePanelStyleTypes,
    articlePanelCoverTypes: data.articlePanelCoverTypes,
    pageSettings: data.pageSettings,
  },
  methods: {
    save: function () {
      nkcAPI('/e/settings/page', 'PUT', {
        pageSettings: this.pageSettings,
      })
        .then(function () {
          sweetSuccess('保存成功');
        })
        .catch(function (data) {
          sweetError(data);
        });
    },
  },
});
