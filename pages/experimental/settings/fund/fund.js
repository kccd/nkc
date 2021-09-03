const data = NKC.methods.getDataById('data');
const donation = data.fundSettings.donation
const {aliPay, wechatPay} = donation.payment;
aliPay._fee = aliPay.fee * 100;
wechatPay._fee = wechatPay.fee * 100;

donation.defaultMoney = donation.defaultMoney.map(m => (m / 100));

donation.min = donation.min / 100;
donation.max = donation.max / 100;

const app = new Vue({
  el: '#app',
  data: {
    fundSettings: data.fundSettings,
    defaultMoney: data.fundSettings.donation.defaultMoney.join(', ')
  },
  methods: {
    save() {
      const fundSettings = JSON.parse(JSON.stringify(this.fundSettings));
      const donation = fundSettings.donation;
      const {aliPay, wechatPay} = donation.payment;
      aliPay.fee = aliPay._fee / 100;
      wechatPay.fee = wechatPay._fee / 100;
      donation.min = donation.min * 100;
      donation.max = donation.max * 100;
      fundSettings.donation.defaultMoney = this.defaultMoney
        .replace(/[,，]/ig, ',')
        .split(',')
        .map(d => {
          d = Number(d.trim());
          if(isNaN(d)) d = null;
          return d * 100;
        })
        .filter(d => !!d);
      nkcAPI(`/e/settings/fund`, 'PUT', {fundSettings})
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    }
  }
});