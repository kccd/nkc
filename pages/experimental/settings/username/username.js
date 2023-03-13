import { getDataById } from '../../../lib/js/dataConversion';
import { sweetError, sweetSuccess } from '../../../lib/js/sweetAlert';
import { nkcAPI } from '../../../lib/js/netAPI';
import Vue from 'vue';

var data = getDataById('data');
data.usernameSettings.maxKcb = data.usernameSettings.maxKcb / 100;
data.usernameSettings.onceKcb = data.usernameSettings.onceKcb / 100;
data.usernameSettings.sensitive.words =
  data.usernameSettings.sensitive.words.join(', ');
var app = new Vue({
  el: '#app',
  data: {
    usernameSettings: data.usernameSettings,
    scoreObject: data.scoreObject,
    scoreName: data.scoreObject.name,
  },
  methods: {
    submit: function () {
      var us = this.usernameSettings;
      if (us.freeCount < 0) {
        return sweetError('免费修改次数不能小于0');
      }
      if (us.onceKcb < 0) {
        return sweetError('花费' + this.scoreName + '增量不能小于0');
      }
      if (us.maxKcb < 0) {
        return sweetError('花费' + this.scoreName + '最大值不能小于0');
      }

      us = {
        onceKcb: us.onceKcb * 100,
        maxKcb: us.maxKcb * 100,
        freeCount: us.freeCount,
        free: !!us.free,
      };
      nkcAPI('/e/settings/username', 'PUT', us)
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
