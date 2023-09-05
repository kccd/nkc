import { getDataById } from '../../../lib/js/dataConversion';
import { sweetError } from '../../../lib/js/sweetAlert';
import { visitUrl } from '../../../lib/js/pageSwitch';
import { showIpInfo } from '../../../lib/js/ip';
import Vue from 'vue';

const data = getDataById('data');

new Vue({
  el: '#app',
  data: {
    t: data.t || 'username',
    content: data.content,
  },
  methods: {
    search: function () {
      if (!this.content) {
        return sweetError('输入不能为空');
      }
      visitUrl(`/e/log/exam?t=${this.t}&content=${this.content}`);
    },
  },
});

window.showIpInfo = showIpInfo;
