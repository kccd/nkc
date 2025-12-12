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
  },

  methods: {
    getUrl,
    timeFormat,
  },
});
