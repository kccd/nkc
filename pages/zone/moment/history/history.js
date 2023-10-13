import { getDataById } from '../../../lib/js/dataConversion';
import History from '../../../lib/vue/zone/History';
const momentElementId = 'MomentHistory';
$(function () {
  const element = document.getElementById(momentElementId);
  if (element) {
    initHistoryVueApp();
  }
});

function initHistoryVueApp() {
  const {histories,mid}  = getDataById('historyData');
  const app = new Vue({
    el: `#${momentElementId}`,
    components: {
      history: History,
    },
    data: {
      histories:histories,
      mid:mid
    },
    mounted() {
      
    },
  });
}
