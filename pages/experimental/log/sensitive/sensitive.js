import Vue from 'vue';
import { getUrl } from '../../../lib/js/tools';
import { objToStr } from '../../../lib/js/tools';
import { detailedTime } from '../../../lib/js/time';
import { getDataById } from '../../../lib/js/dataConversion';
import { sweetError } from '../../../lib/js/sweetAlert';

const data = getDataById('data');
new Vue({
  el: '#app',
  data: {
    logs: data.logs,
    paging: data.paging,
  },
  methods: {
    detailedTime,
    getUrl,
    objToStr,
    viewErrorInfo(log) {
      sweetError(log.error);
    },
  },
});
