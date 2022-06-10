import Share from '../../lib/vue/Share';
const element = document.getElementById('applicationFormShare');
if(element) {
  const app = new Vue({
    el: element,
    components: {
      share: Share
    }
  })
}
