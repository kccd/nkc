import { getDataById } from '../../../lib/js/dataConversion';
import { timeFormat } from '../../../lib/js/time';
import { getUrl } from '../../../lib/js/tools';
const data = getDataById('data');

const app = new window.Vue({
  el: '#app',
  data: {
    surveys: data.surveys,
  },
  methods: {
    timeFormat,
    getUrl,
    translateType(type) {
      switch (type) {
        case 'vote': {
          return '投票';
        }
        case 'survey': {
          return '问卷调查';
        }
        case 'score':
        default: {
          return '评分';
        }
      }
    },
  },
});
