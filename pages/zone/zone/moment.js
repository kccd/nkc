import { getDataById } from '../../lib/js/dataConversion';
import Moments from '../../lib/vue/zone/Moments';
const momentElementId = 'ZoneMoments';
$(function () {
  const element = document.getElementById(momentElementId);
  if (element) {
    initMomentVueApp();
  }
});

function initMomentVueApp() {
  const { momentsData, permissions } = getDataById('data');
  const app = new Vue({
    el: `#${momentElementId}`,
    components: {
      moments: Moments,
    },
    data: {
      momentsData,
      permissions,
    },
  });
}
