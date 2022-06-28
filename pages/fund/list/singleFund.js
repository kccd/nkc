import Donation from '../donation/donation.vue';
import Share from '../../lib/vue/Share'
import {RNSetSharePanelStatus} from "../../lib/js/reactNative";
import {shareTypes} from "../../lib/js/shareTypes";
const donationApp = new Vue({
  el: '#donationApp',
  components: {
    donation: Donation,
    share: Share
  }
});
var data = NKC.methods.getDataById("data");
$(function() {
  RNSetSharePanelStatus(true, shareTypes.fund, data._id);
});
