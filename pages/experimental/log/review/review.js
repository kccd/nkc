import { getDataById } from '../../../lib/js/dataConversion';
import { detailedTime } from '../../../lib/js/time';
const data = getDataById('data');
console.log(data);
const app = new window.Vue({
  el: '#app',
  data: {
    reviewLogs: data.reviewLogs,
    paging: data.paging,
  },

  methods: {
    detailedTime,
  },
});
