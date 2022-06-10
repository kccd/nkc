import Donation from '../donation/donation.vue';
import Share from '../../lib/vue/Share'
const donationApp = new Vue({
  el: '#donationApp',
  components: {
    donation: Donation,
    share: Share
  }
});
