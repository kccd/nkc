import Donation from './donation.vue';
const {
  fundId,
  money,
  refund
} = NKC.methods.getDataById('data');
const donationApp = new Vue({
  el: '#donationApp',
  data: {
    fundId,
    money,
    refund
  },
  components: {
    Donation
  }
});