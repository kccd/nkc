import { getDataById } from '../../../lib/js/dataConversion';
import { timeFormat } from '../../../lib/js/time';
import { getUrl } from '../../../lib/js/tools';
import { getAndShowIpDetail } from '../../../lib/js/ip';
const data = getDataById('data');

const app = new window.Vue({
  el: '#app',
  data: {
    radioLogs: data.radioLogs,
    form: {
      type: data.type || 'username',
      content: data.content || '',
    },
  },
  methods: {
    getUrl,
    getAndShowIpDetail,
    timeFormat,
    search() {
      const { type, content } = this.form;
      const params = new URLSearchParams();
      if (type && content) {
        params.set('t', type);
        params.set('c', content);
      }
      window.location.href = `/e/log/radio?${params.toString()}`;
    },
  },
});
