import { getDataById } from '../../../lib/js/dataConversion';
import { timeFormat } from '../../../lib/js/time';
import { getUrl } from '../../../lib/js/tools';
const data = getDataById('data');
console.log(data);
const app = new window.Vue({
  el: '#app',
  data: {
    reviewLogs: data.reviewLogs,
    paging: data.paging,
    form: {
      type: data.type, // username, uid, id
      content: data.content,
    },
  },

  methods: {
    getUrl,
    timeFormat,
    search() {
      window.location.href =
        '/e/log/review?t=' +
        this.form.type +
        '&c=' +
        encodeURIComponent(this.form.content);
    },
  },
});
